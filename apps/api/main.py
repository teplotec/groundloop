from fastapi import FastAPI

from groundloop.models import SizingRequest, SizingResponse
from groundloop.sizing import calculate

app = FastAPI(
    title="TeploTEC GroundLoop API",
    version="0.1.0",
    description="Hydraulic sizing and geothermal design API for GroundLoop.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/calculate", response_model=SizingResponse)
def calculate_ground_loop(request: SizingRequest) -> SizingResponse:
    return calculate(request)
