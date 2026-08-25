from __future__ import annotations

from enum import StrEnum
from math import pi

from pydantic import BaseModel, Field, model_validator


class PipeMaterial(StrEnum):
    PE80 = "PE80"
    PE100 = "PE100"
    PE100_RC = "PE100-RC"


class LoopConfiguration(StrEnum):
    SINGLE_U = "single_u"
    DOUBLE_U = "double_u"


class PipeCandidate(BaseModel):
    id: str
    label: str
    material: PipeMaterial
    outer_diameter_mm: float = Field(gt=0)
    wall_thickness_mm: float = Field(gt=0)

    @model_validator(mode="after")
    def wall_must_leave_a_bore(self) -> "PipeCandidate":
        if self.wall_thickness_mm * 2 >= self.outer_diameter_mm:
            raise ValueError("Pipe wall thickness must be less than half the outer diameter")
        return self

    @property
    def inner_diameter_m(self) -> float:
        return (self.outer_diameter_mm - 2 * self.wall_thickness_mm) / 1000

    @property
    def flow_area_m2(self) -> float:
        return pi * self.inner_diameter_m**2 / 4


class FluidState(BaseModel):
    id: str
    label: str
    density_kg_m3: float = Field(gt=0)
    dynamic_viscosity_pa_s: float = Field(gt=0)
    temperature_c: float
    concentration_percent: float = Field(ge=0, le=100)
    provisional: bool = False


class Borefield(BaseModel):
    boreholes: int = Field(ge=1, le=1000)
    depth_m: float = Field(gt=0, le=1000)
    # One-way surface distance from a borehole to the manifold/collector.
    header_run_m: float = Field(ge=0, le=5000)
    configuration: LoopConfiguration = LoopConfiguration.SINGLE_U

    @property
    def active_pipe_length_per_branch_m(self) -> float:
        # Every U-tube hydraulic branch has a down leg and an up leg. The same
        # applies to the surface connection: supply and return each traverse the
        # one-way header distance.
        return 2 * (self.depth_m + self.header_run_m)


class PumpPoint(BaseModel):
    flow_m3_h: float = Field(gt=0)
    available_head_kpa: float = Field(gt=0)


class SizingRequest(BaseModel):
    total_flow_m3_h: float = Field(gt=0)
    borefield: Borefield
    fluid: FluidState
    pipe_candidates: list[PipeCandidate] = Field(min_length=1, max_length=20)
    pump: PumpPoint | None = None


class CandidateResult(BaseModel):
    pipe_id: str
    label: str
    inner_diameter_mm: float
    flow_per_branch_m3_h: float
    velocity_m_s: float
    reynolds: float
    flow_regime: str
    friction_factor: float
    pressure_drop_kpa: float
    pump_margin_kpa: float | None
    status: str
    reasons: list[str]


class SizingResponse(BaseModel):
    recommended_pipe_id: str | None
    candidates: list[CandidateResult]
    assumptions: list[str]
    provisional: bool
