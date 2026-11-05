"""Behavioral tests for candidate safety, model selection, and the HTTP boundary."""

from __future__ import annotations

import http.client
import json
import threading
import unittest
from datetime import date, datetime, timedelta
from http.server import ThreadingHTTPServer
from unittest.mock import patch

import route_agent
import server


TODAY = date(2026, 11, 5)
CRITERIA = {"date": "2026-11-07", "arrival": "10:50", "pace": "easy"}
BUS = {
    "status": "live", "source": route_agent.BUS_SOURCE, "publishedAt": "2026-10", "checkedAt": "2026-11-05T10:00+09:00",
    "runs": [
        {"depart": "11:20", "arrive": "11:35", "returnDepart": "14:45", "returnArrive": "15:05"},
        {"depart": "14:30", "arrive": "14:45", "returnDepart": "17:55", "returnArrive": "18:15"},
    ],
}


class RouteAgentTests(unittest.TestCase):
    def test_criteria_rejects_bad_date_time_and_pace(self):
        for altered in (
            {"date": "2026-02-30"}, {"date": "2025-11-07"},
            {"arrival": "25:40"}, {"pace": "faster"},
        ):
            with self.subTest(altered=altered), self.assertRaises(route_agent.RouteInputError):
                route_agent.parse_criteria({**CRITERIA, **altered}, today=TODAY)

    def test_walk_minutes_is_validated_and_defaults_for_existing_clients(self):
        self.assertEqual(route_agent.parse_criteria(CRITERIA, today=TODAY)["walk_minutes"], 20)
        for value in (-1, 121, 20.5, True, "30"):
            with self.subTest(value=value), self.assertRaises(route_agent.RouteInputError):
                route_agent.parse_criteria({**CRITERIA, "walk_minutes": value}, today=TODAY)

    def test_walkable_public_attractions_are_added_with_estimate_disclosure(self):
        criteria = route_agent.parse_criteria({**CRITERIA, "walk_minutes": 20}, today=TODAY)
        attractions = [
            {"name": "와인터널", "latitude": 35.71513567, "longitude": 128.7205341},
            {"name": "가까운 관광지", "latitude": 35.716, "longitude": 128.721},
            {"name": "먼 관광지", "latitude": 35.58811543, "longitude": 128.7661723},
        ]
        candidates = route_agent.build_candidates(criteria, BUS["runs"], attractions)
        nearby = next(item for item in candidates if item.get("nearbyAttraction") == "가까운 관광지")
        self.assertLessEqual(nearby["walkingEstimate"]["oneWayMinutes"], 20)
        self.assertFalse(nearby["walkingEstimate"]["realPathVerified"])
        self.assertTrue(any("실제 보행 경로 미확인" in step["detail"] for step in nearby["steps"]))
        self.assertFalse(any(item.get("nearbyAttraction") == "먼 관광지" for item in candidates))

    def test_walk_budget_can_exclude_all_nearby_attractions(self):
        criteria = route_agent.parse_criteria({**CRITERIA, "walk_minutes": 1}, today=TODAY)
        attractions = [
            {"name": "와인터널", "latitude": 35.71513567, "longitude": 128.7205341},
            {"name": "가까운 관광지", "latitude": 35.716, "longitude": 128.721},
        ]
        candidates = route_agent.build_candidates(criteria, BUS["runs"], attractions)
        self.assertFalse(any(item.get("nearbyAttraction") for item in candidates))

    def test_transit_options_use_only_published_cheongdo_departures(self):
        criteria = route_agent.parse_criteria(CRITERIA, today=TODAY)
        route_tables = [
            {
                "route": "1번노선", "direction": "청도 화양 풍각행",
                "originCheongdo": True, "publishedAt": "2025-07",
                "departures": [{"depart": "11:09"}, {"depart": "12:10"}],
            },
            {
                "route": "1번노선", "direction": "풍각 화양 청도행",
                "originCheongdo": False, "publishedAt": "2025-07",
                "departures": [{"depart": "11:00"}],
            },
        ]
        options = route_agent.build_transit_options(criteria, route_tables)
        self.assertEqual([item["depart"] for item in options], ["12:10"])
        self.assertEqual(options[0]["waitMinutes"], 80)
        self.assertFalse(options[0]["realTime"])
        self.assertFalse(options[0]["returnVerified"])

    def test_route_recommendation_includes_all_route_schedule_options(self):
        transit_bus = {
            **BUS,
            "routes": [{
                "route": "1번노선", "direction": "청도 화양 풍각행",
                "originCheongdo": True, "publishedAt": "2025-07",
                "departures": [{"depart": "12:10"}],
            }],
        }
        result = route_agent.recommend(CRITERIA, transit_bus, {}, selector=lambda *_: None, today=TODAY)
        self.assertEqual(len(result["transitOptions"]), 1)
        self.assertEqual(result["transitOptions"][0]["route"], "1번노선")
        self.assertFalse(result["transitOptions"][0]["returnVerified"])

    def test_candidates_keep_source_times_and_safe_buffers(self):
        criteria = route_agent.parse_criteria(CRITERIA, today=TODAY)
        candidates = route_agent.build_candidates(criteria, BUS["runs"])
        self.assertTrue(candidates)
        self.assertEqual(candidates[0]["run"], BUS["runs"][0])
        self.assertEqual(candidates[0]["waitingMinutes"], 30)
        self.assertGreaterEqual(candidates[0]["returnBuffer"], 15)
        self.assertEqual(candidates[0]["steps"][-1]["time"], "14:45")

    def test_impossible_and_too_early_runs_are_excluded(self):
        criteria = route_agent.parse_criteria(CRITERIA, today=TODAY)
        runs = [
            {"depart": "11:05", "arrive": "11:20", "returnDepart": "14:45", "returnArrive": "15:05"},
            {"depart": "11:20", "arrive": "12:00", "returnDepart": "11:50", "returnArrive": "15:05"},
        ]
        self.assertEqual(route_agent.build_candidates(criteria, runs), [])

    def test_agent_can_only_select_existing_candidate(self):
        selected = route_agent.recommend(
            CRITERIA, BUS, {}, selector=lambda _criteria, candidates, _weather: candidates[-1]["id"], today=TODAY,
        )
        self.assertEqual(selected["agent"], {"engine": "copilot", "status": "used"})
        self.assertEqual(selected["plan"]["run"], BUS["runs"][-1])
        self.assertEqual(selected["source"]["realTime"], False)

    def test_invalid_agent_choice_falls_back_with_disclosure(self):
        result = route_agent.recommend(CRITERIA, BUS, {}, selector=lambda *_: "invented-route", today=TODAY)
        self.assertEqual(result["agent"], {"engine": "rules", "status": "invalid_output"})
        self.assertEqual(result["plan"]["run"], BUS["runs"][0])

    def test_agent_failure_falls_back(self):
        def fail(*_):
            raise TimeoutError("model timeout")

        result = route_agent.recommend(CRITERIA, BUS, {}, selector=fail, today=TODAY)
        self.assertEqual(result["agent"]["status"], "unavailable")
        self.assertEqual(result["plan"]["run"], BUS["runs"][0])

    def test_rain_favors_indoor_candidate_when_agent_fails(self):
        weather = {"status": "live", "hours": [{"time": "2026-11-07T11:00", "rainChance": 80}]}
        result = route_agent.recommend(CRITERIA, BUS, weather, selector=lambda *_: None, today=TODAY)
        self.assertEqual(result["plan"]["title"], "와인터널 중심 반나절")

    def test_no_usable_bus_never_calls_model(self):
        def fail(*_):
            self.fail("Model should not be called without a candidate")

        result = route_agent.recommend({**CRITERIA, "arrival": "18:00"}, BUS, {}, selector=fail, today=TODAY)
        self.assertEqual(result["status"], "no_route")
        self.assertIsNone(result["plan"]["run"])

    def test_model_output_is_strict_json(self):
        self.assertEqual(route_agent._parse_agent_choice('{"candidate_id":"1120-1445-full"}'), "1120-1445-full")
        self.assertEqual(route_agent._parse_agent_choice('```json\n{"candidate_id":"1120-1445-full"}\n```'), "1120-1445-full")
        self.assertIsNone(route_agent._parse_agent_choice('{"candidate_id":"x","fake_time":"12:00"}'))
        self.assertIsNone(route_agent._parse_agent_choice("1120-1445-full"))
        self.assertIsNone(route_agent._parse_agent_choice('```python\n{"candidate_id":"1120-1445-full"}\n```'))

    def test_coordinator_handoff_is_limited_to_available_specialists(self):
        self.assertEqual(
            route_agent._parse_specialist_choice('{"specialist":"weather"}', {"weather", "timetable"}),
            "weather",
        )
        self.assertEqual(
            route_agent._parse_specialist_choice('```json\n{"specialist":"timetable"}\n```', {"timetable"}),
            "timetable",
        )
        self.assertIsNone(route_agent._parse_specialist_choice('{"specialist":"weather"}', {"timetable"}))
        self.assertIsNone(route_agent._parse_specialist_choice('{"specialist":"shell"}', {"weather", "timetable"}))
        self.assertIsNone(route_agent._parse_specialist_choice('{"specialist":"weather","candidate_id":"x"}', {"weather"}))

    def test_selected_handoff_specialist_is_reported(self):
        result = route_agent.recommend(
            CRITERIA,
            BUS,
            {},
            selector=lambda _criteria, candidates, _weather: route_agent.AgentSelection(
                candidates[-1]["id"], "timetable",
            ),
            today=TODAY,
        )
        self.assertEqual(result["agent"], {"engine": "copilot", "status": "used", "specialist": "timetable"})

    def test_invalid_handoff_specialist_falls_back(self):
        result = route_agent.recommend(
            CRITERIA,
            BUS,
            {},
            selector=lambda _criteria, candidates, _weather: route_agent.AgentSelection(
                candidates[-1]["id"], "unknown",
            ),
            today=TODAY,
        )
        self.assertEqual(result["agent"], {"engine": "rules", "status": "invalid_output"})


class RouteApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=2)

    def post(self, body):
        connection = http.client.HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=5)
        connection.request("POST", "/api/route-recommendation", body=json.dumps(body), headers={"Content-Type": "application/json"})
        response = connection.getresponse()
        result = response.status, json.loads(response.read())
        connection.close()
        return result

    def post_receipt(self, body):
        connection = http.client.HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=5)
        connection.request("POST", "/api/receipt-ocr", body=json.dumps(body), headers={"Content-Type": "application/json"})
        response = connection.getresponse()
        result = response.status, json.loads(response.read())
        connection.close()
        return result

    def test_health_endpoint_is_independent_of_external_services(self):
        connection = http.client.HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=5)
        connection.request("GET", "/healthz")
        response = connection.getresponse()
        result = response.status, json.loads(response.read())
        connection.close()
        self.assertEqual(result, (200, {"status": "ok"}))

    def test_bus_schedule_parser_preserves_route_tables_and_effective_dates(self):
        html = """
        <div class="tab-con"><div class="title-box">
        <h2>1번노선 시간표</h2><p>2025.07. 현재</p></div>
        <table summary="청도 화양 풍각행"><tbody>
        <tr><th>순번</th><th>청도</th><th>화양</th></tr>
        <tr><th>1</th><td>07:20</td><td>07:30</td></tr>
        </tbody></table>
        <table summary="풍각 화양 청도행"><tbody>
        <tr><th>순번</th><th>풍각</th><th>청도</th></tr>
        <tr><th>1</th><td>08:00</td><td>08:10</td></tr>
        </tbody></table></div>
        """
        routes = server.parse_bus_routes(html)
        self.assertEqual(len(routes), 2)
        self.assertEqual(routes[0]["publishedAt"], "2025-07")
        self.assertTrue(routes[0]["originCheongdo"])
        self.assertEqual(routes[0]["departures"][0]["depart"], "07:20")
        self.assertFalse(routes[1]["originCheongdo"])

    def test_bus_schedule_endpoint_exposes_all_route_tables_without_live_location_claim(self):
        schedules = [{"route": "1번노선", "rows": [["1", "07:20"]]}]
        with patch("server.bus_schedule", return_value={
            "status": "live", "runs": [], "routes": schedules,
            "publishedAt": "2025-07", "checkedAt": "2026-11-05T14:00+09:00",
            "source": route_agent.BUS_SOURCE,
        }):
            connection = http.client.HTTPConnection("127.0.0.1", self.httpd.server_port, timeout=5)
            connection.request("GET", "/api/bus-schedule")
            response = connection.getresponse()
            status, data = response.status, json.loads(response.read())
            connection.close()
        self.assertEqual(status, 200)
        self.assertEqual(data["routes"], schedules)
        self.assertEqual(data["scope"], "all published city-bus timetable tables")
        self.assertFalse(data["realTime"])

    def test_azure_receipt_analyze_operation_is_polled_and_parsed(self):
        class Response:
            def __init__(self, status_code, payload=None, headers=None):
                self.status_code = status_code
                self.payload = payload or {}
                self.headers = headers or {}

            def raise_for_status(self):
                pass

            def json(self):
                return self.payload

        complete = {
            "status": "succeeded",
            "analyzeResult": {
                "content": "청도식당\n합계 12,500원",
                "documents": [{"fields": {
                    "MerchantName": {"valueString": "청도식당"},
                    "Total": {"valueCurrency": {"amount": 12500, "currencyCode": "KRW"}},
                }}],
            },
        }
        with patch.dict("server.os.environ", {
            "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT": "https://example.cognitiveservices.azure.com",
            "AZURE_DOCUMENT_INTELLIGENCE_KEY": "test-key",
        }), patch("server.requests.post", return_value=Response(
            202, headers={"Operation-Location": "https://example.cognitiveservices.azure.com/operations/test"},
        )) as post, patch("server.requests.get", return_value=Response(200, complete)) as get, \
             patch("server.time.sleep"):
            result = server.azure_receipt_ocr(b"image-bytes", "image/png")
        self.assertEqual(result["amount"], 12500)
        self.assertEqual(result["merchant"], "청도식당")
        self.assertEqual(post.call_args.kwargs["data"], b"image-bytes")
        self.assertEqual(post.call_args.kwargs["headers"]["Ocp-Apim-Subscription-Key"], "test-key")
        get.assert_called_once()

    def test_http_route_response_is_really_generated_by_backend(self):
        with patch("server.bus_schedule", return_value=BUS), patch("server.weather", return_value={}), patch.dict("route_agent.os.environ", {"ROUTE_AGENT_ENABLED": "0"}):
            next_date = datetime.now(route_agent.KST).date() + timedelta(days=2)
            status, data = self.post({**CRITERIA, "date": next_date.isoformat()})
        self.assertEqual(status, 200)
        self.assertEqual(data["plan"]["run"], BUS["runs"][0])
        self.assertEqual(data["agent"]["status"], "disabled")
        self.assertEqual(data["source"]["status"], "live")
        self.assertEqual(data["source"]["publishedAt"], BUS["publishedAt"])
        self.assertEqual(data["source"]["checkedAt"], BUS["checkedAt"])
        self.assertFalse(data["source"]["realTime"])

    def test_invalid_http_input_rejected_before_data_fetch(self):
        with patch("server.bus_schedule") as bus_fetch:
            status, _ = self.post({**CRITERIA, "arrival": "99:99"})
        self.assertEqual(status, 400)
        bus_fetch.assert_not_called()

    def test_invalid_walk_limit_is_rejected_before_data_fetch(self):
        with patch("server.bus_schedule") as bus_fetch, patch("server.attractions") as attraction_fetch:
            status, data = self.post({**CRITERIA, "walk_minutes": 121})
        self.assertEqual(status, 400)
        self.assertIn("도보 허용 시간", data["error"])
        bus_fetch.assert_not_called()
        attraction_fetch.assert_not_called()

    def test_date_beyond_one_year_is_rejected_before_data_fetch(self):
        too_late = (TODAY + timedelta(days=366)).isoformat()
        with patch("server.bus_schedule") as bus_fetch:
            status, data = self.post({**CRITERIA, "date": too_late})
        self.assertEqual(status, 400)
        self.assertIn("1년 이내", data["error"])
        bus_fetch.assert_not_called()

    def test_non_macos_receipt_ocr_explains_manual_entry_fallback(self):
        with patch("server.sys.platform", "linux"), patch.dict("server.os.environ", {}, clear=True):
            status, data = self.post_receipt({"image": "data:image/png;base64,aGVsbG8="})
        self.assertEqual(status, 503)
        self.assertIn("직접 입력", data["error"])

    def test_azure_receipt_ocr_is_used_on_non_macos(self):
        recognized = {
            "merchant": "청도식당", "amount": 12500, "date": "2026-11-05",
            "category": "식비", "recognizedFields": ["merchant", "amount", "date"],
            "rawText": "청도식당\n합계 12,500원", "provider": "azure_document_intelligence",
        }
        with patch("server.sys.platform", "linux"), \
             patch.dict("server.os.environ", {
                 "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT": "https://example.cognitiveservices.azure.com",
                 "AZURE_DOCUMENT_INTELLIGENCE_KEY": "test-key",
             }), \
             patch("server.azure_receipt_ocr", return_value=recognized) as recognize:
            status, data = self.post_receipt({
                "image": "data:image/png;base64,aGVsbG8=", "azureConsent": True,
            })
        self.assertEqual(status, 200)
        self.assertEqual(data["provider"], "azure_document_intelligence")
        self.assertEqual(data["amount"], 12500)
        self.assertIn("Azure", data["privacyNotice"])
        recognize.assert_called_once_with(b"hello", "image/png")

    def test_azure_receipt_image_is_not_transmitted_without_explicit_consent(self):
        with patch("server.sys.platform", "linux"), \
             patch.dict("server.os.environ", {
                 "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT": "https://example.cognitiveservices.azure.com",
                 "AZURE_DOCUMENT_INTELLIGENCE_KEY": "test-key",
             }), patch("server.azure_receipt_ocr") as recognize:
            status, data = self.post_receipt({"image": "data:image/png;base64,aGVsbG8="})
        self.assertEqual(status, 428)
        self.assertTrue(data["requiresAzureConsent"])
        self.assertIn("전송", data["privacyNotice"])
        recognize.assert_not_called()

    def test_document_intelligence_receipt_fields_override_text_guesses(self):
        result = server.parse_document_intelligence_result({
            "analyzeResult": {
                "content": "청도식당\n합계 10,000원",
                "documents": [{"fields": {
                    "MerchantName": {"valueString": "청도 식당"},
                    "TransactionDate": {"valueDate": "2026-11-04"},
                    "Total": {"valueCurrency": {"amount": 12500, "currencyCode": "KRW"}},
                }}],
            },
        })
        self.assertEqual(result["merchant"], "청도 식당")
        self.assertEqual(result["date"], "2026-11-04")
        self.assertEqual(result["amount"], 12500)
        self.assertEqual(result["provider"], "azure_document_intelligence")

    def test_document_intelligence_does_not_treat_foreign_currency_as_krw(self):
        result = server.parse_document_intelligence_result({
            "analyzeResult": {
                "content": "합계 12,500원",
                "documents": [{"fields": {
                    "Total": {"valueCurrency": {"amount": 12.5, "currencyCode": "USD"}},
                }}],
            },
        })
        self.assertIsNone(result["amount"])
        self.assertEqual(result["currencyCode"], "USD")

    def test_attractions_endpoint_returns_all_cheongdo_public_records(self):
        class Response:
            def raise_for_status(self):
                pass

            def json(self):
                return {"response": {"body": {"items": {"item": [
                    {"trrsrtNm": "와인터널", "rdnmadr": "경북 청도군 A", "latitude": "35.7", "longitude": "128.7"},
                    {"trrsrtNm": "관광지 A", "rdnmadr": "경북 청도군 B", "latitude": "35.8", "longitude": "128.8"},
                    {"trrsrtNm": "다른 지역", "rdnmadr": "경북 다른군 C"},
                ]}}}}

        with patch.dict("server.os.environ", {"PUBLIC_DATA_SERVICE_KEY": "test-key"}), \
             patch("server.cached", side_effect=lambda _key, _seconds, load: load()), \
             patch("server.requests.get", return_value=Response()) as get:
            result = server.attractions()

        self.assertEqual(result["status"], "live")
        self.assertEqual([item["name"] for item in result["items"]], ["와인터널", "관광지 A"])
        self.assertNotIn("trrsrtNm", get.call_args.kwargs["params"])
        self.assertNotIn("ctprvnNm", get.call_args.kwargs["params"])
        self.assertNotIn("signguNm", get.call_args.kwargs["params"])

    def test_attractions_endpoint_parses_actual_public_api_envelope(self):
        class Response:
            def raise_for_status(self):
                pass

            def json(self):
                return {"header": {"resultCode": "00", "resultMsg": "NORMAL SERVICE."},
                        "body": {"totalCount": 1, "items": {"item": [
                            {"trrsrtNm": "청도 관광지", "rdnmadr": "경북 청도군 A",
                             "latitude": "35.7", "longitude": "128.7"},
                        ]}}}

        with patch.dict("server.os.environ", {"PUBLIC_DATA_SERVICE_KEY": "test-key"}), \
             patch("server.cached", side_effect=lambda _key, _seconds, load: load()), \
             patch("server.requests.get", return_value=Response()):
            result = server.attractions()
        self.assertEqual(result["status"], "live")
        self.assertEqual(result["items"][0]["name"], "청도 관광지")


if __name__ == "__main__":
    unittest.main()
