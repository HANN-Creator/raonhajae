"""Serve the trip prototype, public data, and local receipt recognition."""

from __future__ import annotations

import base64
import binascii
import json
import logging
import os
import re
import subprocess
import sys
import tempfile
import threading
import time
from datetime import date, datetime, timedelta
from html.parser import HTMLParser
from http.cookies import CookieError, SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse
from zoneinfo import ZoneInfo

import requests

import auth
from receipt_parser import category_for, parse_receipt
from route_agent import RouteInputError, parse_criteria, recommend


logger = logging.getLogger(__name__)
ROOT = Path(__file__).resolve().parent
REACT_DIST = ROOT / "frontend" / "dist"
STATIC_ROOT = REACT_DIST if (REACT_DIST / "index.html").exists() and os.environ.get("LEGACY_FRONTEND") != "1" else ROOT
BUS_URL = "https://www.cheongdo.go.kr/traffic/contents/01/bus/bus_time.jsp"
ATTRACTION_URL = "https://api.data.go.kr/openapi/tn_pubr_public_trrsrt_api"
ATTRACTION_SOURCE = "https://www.data.go.kr/data/15021141/standard.do"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
WEATHER_SOURCE = "https://open-meteo.com/en/docs"
KST = ZoneInfo("Asia/Seoul")

FALLBACK_RUNS = [
    {"depart": "11:20", "arrive": "11:35", "returnDepart": "14:45", "returnArrive": "15:05"},
    {"depart": "14:30", "arrive": "14:45", "returnDepart": "17:55", "returnArrive": "18:15"},
]
ATTRACTION_SNAPSHOT = [
    {
        "name": "와인터널",
        "address": "경상북도 청도군 화양읍 송금길 100",
        "latitude": 35.71513567,
        "longitude": 128.7205341,
        "phone": "054-371-1904",
        "referenceDate": "2026-07-23",
        "description": "감와인 숙성저장고로 활용하는 옛 철도 터널",
    },
    {
        "name": "청도레일바이크",
        "address": "경상북도 청도군 청도읍 하지길 46-51",
        "latitude": 35.58811543,
        "longitude": 128.7661723,
        "phone": "054-373-2426",
        "referenceDate": "2026-07-23",
        "description": "청도천변 옛 철길을 활용한 왕복 5km 레일바이크",
    },
]

_cache: dict[str, tuple[float, dict]] = {}
_cache_lock = threading.Lock()


def cached(key: str, seconds: int, load):
    with _cache_lock:
        entry = _cache.get(key)
        if entry and entry[0] > time.monotonic():
            return entry[1]
    value = load()
    with _cache_lock:
        _cache[key] = (time.monotonic() + seconds, value)
    return value


class Tables(HTMLParser):
    """Read cell text from HTML tables without depending on page-specific CSS."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.rows: list[list[str]] = []
        self.row: list[str] | None = None
        self.cell: list[str] | None = None

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.depth += 1
        elif self.depth and tag == "tr":
            self.row = []
        elif self.depth and tag in {"td", "th"} and self.row is not None:
            self.cell = []

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag in {"td", "th"} and self.cell is not None and self.row is not None:
            self.row.append(" ".join(" ".join(self.cell).split()))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            self.rows.append(self.row)
            self.row = None
        elif tag == "table" and self.depth:
            self.depth -= 1


class BusRouteTables(HTMLParser):
    """Extract route tables and their publication dates from the county page."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.routes: list[dict] = []
        self.route: dict | None = None
        self.table: dict | None = None
        self.row: list[str] | None = None
        self.cell: list[str] | None = None
        self.capture: str | None = None
        self.capture_text: list[str] = []
        self.route_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "div" and "tab-con" in classes:
            self.route = {"title": "", "publishedAt": None, "tables": []}
            self.route_depth = 1
        elif tag == "div" and self.route is not None:
            self.route_depth += 1
        elif tag == "h2" and self.route is not None:
            self.capture = "title"
            self.capture_text = []
        elif tag == "p" and self.route is not None and self.route["publishedAt"] is None:
            self.capture = "published"
            self.capture_text = []
        elif tag == "table" and self.route is not None:
            self.table = {"summary": attrs.get("summary", ""), "rows": []}
        elif tag == "tr" and self.table is not None:
            self.row = []
        elif tag in {"td", "th"} and self.row is not None:
            self.cell = []

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)
        elif self.capture is not None:
            self.capture_text.append(data)

    def handle_endtag(self, tag):
        if tag in {"td", "th"} and self.cell is not None and self.row is not None:
            self.row.append(" ".join(" ".join(self.cell).split()))
            self.cell = None
        elif tag == "tr" and self.row is not None and self.table is not None:
            self.table["rows"].append(self.row)
            self.row = None
        elif tag == "table" and self.table is not None and self.route is not None:
            self.route["tables"].append(self.table)
            self.table = None
        elif tag in {"h2", "p"} and self.capture is not None:
            value = " ".join(" ".join(self.capture_text).split())
            if self.capture == "title" and self.route is not None:
                self.route["title"] = value
            elif self.capture == "published" and self.route is not None:
                match = re.search(r"(\d{4})\.(\d{1,2})\.\s*현재", value)
                if match:
                    self.route["publishedAt"] = f"{match.group(1)}-{int(match.group(2)):02d}"
            self.capture = None
            self.capture_text = []
        elif tag == "div" and self.route is not None:
            self.route_depth -= 1
            if self.route_depth == 0:
                if self.route["title"] and self.route["tables"]:
                    self.routes.append(self.route)
                self.route = None


def minute_value(value: str) -> int:
    hour, minute = map(int, value.split(":"))
    return hour * 60 + minute


def first_time(value: str) -> str | None:
    match = re.search(r"\b(\d{1,2}):(\d{2})\b", value)
    if not match:
        return None
    return f"{int(match.group(1)):02d}:{match.group(2)}"


def parse_bus_schedule(html: str) -> tuple[list[dict[str, str]], str | None]:
    parser = Tables()
    parser.feed(html)
    trips = []
    for row in parser.rows:
        if len(row) != 10 or "남성현(와인)" not in row[4] or "와인터널" not in row[5]:
            continue
        depart = first_time(row[1])
        arrive = first_time(row[4])
        return_depart = first_time(row[6])
        return_arrive = first_time(row[9])
        if all((depart, arrive, return_depart, return_arrive)):
            trips.append(
                {
                    "depart": depart,
                    "arrive": arrive,
                    "returnDepart": return_depart,
                    "returnArrive": return_arrive,
                }
            )

    returns = sorted(trips, key=lambda trip: minute_value(trip["returnDepart"]))
    runs = []
    for outbound in trips:
        arrival_minute = minute_value(outbound["arrive"])
        if not minute_value("09:30") <= arrival_minute <= minute_value("16:00"):
            continue
        inbound = next(
            (
                trip for trip in returns if minute_value(trip["returnDepart"]) - arrival_minute >= 190),
            None,
        )
        if inbound:
            runs.append(
                {
                    "depart": outbound["depart"],
                    "arrive": outbound["arrive"],
                    "returnDepart": inbound["returnDepart"],
                    "returnArrive": inbound["returnArrive"],
                }
            )
    runs.sort(key=lambda run: minute_value(run["depart"]))

    title_index = html.find("7번노선 시간표")
    nearby = html[title_index : title_index + 500] if title_index >= 0 else ""
    published = re.search(r"(\d{4})\.(\d{1,2})\.\s*현재", nearby)
    published_at = f"{published.group(1)}-{int(published.group(2)):02d}" if published else None
    return runs, published_at


def parse_bus_routes(html: str) -> list[dict]:
    parser = BusRouteTables()
    parser.feed(html)
    routes = []
    for route in parser.routes:
        route_name = route["title"].split("시간표", 1)[0].strip()
        for table_index, table in enumerate(route["tables"]):
            direction = table["summary"]
            rows = table["rows"]
            if not rows:
                continue
            departures = []
            for row in rows:
                for cell_index, cell in enumerate(row):
                    departure = first_time(cell)
                    if departure:
                        departures.append({
                            "depart": departure,
                            "row": row,
                            "cellIndex": cell_index,
                        })
                        break
            routes.append({
                "route": route_name,
                "title": route["title"],
                "publishedAt": route["publishedAt"],
                "direction": direction,
                "table": table_index + 1,
                "originCheongdo": bool(re.match(r"^\s*(?:순번\s*)?청도(?:\s|출발|에서|→|-)", direction)),
                "departures": departures,
                "rows": rows,
            })
    return routes


def bus_schedule() -> dict:
    def load():
        try:
            response = requests.get(BUS_URL, timeout=10)
            response.raise_for_status()
            runs, published_at = parse_bus_schedule(response.text)
            routes = parse_bus_routes(response.text)
            if not routes:
                raise ValueError("No route tables in official timetable")
            return {
                "status": "live",
                "runs": runs,
                "routes": routes,
                "publishedAt": published_at,
                "checkedAt": datetime.now(KST).isoformat(timespec="minutes"),
                "source": BUS_URL,
            }
        except (requests.RequestException, ValueError) as error:
            logger.warning("Bus schedule fallback used (%s)", type(error).__name__)
            return {
                "status": "fallback",
                "runs": FALLBACK_RUNS,
                "routes": [],
                "publishedAt": "2025-07",
                "checkedAt": None,
                "source": BUS_URL,
            }

    return cached("bus", 30 * 60, load)


def parse_document_intelligence_result(payload: dict) -> dict:
    if not isinstance(payload, dict) or not isinstance(payload.get("analyzeResult"), dict):
        raise ValueError("Invalid Azure receipt result")
    analysis = payload["analyzeResult"]
    documents = analysis.get("documents", [])
    fields = documents[0].get("fields", {}) if isinstance(documents, list) and documents else {}
    if not isinstance(fields, dict):
        fields = {}

    def field_value(*names):
        for name in names:
            field = fields.get(name, {})
            if not isinstance(field, dict):
                continue
            for key in ("valueString", "valueDate", "valueNumber"):
                if field.get(key) is not None:
                    return field[key]
            currency = field.get("valueCurrency")
            if isinstance(currency, dict) and currency.get("amount") is not None:
                return currency
        return None

    content = analysis.get("content", "")
    if not isinstance(content, str):
        content = ""
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    parsed = parse_receipt([{"text": line} for line in lines])
    merchant = field_value("MerchantName", "Merchant")
    transaction_date = field_value("TransactionDate", "TransactionTime")
    total = field_value("Total", "TotalAmount", "AmountDue")
    currency_code = None
    amount = None
    if isinstance(total, dict):
        currency_code = total.get("currencyCode")
        currency_amount = total.get("amount")
        if currency_amount is not None and currency_code in (None, "KRW"):
            amount = round(float(currency_amount))
    elif total is not None:
        try:
            amount = round(float(total))
        except (TypeError, ValueError):
            amount = None
    if transaction_date:
        try:
            transaction_date = date.fromisoformat(str(transaction_date)[:10]).isoformat()
        except ValueError:
            transaction_date = parsed["date"]
    merchant_text = str(merchant).strip()[:80] if merchant else parsed["merchant"]
    return {
        **parsed,
        "merchant": merchant_text,
        "amount": amount if amount is not None else (
            None if currency_code not in (None, "KRW") else parsed["amount"]
        ),
        "date": transaction_date or parsed["date"],
        "category": category_for(merchant_text, lines),
        "recognizedFields": [
            field for field, value in (
                ("merchant", merchant or parsed["merchant"]),
                ("amount", amount if amount is not None else (
                    None if currency_code not in (None, "KRW") else parsed["amount"]
                )),
                ("date", transaction_date or parsed["date"]),
            ) if value is not None and value != ""
        ],
        "currencyCode": currency_code,
        "rawText": content[:4000],
        "provider": "azure_document_intelligence",
    }


def azure_receipt_ocr(image: bytes, content_type: str) -> dict:
    endpoint = os.environ.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT", "").strip().rstrip("/")
    key = os.environ.get("AZURE_DOCUMENT_INTELLIGENCE_KEY", "").strip()
    if not endpoint or not key:
        raise RuntimeError("Azure Document Intelligence is not configured")
    if not re.match(r"^https://[^/]+$", endpoint):
        raise ValueError("Invalid Azure Document Intelligence endpoint")
    analyze_url = f"{endpoint}/documentintelligence/documentModels/prebuilt-receipt:analyze"
    response = requests.post(
        analyze_url,
        params={"api-version": "2024-11-30"},
        headers={"Ocp-Apim-Subscription-Key": key, "Content-Type": content_type},
        data=image,
        timeout=20,
    )
    response.raise_for_status()
    if response.status_code == 200:
        return parse_document_intelligence_result(response.json())
    operation_url = response.headers.get("Operation-Location")
    if not operation_url or not operation_url.startswith(endpoint + "/"):
        raise ValueError("Azure receipt analysis did not provide a valid operation URL")
    deadline = time.monotonic() + 40
    while time.monotonic() < deadline:
        time.sleep(1)
        operation = requests.get(
            operation_url,
            headers={"Ocp-Apim-Subscription-Key": key},
            timeout=10,
        )
        operation.raise_for_status()
        result = operation.json()
        status = result.get("status")
        if status == "succeeded":
            return parse_document_intelligence_result(result)
        if status in {"failed", "canceled"}:
            raise ValueError("Azure receipt analysis failed")
    raise TimeoutError("Azure receipt analysis timed out")


def weather(travel_date: str) -> dict:
    try:
        chosen = date.fromisoformat(travel_date)
    except (TypeError, ValueError):
        return {"status": "invalid_date", "source": WEATHER_SOURCE}
    today = datetime.now(KST).date()
    if chosen < today or chosen > today + timedelta(days=15):
        return {"status": "out_of_range", "source": WEATHER_SOURCE}

    def load():
        try:
            response = requests.get(
                WEATHER_URL,
                params={
                    "latitude": 35.71513567,
                    "longitude": 128.7205341,
                    "hourly": "temperature_2m,precipitation_probability,weather_code",
                    "timezone": "Asia/Seoul",
                    "start_date": travel_date,
                    "end_date": travel_date,
                },
                timeout=10,
            )
            response.raise_for_status()
            hourly = response.json().get("hourly", {})
            times = hourly.get("time", [])
            temperatures = hourly.get("temperature_2m", [])
            rain = hourly.get("precipitation_probability", [])
            codes = hourly.get("weather_code", [])
            if not times or not (len(times) == len(temperatures) == len(rain) == len(codes)):
                raise ValueError("Incomplete forecast")
            return {
                "status": "live",
                "date": travel_date,
                "hours": [
                    {"time": time_label, "temperature": temperature, "rainChance": chance, "code": code}
                    for time_label, temperature, chance, code in zip(times, temperatures, rain, codes)
                ],
                "checkedAt": datetime.now(KST).isoformat(timespec="minutes"),
                "source": WEATHER_SOURCE,
            }
        except (requests.RequestException, ValueError, TypeError, json.JSONDecodeError) as error:
            logger.warning("Weather forecast unavailable (%s)", type(error).__name__)
            return {"status": "unavailable", "date": travel_date, "source": WEATHER_SOURCE}

    return cached(f"weather:{travel_date}", 20 * 60, load)


def api_items(payload: dict) -> list[dict]:
    response = payload.get("response", payload)
    if not isinstance(response, dict):
        return []
    body = response.get("body", {})
    if not isinstance(body, dict):
        return []
    items = body.get("items", [])
    if isinstance(items, dict):
        items = items.get("item", [])
    if isinstance(items, dict):
        items = [items]
    return items if isinstance(items, list) else []


def attractions() -> dict:
    key = os.environ.get("PUBLIC_DATA_SERVICE_KEY", "").strip()
    if not key:
        return {"status": "key_required", "items": ATTRACTION_SNAPSHOT, "source": ATTRACTION_SOURCE}

    def load():
        try:
            page_number = 1
            page_size = 1000
            records = []
            total_count = None
            while total_count is None or len(records) < total_count:
                response = requests.get(
                    ATTRACTION_URL,
                    params={
                        "serviceKey": unquote(key),
                        "pageNo": page_number,
                        "numOfRows": page_size,
                        "type": "json",
                    },
                    timeout=10,
                )
                response.raise_for_status()
                payload = response.json()
                envelope = payload.get("response", payload) if isinstance(payload, dict) else {}
                header = envelope.get("header", {}) if isinstance(envelope, dict) else {}
                result_code = header.get("resultCode")
                if result_code not in (None, "00", "0000"):
                    raise ValueError(f"Attraction API error ({result_code})")
                body = envelope.get("body", {}) if isinstance(envelope, dict) else {}
                if not isinstance(body, dict):
                    raise ValueError("Invalid attraction API response")
                if total_count is None:
                    total_count_value = body.get("totalCount")
                    total_count = int(total_count_value) if total_count_value is not None else None
                page_items = api_items(payload)
                records.extend(page_items)
                if len(page_items) < page_size or not page_items:
                    break
                page_number += 1
            live_items = []
            seen = set()
            for item in records:
                if not isinstance(item, dict):
                    continue
                address = str(item.get("rdnmadr") or item.get("lnmadr") or "")
                if "청도군" not in address and item.get("signguNm") != "청도군":
                    continue
                name = str(item.get("trrsrtNm") or "").strip()
                if not name or (name, address) in seen:
                    continue
                seen.add((name, address))
                live_items.append(
                    {
                        "name": name,
                        "address": address,
                        "latitude": item.get("latitude"),
                        "longitude": item.get("longitude"),
                        "phone": item.get("phoneNumber", ""),
                        "referenceDate": item.get("referenceDate", ""),
                        "description": item.get("trrsrtIntrcn", ""),
                    }
                )
            if not live_items:
                raise ValueError("No Cheongdo attractions in public data response")
            return {
                "status": "live",
                "items": live_items,
                "checkedAt": datetime.now(KST).isoformat(timespec="minutes"),
                "source": ATTRACTION_SOURCE,
            }
        except (requests.RequestException, ValueError, TypeError, json.JSONDecodeError) as error:
            logger.warning("Attraction data fallback used (%s)", type(error).__name__)
            return {"status": "api_unavailable", "items": ATTRACTION_SNAPSHOT, "source": ATTRACTION_SOURCE}

    return cached("attractions", 6 * 60 * 60, load)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_ROOT), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/healthz":
            return self.send_json({"status": "ok"})
        if parsed.path == "/api/bus-schedule":
            schedule = bus_schedule()
            return self.send_json({
                **schedule,
                "scope": "all published city-bus timetable tables",
                "realTime": False,
            })
        if parsed.path == "/api/attractions":
            return self.send_json(attractions())
        if parsed.path == "/api/auth/me":
            user = auth.current_user(self.session_token())
            return self.send_json({"user": user} if user else {"error": "로그인이 필요해요."}, 200 if user else 401)
        if parsed.path == "/api/weather":
            travel_date = parse_qs(parsed.query).get("date", [""])[0]
            return self.send_json(weather(travel_date))
        return super().do_GET()

    def do_POST(self):
        endpoint = urlparse(self.path).path
        if endpoint.startswith("/api/auth/"):
            return self.handle_auth(endpoint)
        if endpoint == "/api/route-recommendation":
            length_header = self.headers.get("Content-Length", "")
            if not length_header.isdigit() or int(length_header) > 4096:
                return self.send_json({"error": "여행 조건을 확인해 주세요."}, 400)
            try:
                payload = json.loads(self.rfile.read(int(length_header)))
                if not isinstance(payload, dict):
                    raise RouteInputError("여행 조건을 확인해 주세요.")
                # Validate before making any network or model request.
                criteria = parse_criteria(payload)
            except (ValueError, TypeError) as error:
                return self.send_json({"error": str(error) if isinstance(error, RouteInputError) else "여행 조건을 확인해 주세요."}, 400)
            result = recommend(
                criteria,
                bus_schedule(),
                weather(criteria["date"]),
                attraction_data=attractions(),
            )
            logger.info(
                "Route recommendation completed (engine=%s, status=%s)",
                result["agent"]["engine"],
                result["agent"]["status"],
            )
            return self.send_json(result)

        if endpoint != "/api/receipt-ocr":
            return self.send_json({"error": "지원하지 않는 요청입니다."}, 404)
        length_header = self.headers.get("Content-Length", "")
        if not length_header.isdigit():
            return self.send_json({"error": "이미지 크기를 확인할 수 없습니다."}, 400)
        length = int(length_header)
        if length > 12_000_000:
            return self.send_json({"error": "사진은 8MB 이하로 올려주세요."}, 413)
        try:
            payload = json.loads(self.rfile.read(length))
            image_data = payload.get("image", "")
            match = re.fullmatch(r"data:image/(jpeg|png|webp|heic|heif);base64,([A-Za-z0-9+/=]+)", image_data)
            if not match:
                return self.send_json({"error": "JPG, PNG, WebP 또는 HEIC 사진을 올려주세요."}, 400)
            image = base64.b64decode(match.group(2), validate=True)
            if not image or len(image) > 8_000_000:
                return self.send_json({"error": "사진은 8MB 이하로 올려주세요."}, 413)
        except (ValueError, TypeError, AttributeError, binascii.Error):
            return self.send_json({"error": "사진을 읽지 못했습니다. 다른 파일로 다시 시도해 주세요."}, 400)

        image_type = match.group(1)
        mime_type = "image/jpeg" if image_type == "jpeg" else f"image/{image_type}"
        azure_configured = bool(
            os.environ.get("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT", "").strip()
            and os.environ.get("AZURE_DOCUMENT_INTELLIGENCE_KEY", "").strip()
        )
        azure_consent = payload.get("azureConsent") is True
        if azure_configured and azure_consent:
            try:
                parsed = azure_receipt_ocr(image, mime_type)
                parsed["status"] = "recognized" if parsed["recognizedFields"] else "no_text"
                parsed["privacyNotice"] = "영수증 이미지가 Azure AI Document Intelligence로 전송되어 분석됩니다."
                return self.send_json(parsed)
            except (requests.RequestException, TimeoutError) as error:
                logger.warning("Azure receipt recognition unavailable (%s)", type(error).__name__)
                return self.send_json({"error": "Azure 영수증 인식에 연결하지 못했습니다. 다시 시도하거나 직접 입력해 주세요."}, 503)
            except (ValueError, TypeError, json.JSONDecodeError) as error:
                logger.warning("Azure receipt recognition failed (%s)", type(error).__name__)
                return self.send_json({"error": "Azure가 영수증을 읽지 못했습니다. 직접 입력해 주세요."}, 422)
        if azure_configured and not azure_consent and sys.platform != "darwin":
            return self.send_json({
                "error": "Azure OCR로 사진을 보내려면 명시적 동의가 필요합니다. 직접 입력하거나 동의 후 다시 시도해 주세요.",
                "provider": "azure_document_intelligence",
                "requiresAzureConsent": True,
                "privacyNotice": "영수증 이미지와 인식 내용이 Azure AI Document Intelligence로 전송됩니다.",
            }, 428)
        if sys.platform != "darwin":
            return self.send_json({"error": "Azure OCR 설정이 없고 이 서버에서는 macOS Vision을 사용할 수 없습니다. 직접 입력해 주세요."}, 503)
        suffix = ".jpg" if image_type == "jpeg" else f".{image_type}"
        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temporary:
                temporary.write(image)
                temporary_path = temporary.name
            result = subprocess.run(
                ["/usr/bin/swift", str(ROOT / "receipt_ocr.swift"), temporary_path],
                capture_output=True, text=True, timeout=40, check=False,
            )
            if result.returncode != 0:
                return self.send_json({"error": "사진에서 글자를 읽지 못했습니다. 직접 입력해 주세요."}, 422)
            observations = json.loads(result.stdout)
            if not isinstance(observations, list):
                raise ValueError("Unexpected recognition result")
            parsed = parse_receipt(observations)
            parsed["status"] = "recognized" if parsed["rawText"] else "no_text"
            parsed["provider"] = "apple_vision"
            return self.send_json(parsed)
        except (subprocess.TimeoutExpired, OSError, ValueError, json.JSONDecodeError):
            return self.send_json({"error": "사진 인식이 지연되었습니다. 다시 시도하거나 직접 입력해 주세요."}, 503)
        finally:
            if temporary_path:
                Path(temporary_path).unlink(missing_ok=True)

    def session_token(self) -> str | None:
        try:
            morsel = SimpleCookie(self.headers.get("Cookie", "")).get(auth.SESSION_COOKIE)
        except CookieError:
            return None
        return morsel.value if morsel else None

    def handle_auth(self, endpoint: str):
        # JSON-only + SameSite=Lax cookie: a cross-site HTML form can't send application/json, which blocks CSRF.
        if not self.headers.get("Content-Type", "").startswith("application/json"):
            return self.send_json({"error": "JSON 요청만 받을 수 있어요."}, 415)
        length_header = self.headers.get("Content-Length", "0")
        if not length_header.isdigit() or int(length_header) > 4096:
            return self.send_json({"error": "요청을 확인해 주세요."}, 400)
        try:
            payload = json.loads(self.rfile.read(int(length_header)) or b"{}")
            if not isinstance(payload, dict):
                raise ValueError
        except ValueError:
            return self.send_json({"error": "요청을 확인해 주세요."}, 400)
        secure = os.environ.get("COOKIE_SECURE") == "1"
        try:
            if endpoint == "/api/auth/signup":
                user, token = auth.signup(payload)
                logger.info("Account created (id=%s)", user["id"])
                return self.send_json({"user": user}, 201, {"Set-Cookie": auth.session_cookie(token, secure)})
            if endpoint == "/api/auth/login":
                user, token = auth.login(payload, client=self.client_address[0])
                return self.send_json({"user": user}, 200, {"Set-Cookie": auth.session_cookie(token, secure)})
            if endpoint == "/api/auth/logout":
                auth.logout(self.session_token())
                return self.send_json({"ok": True}, 200, {"Set-Cookie": auth.clear_cookie(secure)})
        except auth.AuthError as error:
            body = {"error": str(error)}
            if error.field:
                body["field"] = error.field
            return self.send_json(body, error.status)
        return self.send_json({"error": "지원하지 않는 요청입니다."}, 404)

    def send_json(self, payload, status=200, headers: dict[str, str] | None = None):
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8766"))
    host = os.environ.get("HOST", "127.0.0.1")
    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    with ThreadingHTTPServer((host, port), Handler) as server:
        print(f"Cheongdo trip planner: http://{host}:{port}/", flush=True)
        server.serve_forever()
