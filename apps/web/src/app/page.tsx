'use client';

import { FormEvent, useMemo, useState } from 'react';

import {
  FLUIDS,
  LOOP_CONFIGURATIONS,
  PIPES,
  branchCount,
  flowPerBranch,
  type FluidChoice,
  type PipeChoice,
} from '@/lib/catalog';

type LoopConfiguration = 'single_u' | 'double_u';

type CandidateResult = {
  pipe_id: string;
  label: string;
  inner_diameter_mm: number;
  flow_per_branch_m3_h: number;
  velocity_m_s: number;
  reynolds: number;
  flow_regime: string;
  friction_factor: number;
  pressure_drop_kpa: number;
  pump_margin_kpa: number | null;
  status: 'pass' | 'warning' | 'fail';
  reasons: string[];
};

type SizingResponse = {
  recommended_pipe_id: string | null;
  candidates: CandidateResult[];
  assumptions: string[];
  provisional: boolean;
};

function ChoiceCard({
  selected,
  onClick,
  title,
  description,
  badge,
  meta,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  badge?: string;
  meta?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`choice-card min-h-28 rounded-[22px] border p-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-signal/60 md:p-5 ${
        selected
          ? 'border-ink bg-ink text-white shadow-lg shadow-ink/10'
          : 'border-hair bg-white text-ink hover:border-hair-strong'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        {badge ? (
          <span
            className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
              selected ? 'bg-white/12 text-signal' : 'bg-paper-2 text-ink-70'
            }`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-sm leading-5 ${selected ? 'text-white/65' : 'text-ink-70'}`}>
        {description}
      </p>
      {meta ? (
        <div className={`mt-4 font-mono text-xs ${selected ? 'text-signal' : 'text-ink-45'}`}>
          {meta}
        </div>
      ) : null}
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  unit,
  min,
  step = 1,
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  min: number;
  step?: number;
  help?: string;
}) {
  return (
    <label className="block rounded-[22px] border border-hair bg-white p-4 shadow-sm md:p-5">
      <span className="text-sm font-medium text-ink-70">{label}</span>
      <span className="mt-3 flex items-baseline gap-2">
        <input
          className="numeric-input min-w-0 flex-1 bg-transparent text-4xl font-semibold tracking-[-0.04em] outline-none"
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="font-mono text-sm text-ink-45">{unit}</span>
      </span>
      {help ? <span className="mt-3 block text-xs leading-5 text-ink-45">{help}</span> : null}
    </label>
  );
}

function Section({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-hair py-8 md:py-10">
      <div className="mb-5 flex items-start gap-4">
        <span className="mt-1 font-mono text-xs text-ink-45">{index}</span>
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.035em] md:text-3xl">{title}</h2>
          {hint ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-70">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const [totalFlow, setTotalFlow] = useState(2.4);
  const [boreholes, setBoreholes] = useState(5);
  const [depth, setDepth] = useState(61);
  const [headerRun, setHeaderRun] = useState(12);
  const [configuration, setConfiguration] = useState<LoopConfiguration>('single_u');
  const [fluidId, setFluidId] = useState('pg20-demo');
  const [selectedPipeIds, setSelectedPipeIds] = useState(() => new Set(PIPES.map((pipe) => pipe.id)));
  const [pumpHead, setPumpHead] = useState(60);
  const [result, setResult] = useState<SizingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fluid = useMemo(
    () => FLUIDS.find((candidate) => candidate.id === fluidId) ?? FLUIDS[0],
    [fluidId],
  );

  const selectedPipes = useMemo(
    () => PIPES.filter((pipe) => selectedPipeIds.has(pipe.id)),
    [selectedPipeIds],
  );

  const branches = branchCount(boreholes, configuration);
  const branchFlow = flowPerBranch(totalFlow, boreholes, configuration);

  function togglePipe(pipe: PipeChoice) {
    setSelectedPipeIds((current) => {
      const next = new Set(current);
      if (next.has(pipe.id)) {
        if (next.size > 1) next.delete(pipe.id);
      } else {
        next.add(pipe.id);
      }
      return next;
    });
    setResult(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          total_flow_m3_h: totalFlow,
          borefield: {
            boreholes,
            depth_m: depth,
            header_run_m: headerRun,
            configuration,
          },
          fluid: {
            id: fluid.id,
            label: fluid.label,
            density_kg_m3: fluid.densityKgM3,
            dynamic_viscosity_pa_s: fluid.dynamicViscosityPaS,
            temperature_c: fluid.temperatureC,
            concentration_percent: fluid.concentrationPercent,
            provisional: fluid.provisional,
          },
          pipe_candidates: selectedPipes.map((pipe) => ({
            id: pipe.id,
            label: `${pipe.material} ${pipe.label}`,
            material: pipe.material,
            outer_diameter_mm: pipe.outerDiameterMm,
            wall_thickness_mm: pipe.wallThicknessMm,
          })),
          pump: {
            flow_m3_h: totalFlow,
            available_head_kpa: pumpHead,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Calculation failed (${response.status})`);
      }

      setResult((await response.json()) as SizingResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Calculation failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4 py-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-45">TEPLOTEC</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">GroundLoop</div>
        </div>
        <div className="rounded-full border border-hair bg-white px-3 py-2 font-mono text-[11px] text-ink-70">
          hydraulic alpha
        </div>
      </header>

      <div className="py-10 md:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-45">Ground-side design</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.055em] md:text-7xl">
          Підбираємо контур цифрами, а не звичкою.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-ink-70 md:text-lg">
          Усі короткі набори параметрів видно одразу. Обирай картки, змінюй числові значення,
          а GroundLoop перерахує залежні параметри та порівняє кандидатів.
        </p>
      </div>

      <form onSubmit={submit}>
        <Section index="01" title="Розрахункова витрата">
          <div className="grid gap-3 md:grid-cols-3">
            <NumberField
              label="Загальна витрата"
              value={totalFlow}
              onChange={(value) => {
                setTotalFlow(value);
                setResult(null);
              }}
              unit="m³/h"
              min={0.1}
              step={0.1}
              help="Пізніше це значення зможемо підтягувати з вибраної моделі теплового насоса."
            />
            <div className="rounded-[22px] border border-hair bg-ink p-5 text-white shadow-sm md:col-span-2">
              <div className="text-sm text-white/55">Залежний параметр</div>
              <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <div className="text-4xl font-semibold tracking-[-0.04em]">{branchFlow.toFixed(2)}</div>
                  <div className="mt-1 font-mono text-xs text-signal">m³/h на гілку</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{branches}</div>
                  <div className="mt-1 font-mono text-xs text-white/45">parallel branches</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section index="02" title="Свердловини" hint="Continuous values вводимо числами. Геометрію U-труби обираємо карткою.">
          <div className="grid gap-3 md:grid-cols-3">
            <NumberField
              label="Кількість свердловин"
              value={boreholes}
              onChange={(value) => {
                setBoreholes(Math.max(1, Math.round(value)));
                setResult(null);
              }}
              unit="шт"
              min={1}
            />
            <NumberField
              label="Глибина"
              value={depth}
              onChange={(value) => {
                setDepth(value);
                setResult(null);
              }}
              unit="m"
              min={1}
            />
            <NumberField
              label="Підводка до колектора"
              value={headerRun}
              onChange={(value) => {
                setHeaderRun(value);
                setResult(null);
              }}
              unit="m / branch"
              min={0}
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {LOOP_CONFIGURATIONS.map((choice) => (
              <ChoiceCard
                key={choice.id}
                selected={configuration === choice.id}
                onClick={() => {
                  setConfiguration(choice.id);
                  setResult(null);
                }}
                title={choice.label}
                description={choice.description}
                meta={`${branchCount(boreholes, choice.id)} branches · ${flowPerBranch(totalFlow, boreholes, choice.id).toFixed(2)} m³/h each`}
              />
            ))}
          </div>
        </Section>

        <Section
          index="03"
          title="Теплоносій"
          hint="Ніяких dropdowns: типові концентрації видно одночасно, а вибір одразу змінює в'язкість і Reynolds у розрахунку."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FLUIDS.map((choice: FluidChoice) => (
              <ChoiceCard
                key={choice.id}
                selected={fluidId === choice.id}
                onClick={() => {
                  setFluidId(choice.id);
                  setResult(null);
                }}
                title={choice.label}
                description={choice.description}
                badge={choice.badge}
                meta={`${choice.temperatureC} °C · ${(choice.dynamicViscosityPaS * 1000).toFixed(2)} mPa·s${choice.provisional ? ' · provisional' : ''}`}
              />
            ))}
          </div>
          {fluid.advisory ? (
            <div className="mt-3 rounded-[18px] border border-hair bg-white px-4 py-3 text-sm leading-6 text-ink-70">
              {fluid.advisory}
            </div>
          ) : null}
        </Section>

        <Section
          index="04"
          title="Труби для порівняння"
          hint="Це multi-select: залишаємо відміченими всі реальні кандидати і дивимося, хто проходить гідравлічні обмеження."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PIPES.map((pipe) => (
              <ChoiceCard
                key={pipe.id}
                selected={selectedPipeIds.has(pipe.id)}
                onClick={() => togglePipe(pipe)}
                title={pipe.label}
                description={pipe.description}
                badge={pipe.badge}
              />
            ))}
          </div>
        </Section>

        <Section index="05" title="Циркуляційна помпа">
          <div className="grid gap-3 md:grid-cols-3">
            <NumberField
              label="Доступний напір у робочій точці"
              value={pumpHead}
              onChange={(value) => {
                setPumpHead(value);
                setResult(null);
              }}
              unit="kPa"
              min={1}
              help={`Поточна робоча точка: ${totalFlow.toFixed(1)} m³/h. Наступний етап - повна pump curve.`}
            />
            <div className="rounded-[22px] border border-hair bg-white p-5 md:col-span-2">
              <div className="text-sm font-medium text-ink-70">Що вже залежить від попередніх виборів</div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="branches" value={String(branches)} />
                <Stat label="flow/branch" value={`${branchFlow.toFixed(2)} m³/h`} />
                <Stat label="fluid" value={fluid.label} />
                <Stat label="candidates" value={String(selectedPipes.length)} />
              </div>
            </div>
          </div>
        </Section>

        <div className="sticky bottom-3 z-10 mt-4 rounded-[24px] border border-hair bg-white/90 p-3 shadow-xl shadow-ink/10 backdrop-blur-xl">
          <button
            className="primary-action min-h-14 w-full rounded-[18px] bg-ink px-5 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={submitting || selectedPipes.length === 0}
          >
            {submitting ? 'Рахую…' : `Порівняти ${selectedPipes.length} труби`}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-6 rounded-[22px] border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {result ? <Results result={result} /> : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-45">{label}</div>
      <div className="mt-1 text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function Results({ result }: { result: SizingResponse }) {
  return (
    <section className="mt-12 border-t border-hair pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-45">Calculation result</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.045em]">Порівняння кандидатів</h2>
        </div>
        {result.provisional ? (
          <span className="rounded-full bg-paper-3 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-70">
            provisional
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {result.candidates.map((candidate) => {
          const recommended = result.recommended_pipe_id === candidate.pipe_id;
          return (
            <article
              key={candidate.pipe_id}
              className={`rounded-[24px] border p-5 ${
                recommended ? 'border-ink bg-ink text-white' : 'border-hair bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold">{candidate.label}</div>
                  <div className={`mt-1 font-mono text-xs ${recommended ? 'text-signal' : 'text-ink-45'}`}>
                    ID {candidate.inner_diameter_mm.toFixed(1)} mm
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                    recommended
                      ? 'bg-white/10 text-signal'
                      : candidate.status === 'fail'
                        ? 'bg-red-50 text-red-700'
                        : candidate.status === 'warning'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-paper-2 text-ink-70'
                  }`}
                >
                  {recommended ? 'recommended' : candidate.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <ResultMetric label="velocity" value={`${candidate.velocity_m_s.toFixed(2)} m/s`} dark={recommended} />
                <ResultMetric label="Re" value={candidate.reynolds.toFixed(0)} dark={recommended} />
                <ResultMetric label="regime" value={candidate.flow_regime} dark={recommended} />
                <ResultMetric label="Δp pipe" value={`${candidate.pressure_drop_kpa.toFixed(1)} kPa`} dark={recommended} />
                <ResultMetric
                  label="pump margin"
                  value={candidate.pump_margin_kpa == null ? '—' : `${candidate.pump_margin_kpa.toFixed(1)} kPa`}
                  dark={recommended}
                />
                <ResultMetric label="flow/branch" value={`${candidate.flow_per_branch_m3_h.toFixed(2)} m³/h`} dark={recommended} />
              </div>

              {candidate.reasons.length > 0 ? (
                <ul className={`mt-5 space-y-2 text-sm ${recommended ? 'text-white/65' : 'text-ink-70'}`}>
                  {candidate.reasons.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>

      <details className="mt-4 rounded-[22px] border border-hair bg-white p-5">
        <summary className="cursor-pointer text-sm font-semibold">Assumptions and current model limits</summary>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-70">
          {result.assumptions.map((assumption) => (
            <li key={assumption}>• {assumption}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}

function ResultMetric({ label, value, dark }: { label: string; value: string; dark: boolean }) {
  return (
    <div>
      <div className={`font-mono text-[10px] uppercase tracking-[0.12em] ${dark ? 'text-white/40' : 'text-ink-45'}`}>
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}
