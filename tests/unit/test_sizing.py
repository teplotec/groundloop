from groundloop.models import (
    Borefield,
    FluidState,
    PipeCandidate,
    PipeMaterial,
    PumpPoint,
    SizingRequest,
)
from groundloop.sizing import calculate


def test_calculation_compares_pipe_candidates() -> None:
    request = SizingRequest(
        total_flow_m3_h=2.4,
        borefield=Borefield(
            boreholes=5,
            depth_m=61,
            header_run_m=12,
            configuration="single_u",
        ),
        fluid=FluidState(
            id="reference-water",
            label="Reference water state",
            density_kg_m3=1000,
            dynamic_viscosity_pa_s=0.001,
            temperature_c=20,
            concentration_percent=0,
        ),
        pump=PumpPoint(flow_m3_h=2.4, available_head_kpa=60),
        pipe_candidates=[
            PipeCandidate(
                id="32x3.0",
                label="PE100-RC 32 x 3.0",
                material=PipeMaterial.PE100_RC,
                outer_diameter_mm=32,
                wall_thickness_mm=3.0,
            ),
            PipeCandidate(
                id="40x3.7",
                label="PE100-RC 40 x 3.7",
                material=PipeMaterial.PE100_RC,
                outer_diameter_mm=40,
                wall_thickness_mm=3.7,
            ),
        ],
    )

    result = calculate(request)

    assert len(result.candidates) == 2
    smaller, larger = result.candidates
    assert smaller.velocity_m_s > larger.velocity_m_s
    assert smaller.reynolds > larger.reynolds
    assert smaller.pressure_drop_kpa > larger.pressure_drop_kpa
    assert result.provisional is True


def test_borefield_branch_length_counts_supply_and_return() -> None:
    borefield = Borefield(
        boreholes=5,
        depth_m=61,
        header_run_m=12,
        configuration="single_u",
    )

    assert borefield.active_pipe_length_per_branch_m == 146


def test_double_u_splits_flow_across_twice_as_many_branches() -> None:
    base = dict(
        total_flow_m3_h=2.4,
        fluid=FluidState(
            id="reference-water",
            label="Reference water state",
            density_kg_m3=1000,
            dynamic_viscosity_pa_s=0.001,
            temperature_c=20,
            concentration_percent=0,
        ),
        pipe_candidates=[
            PipeCandidate(
                id="40x3.7",
                label="PE100-RC 40 x 3.7",
                material=PipeMaterial.PE100_RC,
                outer_diameter_mm=40,
                wall_thickness_mm=3.7,
            )
        ],
    )

    single = calculate(
        SizingRequest(
            **base,
            borefield=Borefield(
                boreholes=5, depth_m=61, header_run_m=0, configuration="single_u"
            ),
        )
    )
    double = calculate(
        SizingRequest(
            **base,
            borefield=Borefield(
                boreholes=5, depth_m=61, header_run_m=0, configuration="double_u"
            ),
        )
    )

    assert single.candidates[0].flow_per_branch_m3_h == 0.48
    assert double.candidates[0].flow_per_branch_m3_h == 0.24
