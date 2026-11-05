from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_places_match_frontend_contract() -> None:
    response = client.get("/api/places")
    assert response.status_code == 200
    places = response.json()
    assert {place["id"] for place in places} == {"wine-tunnel", "rail-bike", "songgeum-village"}
    assert all(place["image_url"].startswith("/assets/") for place in places)


def test_recommendation_does_not_claim_unconfirmed_times() -> None:
    response = client.post(
        "/api/recommendations",
        json={"visit_date": "2026-11-07", "arrival_time": "10:50:00", "pace": "easy"},
    )
    assert response.status_code == 200
    recommendation = response.json()
    assert recommendation["schedule_confirmed"] is False
    assert recommendation["schedule_source"] == "공식 버스 시간표 미연동"
    assert all(stop["time"] is None for stop in recommendation["stops"])


def test_recommendation_validates_pace() -> None:
    response = client.post(
        "/api/recommendations",
        json={"visit_date": "2026-11-07", "arrival_time": "10:50:00", "pace": "fast"},
    )
    assert response.status_code == 422
