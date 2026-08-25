from __future__ import annotations

from math import log10, pi

PE_ABSOLUTE_ROUGHNESS_M = 1.5e-6


def volumetric_flow_m3_s(flow_m3_h: float) -> float:
    return flow_m3_h / 3600


def velocity_m_s(flow_m3_h: float, inner_diameter_m: float) -> float:
    area_m2 = pi * inner_diameter_m**2 / 4
    return volumetric_flow_m3_s(flow_m3_h) / area_m2


def reynolds_number(
    *,
    density_kg_m3: float,
    velocity_m_s_value: float,
    inner_diameter_m: float,
    dynamic_viscosity_pa_s: float,
) -> float:
    return (
        density_kg_m3
        * velocity_m_s_value
        * inner_diameter_m
        / dynamic_viscosity_pa_s
    )


def flow_regime(reynolds: float) -> str:
    if reynolds < 2300:
        return "laminar"
    if reynolds < 4000:
        return "transitional"
    return "turbulent"


def friction_factor(
    *,
    reynolds: float,
    inner_diameter_m: float,
    absolute_roughness_m: float = PE_ABSOLUTE_ROUGHNESS_M,
) -> float:
    if reynolds <= 0:
        raise ValueError("Reynolds number must be positive")
    if reynolds < 2300:
        return 64 / reynolds

    relative_roughness = absolute_roughness_m / inner_diameter_m
    inverse_sqrt_f = -1.8 * log10((relative_roughness / 3.7) ** 1.11 + 6.9 / reynolds)
    return 1 / inverse_sqrt_f**2


def pressure_drop_kpa(
    *,
    friction_factor_value: float,
    length_m: float,
    inner_diameter_m: float,
    density_kg_m3: float,
    velocity_m_s_value: float,
) -> float:
    pressure_pa = (
        friction_factor_value
        * (length_m / inner_diameter_m)
        * density_kg_m3
        * velocity_m_s_value**2
        / 2
    )
    return pressure_pa / 1000


def hydraulic_power_w(*, flow_m3_h: float, pressure_drop_kpa_value: float) -> float:
    return volumetric_flow_m3_s(flow_m3_h) * pressure_drop_kpa_value * 1000


def pump_electrical_power_w(
    *, flow_m3_h: float, pressure_drop_kpa_value: float, efficiency: float
) -> float:
    if not 0 < efficiency <= 1:
        raise ValueError("Pump efficiency must be in (0, 1]")
    return hydraulic_power_w(
        flow_m3_h=flow_m3_h, pressure_drop_kpa_value=pressure_drop_kpa_value
    ) / efficiency
