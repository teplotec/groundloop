from __future__ import annotations

from groundloop.hydraulics import (
    flow_regime,
    friction_factor,
    pressure_drop_kpa,
    reynolds_number,
    velocity_m_s,
)
from groundloop.models import CandidateResult, LoopConfiguration, SizingRequest, SizingResponse


MIN_DESIGN_REYNOLDS = 2500.0


def _parallel_branches(request: SizingRequest) -> int:
    multiplier = 2 if request.borefield.configuration == LoopConfiguration.DOUBLE_U else 1
    return request.borefield.boreholes * multiplier


def calculate(request: SizingRequest) -> SizingResponse:
    branches = _parallel_branches(request)
    flow_per_branch_m3_h = request.total_flow_m3_h / branches
    length_m = request.borefield.active_pipe_length_per_branch_m

    candidates: list[CandidateResult] = []

    for pipe in request.pipe_candidates:
        velocity = velocity_m_s(flow_per_branch_m3_h, pipe.inner_diameter_m)
        reynolds = reynolds_number(
            density_kg_m3=request.fluid.density_kg_m3,
            velocity_m_s_value=velocity,
            inner_diameter_m=pipe.inner_diameter_m,
            dynamic_viscosity_pa_s=request.fluid.dynamic_viscosity_pa_s,
        )
        friction = friction_factor(
            reynolds=reynolds,
            inner_diameter_m=pipe.inner_diameter_m,
        )
        drop = pressure_drop_kpa(
            friction_factor_value=friction,
            length_m=length_m,
            inner_diameter_m=pipe.inner_diameter_m,
            density_kg_m3=request.fluid.density_kg_m3,
            velocity_m_s_value=velocity,
        )

        reasons: list[str] = []
        status = "pass"

        if reynolds < MIN_DESIGN_REYNOLDS:
            status = "warning"
            reasons.append(
                f"Reynolds {reynolds:.0f} is below the provisional design target "
                f"of {MIN_DESIGN_REYNOLDS:.0f}"
            )

        pump_margin: float | None = None
        if request.pump is not None:
            pump_margin = request.pump.available_head_kpa - drop
            if pump_margin < 0:
                status = "fail"
                reasons.append("Pipe pressure drop exceeds available pump head at the design flow")

        candidates.append(
            CandidateResult(
                pipe_id=pipe.id,
                label=pipe.label,
                inner_diameter_mm=round(pipe.inner_diameter_m * 1000, 3),
                flow_per_branch_m3_h=round(flow_per_branch_m3_h, 4),
                velocity_m_s=round(velocity, 4),
                reynolds=round(reynolds, 1),
                flow_regime=flow_regime(reynolds),
                friction_factor=round(friction, 6),
                pressure_drop_kpa=round(drop, 3),
                pump_margin_kpa=round(pump_margin, 3) if pump_margin is not None else None,
                status=status,
                reasons=reasons,
            )
        )

    passing = [candidate for candidate in candidates if candidate.status == "pass"]
    recommended = min(passing, key=lambda candidate: candidate.pressure_drop_kpa, default=None)

    assumptions = [
        "Hydraulic calculation uses Darcy-Weisbach pressure loss and the Haaland approximation.",
        "PE absolute roughness is provisionally fixed at 1.5 micrometres.",
        "The current model treats borehole branches as balanced parallel branches.",
        "Header, fittings, heat-pump exchanger, filter, valves, and manifold losses are not yet included.",
        "The pump input is a single operating-point head, not a full interpolated pump curve.",
        "Reynolds 2500 is currently used as a provisional design screening target.",
    ]

    return SizingResponse(
        recommended_pipe_id=recommended.pipe_id if recommended else None,
        candidates=candidates,
        assumptions=assumptions,
        provisional=True,
    )
