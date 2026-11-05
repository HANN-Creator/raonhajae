"""Turn locally recognized receipt text into editable expense suggestions."""

from __future__ import annotations

import re
from datetime import date


AMOUNT_RE = re.compile(r"(?<!\d)(?:[₩￦]\s*)?(\d{1,3}(?:,\d{3})+|\d{3,8})(?:\s*원)?(?!\d)")
DATE_RE = re.compile(r"(?<!\d)(20\d{2})\s*[./\-년]\s*(\d{1,2})\s*[./\-월]\s*(\d{1,2})")
SHORT_DATE_RE = re.compile(r"(?<!\d)(\d{2})[./\-](\d{1,2})[./\-](\d{1,2})(?!\d)")
MERCHANT_RE = re.compile(r"^(?:상호|가맹점명?|매장명?|업체명?|사용처|결제처|상점|판매자)\s*[:：]?\s*(.*)$")
TOTAL_TERMS = ("합계금액", "총결제금액", "결제금액", "승인금액", "실결제", "총액", "총금액", "결제 합계", "합계")
IGNORE_AMOUNT_TERMS = ("부가세", "세금", "공급가", "할인", "잔돈", "거스름", "사업자", "전화", "카드번호", "승인번호", "수량", "단가", "거래일시", "결제일시")
GENERIC_NAMES = ("영수증", "카드매출전표", "거래명세서", "결제완료", "결제 완료", "승인완료", "승인 완료", "매출전표", "카드결제", "카드 결제")

CATEGORY_WORDS = {
    "항공": ("항공", "비행기", "AIRLINES", "JEJU AIR", "티웨이", "에어부산"),
    "교통": ("버스", "택시", "기차", "철도", "KTX", "SRT", "주차", "교통", "톨게이트", "렌터카", "렌트카", "지하철"),
    "숙박": ("호텔", "모텔", "펜션", "민박", "게스트하우스", "리조트", "글램핑", "캠핑", "숙박"),
    "식비": ("식당", "카페", "커피", "음식", "밥", "국밥", "분식", "치킨", "베이커리", "맛집", "레스토랑", "편의점"),
    "쇼핑": ("쇼핑", "백화점", "마트", "기념품", "상점", "스토어", "올리브영"),
    "체험": ("레일바이크", "입장", "관람", "체험", "박물관", "와인터널", "테마파크"),
}


def read_date(lines: list[str]) -> str:
    for line in lines:
        match = DATE_RE.search(line) or SHORT_DATE_RE.search(line)
        if not match:
            continue
        year, month, day = map(int, match.groups())
        if year < 100:
            year += 2000
        try:
            return date(year, month, day).isoformat()
        except ValueError:
            continue
    return ""


def read_amount(lines: list[str]) -> int | None:
    ranked: list[tuple[float, int]] = []
    for index, line in enumerate(lines):
        compact = re.sub(r"\s+", "", line)
        previous = re.sub(r"\s+", "", lines[index - 1]) if index else ""
        for match in AMOUNT_RE.finditer(line):
            amount = int(match.group(1).replace(",", ""))
            if amount < 500 or amount > 100_000_000:
                continue
            has_total_context = any(term in compact or term in previous for term in TOTAL_TERMS)
            has_currency_format = any(symbol in line for symbol in ("원", "₩", "￦", ","))
            if not has_total_context and not has_currency_format:
                continue
            score = 0.0
            if any(term in compact for term in TOTAL_TERMS):
                score += 8
            elif "결제" in compact or "승인" in compact:
                score += 5
            elif any(term in previous for term in TOTAL_TERMS):
                score += 4
            if "원" in line or "₩" in line or "￦" in line:
                score += 2
            if "," in match.group(1):
                score += 1
            if any(term in compact for term in IGNORE_AMOUNT_TERMS):
                score -= 9
            if DATE_RE.search(line) or SHORT_DATE_RE.search(line):
                score -= 8
            score += index / max(len(lines), 1)
            ranked.append((score, amount))
    if not ranked:
        return None
    ranked.sort(key=lambda candidate: (candidate[0], candidate[1]), reverse=True)
    return ranked[0][1] if ranked[0][0] >= 0 else None


def read_merchant(lines: list[str]) -> str:
    for index, line in enumerate(lines[:15]):
        match = MERCHANT_RE.match(line.strip())
        if match:
            name = match.group(1).strip(" :：-")
            if not name and index + 1 < len(lines):
                name = lines[index + 1].strip()
            if name and not AMOUNT_RE.fullmatch(name):
                return name[:80]
    for line in lines[:8]:
        value = line.strip()
        compact = re.sub(r"\s+", "", value)
        if not re.search(r"[가-힣A-Za-z]", value):
            continue
        if len(value) < 2 or len(value) > 50:
            continue
        if any(term in compact for term in GENERIC_NAMES):
            continue
        if any(term in compact for term in ("일시", "날짜", "금액", "합계", "승인번호", "사업자", "전화")):
            continue
        if AMOUNT_RE.search(value) or DATE_RE.search(value) or SHORT_DATE_RE.search(value):
            continue
        return value[:80]
    return ""


def category_for(merchant: str, lines: list[str]) -> str:
    for text in (merchant, " ".join(lines[:12])):
        upper = text.upper()
        for category, words in CATEGORY_WORDS.items():
            if any(word.upper() in upper for word in words):
                return category
    return "기타"


def parse_receipt(observations: list[dict]) -> dict:
    lines = [str(item.get("text", "")).strip() for item in observations if str(item.get("text", "")).strip()]
    merchant = read_merchant(lines)
    amount = read_amount(lines)
    expense_date = read_date(lines)
    return {
        "merchant": merchant,
        "amount": amount,
        "date": expense_date,
        "category": category_for(merchant, lines),
        "recognizedFields": [field for field, value in (("merchant", merchant), ("amount", amount), ("date", expense_date)) if value],
        "rawText": "\n".join(lines)[:4000],
    }
