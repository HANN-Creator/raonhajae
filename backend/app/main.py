from __future__ import annotations

from datetime import date, time
from typing import Literal, Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="청도 한바퀴 API", version="0.1.0")


class Place(BaseModel):
    id: str
    name: str
    category: Literal["체험", "볼거리", "산책"]
    description: str
    area: str
    image_url: str
    tags: list[str]


class TripRequest(BaseModel):
    visit_date: date
    arrival_time: time
    pace: Literal["easy", "slow"]


class RouteStop(BaseModel):
    title: str
    description: str
    time: Optional[str] = None


class Recommendation(BaseModel):
    title: str
    summary: str
    schedule_confirmed: bool
    schedule_source: Optional[str] = None
    stops: list[RouteStop]


PLACES = [
    Place(
        id="wine-tunnel",
        name="와인터널",
        category="볼거리",
        description="옛 철도 터널 · 감와인 숙성 공간",
        area="화양읍",
        image_url="/assets/1dc7d20f-3da6-4fa3-9ea8-ccad9a3ab29e/9b617.png",
        tags=["실내", "감와인"],
    ),
    Place(
        id="rail-bike",
        name="청도 레일바이크",
        category="체험",
        description="청도천변 옛 철길을 따라 달리는 체험",
        area="청도읍",
        image_url="/assets/63074331-c5ab-4c65-8481-c6e91566771a/510c6.png",
        tags=["가족 여행", "야외"],
    ),
    Place(
        id="songgeum-village",
        name="송금마을",
        category="산책",
        description="와인터널 코스와 함께 둘러보기 좋은 마을",
        area="화양읍",
        image_url="/assets/63074331-c5ab-4c65-8481-c6e91566771a/d5555.png",
        tags=["마을 산책", "로컬"],
    ),
]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/places", response_model=list[Place])
def get_places() -> list[Place]:
    return PLACES


@app.post("/api/recommendations", response_model=Recommendation)
def create_recommendation(request: TripRequest) -> Recommendation:
    pace = "여유롭게" if request.pace == "slow" else "가볍게"
    return Recommendation(
        title="와인터널·송금마을 반나절",
        summary=f"{request.visit_date:%m월 %d일} · {request.arrival_time:%H:%M} 도착 · {pace} 둘러보기 예시",
        schedule_confirmed=False,
        schedule_source="공식 버스 시간표 미연동",
        stops=[
            RouteStop(
                title="청도역에서 출발 준비",
                description="정류장 위치와 당일 운행 정보를 확인하세요.",
            ),
            RouteStop(
                title="와인터널 둘러보기",
                description="운영시간과 입장 정보를 방문 전에 확인하세요.",
            ),
            RouteStop(
                title="송금마을 산책",
                description="마을까지 이동 방법과 도보 시간을 현장에서 확인하세요.",
            ),
            RouteStop(
                title="청도역으로 돌아오기",
                description="귀환 교통편은 청도군 공식 시간표에서 확인하세요.",
            ),
        ],
    )
