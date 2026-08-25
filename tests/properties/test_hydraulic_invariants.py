from hypothesis import given, strategies as st

from groundloop.hydraulics import (
    friction_factor,
    pressure_drop_kpa,
    reynolds_number,
    velocity_m_s,
)


positive_flow = st.floats(min_value=0.05, max_value=5.0, allow_nan=False, allow_infinity=False)
pipe_diameter = st.floats(min_value=0.02, max_value=0.06, allow_nan=False, allow_infinity=False)


@given(flow=positive_flow, small_d=pipe_diameter, extra=st.floats(min_value=0.001, max_value=0.03))
def test_larger_diameter_reduces_velocity(flow: float, small_d: float, extra: float) -> None:
    large_d = small_d + extra

    assert velocity_m_s(flow, large_d) < velocity_m_s(flow, small_d)


@given(
    density=st.floats(min_value=900, max_value=1200),
    velocity=st.floats(min_value=0.05, max_value=2.0),
    diameter=pipe_diameter,
    viscosity=st.floats(min_value=0.0005, max_value=0.02),
    factor=st.floats(min_value=1.01, max_value=5.0),
)
def test_higher_viscosity_reduces_reynolds(
    density: float,
    velocity: float,
    diameter: float,
    viscosity: float,
    factor: float,
) -> None:
    low_viscosity_re = reynolds_number(
        density_kg_m3=density,
        velocity_m_s_value=velocity,
        inner_diameter_m=diameter,
        dynamic_viscosity_pa_s=viscosity,
    )
    high_viscosity_re = reynolds_number(
        density_kg_m3=density,
        velocity_m_s_value=velocity,
        inner_diameter_m=diameter,
        dynamic_viscosity_pa_s=viscosity * factor,
    )

    assert high_viscosity_re < low_viscosity_re


@given(
    flow=positive_flow,
    diameter=pipe_diameter,
    density=st.floats(min_value=900, max_value=1200),
    viscosity=st.floats(min_value=0.0005, max_value=0.02),
    length=st.floats(min_value=20, max_value=300),
    multiplier=st.floats(min_value=1.01, max_value=4.0),
)
def test_longer_pipe_increases_pressure_drop(
    flow: float,
    diameter: float,
    density: float,
    viscosity: float,
    length: float,
    multiplier: float,
) -> None:
    velocity = velocity_m_s(flow, diameter)
    reynolds = reynolds_number(
        density_kg_m3=density,
        velocity_m_s_value=velocity,
        inner_diameter_m=diameter,
        dynamic_viscosity_pa_s=viscosity,
    )
    friction = friction_factor(reynolds=reynolds, inner_diameter_m=diameter)

    short_drop = pressure_drop_kpa(
        friction_factor_value=friction,
        length_m=length,
        inner_diameter_m=diameter,
        density_kg_m3=density,
        velocity_m_s_value=velocity,
    )
    long_drop = pressure_drop_kpa(
        friction_factor_value=friction,
        length_m=length * multiplier,
        inner_diameter_m=diameter,
        density_kg_m3=density,
        velocity_m_s_value=velocity,
    )

    assert long_drop > short_drop
