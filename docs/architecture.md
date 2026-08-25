# GroundLoop architecture

## Boundary

GroundLoop is one product in one repository with two runtimes:

- `apps/web`: Next.js + React + TypeScript UI.
- `apps/api`: FastAPI transport surface.
- `src/groundloop`: framework-independent Python calculation core.

The UI never owns engineering formulas. FastAPI does not own engineering formulas either; it validates and transports domain input/output. The deterministic core can be exercised directly by tests, notebooks, CLI tooling, or future ERP integrations.

## Interaction model

The configurator is touch-first and intentionally avoids dropdowns for short finite sets.

Use visible choice cards for:

- Single-U / Double-U topology;
- heat-transfer-fluid presets;
- pipe candidates;
- future heat-pump models and circulation-pump models when the catalog remains small.

Use numeric controls for continuous values such as:

- borehole count and depth;
- header length;
- design flow;
- design-point pump head;
- future ground-property measurements.

## Dependent-aware rules

A choice is not an isolated form value. It may change downstream choices, defaults, warnings, ranges, and derived metrics.

Initial dependency graph:

```text
loop configuration ─┬─> parallel branch count ─> flow / branch ─┐
                    │                                           │
borehole count ─────┘                                           ├─> velocity ─> Reynolds ─> friction ─> Δp
                                                                │
fluid concentration ─> density + viscosity ─────────────────────┘

pipe geometry ─> inner diameter + area ──────────────────────────┘

pump operating point ───────────────────────────────────────────────> pass / fail
```

Later dependencies will include heat-pump model, required brine flow, design brine temperature, freeze margin, pump curves, thermal resistance, and borefield sizing.

## Engineering maturity

The current hydraulic engine is an alpha screening model. It implements:

- inner pipe diameter;
- branch flow;
- fluid velocity;
- Reynolds number;
- laminar friction factor;
- Haaland approximation for non-laminar flow;
- Darcy-Weisbach straight-pipe pressure loss;
- simple pump-head margin;
- a provisional Reynolds screening target.

It does not yet include:

- full pump curves;
- fittings and local K losses;
- manifold/header network solving;
- heat-pump heat-exchanger pressure loss;
- filter and valve losses;
- sourced/interpolated fluid-property tables;
- borehole thermal resistance;
- g-functions or long-term ground response.

Every API result is therefore marked `provisional` and returns its assumptions.

## Reference-engine strategy

`pygfunction` is installed as the first reference dependency. GHEtool cases will be added as reference fixtures as the thermal model is introduced.

GroundLoop should keep small, auditable hydraulic primitives even when reference packages are available. Reference engines are used to validate outputs and cover the thermal models that would be wasteful or risky to reimplement prematurely.

## Test pyramid

1. Formula unit tests - exact definitions and boundary behavior.
2. Property tests - monotonic physical invariants over generated inputs.
3. API contract tests - validation and stable result shape.
4. Reference tests - hand calculations, PPI, `pygfunction`, and GHEtool fixtures.
5. Browser smoke - real Next.js -> FastAPI integration in desktop and mobile Chromium.

No UI change should be able to silently change engineering output.
