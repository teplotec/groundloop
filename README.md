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

The current calculation is deliberately marked `provisional`. Straight-pipe hydraulics are implemented, while fittings, manifold balancing, heat-pump exchanger losses, full pump curves, sourced fluid-property interpolation, and thermal borefield response are explicit follow-up work.

The PG presets in the alpha UI are development values for exercising dependency behavior. They must be replaced by sourced manufacturer/property tables before GroundLoop results are used as an engineering design basis.

## Repository layout

```text
apps/
  api/                  FastAPI transport surface
  web/                  Next.js / React touch-first UI
src/groundloop/         framework-independent calculation core
tests/
  unit/                 formula and sizing tests
  properties/           generated physical invariants
  api/                  HTTP contract tests
docs/architecture.md    boundaries, dependency graph, test strategy
```

## Run locally

Python 3.13 and Node.js 22 are the baseline development runtimes.

```bash
make install-python
make install-web
```

Run the API:

```bash
make dev-api
```

Run the web app in another shell:

```bash
make dev-web
```

Open `http://127.0.0.1:3000`.

Or run both services with Docker:

```bash
make compose
```

## Test

```bash
make test-python
make test-web
```

Browser smoke tests start both runtimes automatically:

```bash
cd apps/web
npx playwright install chromium
npm run test:e2e
```

CI repeats Python lint/type/unit/property/API checks, web unit/type/build checks, and desktop + mobile Chromium smoke tests on pull requests.

## API

The first vertical slice exposes:

```text
GET  /health
POST /v1/calculate
```

The web app calls the calculation API through a same-origin Next.js route. Set `GROUNDLOOP_API_URL` for the Next.js server when the API is hosted separately.

## Next engineering increments

1. Replace provisional PG properties with sourced interpolation by temperature and concentration.
2. Add fittings, manifolds, filters, valves, and heat-pump exchanger pressure losses.
3. Store full circulation-pump curves and solve the actual operating point.
4. Add reference fixtures from hand calculations, PPI, `pygfunction`, and GHEtool.
5. Add borehole thermal resistance and g-function based long-term thermal sizing.
6. Introduce heat-pump and pipe catalogs only after their source data is versioned and testable.
