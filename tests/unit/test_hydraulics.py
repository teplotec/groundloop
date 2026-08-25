import math

import pytest

from groundloop.hydraulics import (
    flow_regime,
    friction_factor,
    pressure_drop_kpa,
    reynolds_number,
    velocity_m_s,
)


def test_velocity_matches_pipe_area_definition() -> None:
    diameter_m = 0.0326
    flow_m3_h = 0.48

    expected = (flow_m3_h / 3600) / (math.pi * diameter_m**2 / 4)

    assert velocity_m_s(flow_m3_h, diameter_m) == pytest.approx(expected)


def test_reynolds_matches_definition() -> None:
    result = reynolds_number(
        density_kg_m3=1000,
        velocity_m_s_value=0.5,
        inner_diameter_m=0.03,
        dynamic_viscosity_pa_s=0.001,
    )

    assert result == pytest.approx(15000)


def test_laminar_friction_factor_is_64_over_reynolds() -> None:
    assert friction_factor(reynolds=1600, inner_diameter_m=0.03) == pytest.approx(0.04)


def test_flow_regime_boundaries() -> None:
    assert flow_regime(2299) == "laminar"
    assert flow_regime(2300) == "transitional"
    assert flow_regime(3999) == "transitional"
    assert flow_regime(4000) == "turbulent"


def test_pressure_drop_is_zero_for_zero_velocity() -> None:
    assert pressure_drop_kpa(
        friction_factor_value=0.03,
        length_m=120,
        inner_diameter_m=0.03,
        density_kg_m3=1000,
        velocity_m_s_value=0,
    ) == 0
