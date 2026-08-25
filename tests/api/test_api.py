from fastapi.testclient import TestClient

from apps.api.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_calculate_rejects_impossible_pipe_geometry() -> None:
    response = client.post(
        "/v1/calculate",
        json={
            "total_flow_m3_h": 2.4,
            "borefield": {
                "boreholes": 5,
                "depth_m": 61,
                "header_run_m": 12,
                "configuration": "single_u",
            },
            "fluid": {
                "id": "reference",
                "label": "Reference",
                "density_kg_m3": 1000,
                "dynamic_viscosity_pa_s": 0.001,
                "temperature_c": 20,
                "concentration_percent": 0,
            },
            "pipe_candidates": [
                {
                    "id": "bad",
                    "label": "Bad pipe",
                    "material": "PE100-RC",
                    "outer_diameter_mm": 32,
                    "wall_thickness_mm": 16,
                }
            ],
        },
    )

    assert response.status_code == 422


def test_calculate_returns_stable_contract() -> None:
    response = client.post(
        "/v1/calculate",
        json={
            "total_flow_m3_h": 2.4,
            "borefield": {
                "boreholes": 5,
                "depth_m": 61,
                "header_run_m": 12,
                "configuration": "single_u",
            },
            "fluid": {
                "id": "reference",
                "label": "Reference",
                "density_kg_m3": 1000,
                "dynamic_viscosity_pa_s": 0.001,
                "temperature_c": 20,
                "concentration_percent": 0,
            },
            "pipe_candidates": [
                {
                    "id": "40x3.7",
                    "label": "PE100-RC 40 x 3.7",
                    "material": "PE100-RC",
                    "outer_diameter_mm": 40,
                    "wall_thickness_mm": 3.7,
                }
            ],
            "pump": {"flow_m3_h": 2.4, "available_head_kpa": 60},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["provisional"] is True
    assert len(payload["candidates"]) == 1
    assert payload["candidates"][0]["pipe_id"] == "40x3.7"
    assert "pressure_drop_kpa" in payload["candidates"][0]
    assert "reynolds" in payload["candidates"][0]
