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

    def test_date_beyond_one_year_is_rejected_before_data_fetch(self):
        too_late = (TODAY + timedelta(days=366)).isoformat()
        with patch("server.bus_schedule") as bus_fetch:
            status, data = self.post({**CRITERIA, "date": too_late})
        self.assertEqual(status, 400)
        self.assertIn("1년 이내", data["error"])
        bus_fetch.assert_not_called()

    def test_non_macos_receipt_ocr_explains_manual_entry_fallback(self):
        with patch("server.sys.platform", "linux"):
            status, data = self.post_receipt({"image": "data:image/png;base64,aGVsbG8="})
        self.assertEqual(status, 503)
        self.assertIn("직접 입력", data["error"])


if __name__ == "__main__":
    unittest.main()
