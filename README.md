# GroundLoop

Ground heat exchanger design and hydraulic sizing for TeploTEC installations.

GroundLoop is a touch-first, engineering-oriented configurator for selecting and validating ground-loop geometry, pipe, fluid, topology, and circulation-pump operating points.

The project keeps the calculation core independent from the UI so engineering results can be tested against hand calculations and reference engines such as `pygfunction` and GHEtool.

## Product principles

- Touch-first controls: visible cards and segmented choices instead of dropdown-heavy forms.
- Dependent-aware flow: later choices, defaults, warnings, and ranges react to earlier engineering decisions.
- Deterministic calculation core with auditable assumptions.
- Reference-backed tests before visual polish.
- One repository, two runtimes: Next.js/React UI and Python calculation API/core.
- No database required for the first sizing release.

## Initial scope

Given a heat pump, borefield geometry, fluid, circulation pump, and pipe candidates, calculate hydraulic behavior and recommend valid pipe options. Thermal borefield sizing follows after the hydraulic core is validated.
