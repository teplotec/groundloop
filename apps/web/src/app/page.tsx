'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import {
  FLUIDS,
  LOOP_CONFIGURATIONS,
  PIPES,
  branchCount,
  flowPerBranch,
  type FluidChoice,
  type PipeChoice,
} from '@/lib/catalog';
import {
  COPY,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  formatTemplate,
  localizeBackendText,
  type Locale,
} from '@/lib/i18n';

type LoopConfiguration = 'single_u' | 'double_u';
type FluidId = keyof typeof COPY.uk.fluids;

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

function PipeCrossSection({ pipe, selected }: { pipe: PipeChoice; selected: boolean }) {
  const innerDiameter = pipe.outerDiameterMm - pipe.wallThicknessMm * 2;
  const innerRadius = 27 * (innerDiameter / pipe.outerDiameterMm);

  return (
    <div
      className={`grid h-20 w-20 shrink-0 place-items-center rounded-full border ${
        selected ? 'border-white/15 bg-white/5 text-white' : 'border-hair bg-paper-2 text-ink'
      }`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 72 72" className="h-16 w-16" fill="none">
        <circle cx="36" cy="36" r="27" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="36" cy="36" r={innerRadius} stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
        <line x1="9" y1="36" x2="63" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <circle cx="36" cy="36" r="2" fill="currentColor" opacity="0.55" />
      </svg>
    </div>
  );
}

function PipeCard({
  pipe,
  selected,
  onClick,
  locale,
}: {
  pipe: PipeChoice;
  selected: boolean;
  onClick: () => void;
  locale: Locale;
}) {
  const copy = COPY[locale];
  const innerDiameter = pipe.outerDiameterMm - pipe.wallThicknessMm * 2;
  const sdr = Math.round(pipe.outerDiameterMm / pipe.wallThicknessMm);

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${pipe.material} ${pipe.label}`}
      onClick={onClick}
      className={`choice-card rounded-[22px] border p-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-signal/60 md:p-5 ${
        selected
          ? 'border-ink bg-ink text-white shadow-lg shadow-ink/10'
          : 'border-hair bg-white text-ink hover:border-hair-strong'
      }`}
    >
      <div className="flex gap-4">
        <PipeCrossSection pipe={pipe} selected={selected} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-xl font-semibold tracking-tight">{pipe.label}</div>
              <div className={`mt-1 font-mono text-xs ${selected ? 'text-signal' : 'text-ink-70'}`}>
                {pipe.material}
              </div>
            </div>
            {pipe.badge ? (
              <span
                className={`rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${
                  selected ? 'bg-white/10 text-signal' : 'bg-paper-2 text-ink-70'
                }`}
              >
                {locale === 'uk' ? copy.pipe.baseline : pipe.badge}
              </span>
            ) : null}
          </div>
          <div className={`mt-3 font-mono text-[10px] uppercase tracking-[0.1em] ${selected ? 'text-white/45' : 'text-ink-45'}`}>
            SDR {sdr}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <PipeDimension label={copy.pipe.outerDiameter} value={`Ø${pipe.outerDiameterMm}`} selected={selected} />
        <PipeDimension label={copy.pipe.wall} value={`${pipe.wallThicknessMm}`} selected={selected} />
        <PipeDimension label={copy.pipe.innerDiameter} value={`Ø${innerDiameter.toFixed(1)}`} selected={selected} />
      </div>
    </button>
  );
}

function PipeDimension({ label, value, selected }: { label: string; value: string; selected: boolean }) {
  return (
    <div className={`rounded-xl px-2.5 py-2 ${selected ? 'bg-white/7' : 'bg-paper-2'}`}>
      <div className={`font-mono text-[8px] uppercase tracking-[0.1em] ${selected ? 'text-white/40' : 'text-ink-45'}`}>
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value} mm</div>
    </div>
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

function LanguageSwitch({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className="flex rounded-full border border-hair bg-white p-1" aria-label="Language">
      {(['uk', 'en'] as const).map((candidate) => (
        <button
          key={candidate}
          type="button"
          aria-pressed={locale === candidate}
          onClick={() => onChange(candidate)}
          className={`rounded-full px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] transition ${
            locale === candidate ? 'bg-ink text-white' : 'text-ink-45 hover:text-ink'
          }`}
        >
          {COPY[candidate].shortLanguage}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
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
  const resultAnchorRef = useRef<HTMLDivElement>(null);

  const copy = COPY[locale];

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'uk' || stored === 'en') setLocale(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'uk' ? 'uk' : 'en';
  }, [locale]);

  useEffect(() => {
    if (!result) return;
    window.requestAnimationFrame(() => {
      resultAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [result]);

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

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  }

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

  function calculateLabel(count: number) {
    if (locale === 'en') return formatTemplate(copy.calculate, { count });
    if (count === 1) return 'Порівняти 1 трубу';
    if (count >= 2 && count <= 4) return `Порівняти ${count} труби`;
    return `Порівняти ${count} труб`;
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
        throw new Error(`${copy.calculationFailed} (${response.status})`);
      }

      setResult((await response.json()) as SizingResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.calculationFailed);
    } finally {
      setSubmitting(false);
    }
  }

  const localizedFluid = copy.fluids[fluid.id as FluidId];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4 py-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-45">TEPLOTEC</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">GroundLoop</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-hair bg-white px-3 py-2 font-mono text-[10px] text-ink-70 sm:block">
            {copy.alpha}
          </div>
          <LanguageSwitch locale={locale} onChange={changeLocale} />
        </div>
      </header>

      <div className="py-10 md:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-45">{copy.eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.055em] md:text-7xl">
          {copy.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-ink-70 md:text-lg">{copy.heroBody}</p>
      </div>

      <form onSubmit={submit}>
        <Section index="01" title={copy.sections.flow}>
          <div className="grid gap-3 md:grid-cols-3">
            <NumberField
              label={copy.fields.totalFlow}
              value={totalFlow}
              onChange={(value) => {
                setTotalFlow(value);
                setResult(null);
              }}
              unit="m³/h"
              min={0.1}
              step={0.1}
              help={copy.help.totalFlow}
            />
            <div className="rounded-[22px] border border-hair bg-ink p-5 text-white shadow-sm md:col-span-2">
              <div className="text-sm text-white/55">{copy.dependent}</div>
              <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <div className="text-4xl font-semibold tracking-[-0.04em]">{branchFlow.toFixed(2)}</div>
                  <div className="mt-1 font-mono text-xs text-signal">{copy.branchFlow}</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{branches}</div>
                  <div className="mt-1 font-mono text-xs text-white/45">{copy.parallelBranches}</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section index="02" title={copy.sections.boreholes} hint={copy.hints.boreholes}>
          <div className="grid gap-3 md:grid-cols-3">
            <NumberField
              label={copy.fields.boreholes}
              value={boreholes}
              onChange={(value) => {
                setBoreholes(Math.max(1, Math.round(value)));
                setResult(null);
              }}
              unit={locale === 'uk' ? 'шт' : 'pcs'}
              min={1}
            />
            <NumberField
              label={copy.fields.depth}
              value={depth}
              onChange={(value) => {
                setDepth(value);
                setResult(null);
              }}
              unit="m"
              min={1}
            />
            <NumberField
              label={copy.fields.headerRun}
              value={headerRun}
              onChange={(value) => {
                setHeaderRun(value);
                setResult(null);
              }}
              unit={locale === 'uk' ? 'м / гілка' : 'm / branch'}
              min={0}
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {LOOP_CONFIGURATIONS.map((choice) => {
              const localized = copy.loops[choice.id];
              return (
                <ChoiceCard
                  key={choice.id}
                  selected={configuration === choice.id}
                  onClick={() => {
                    setConfiguration(choice.id);
                    setResult(null);
                  }}
                  title={localized.label}
                  description={localized.description}
                  badge={localized.badge}
                  meta={
                    locale === 'uk'
                      ? `${branchCount(boreholes, choice.id)} гілок · ${flowPerBranch(totalFlow, boreholes, choice.id).toFixed(2)} м³/год на гілку`
                      : `${branchCount(boreholes, choice.id)} branches · ${flowPerBranch(totalFlow, boreholes, choice.id).toFixed(2)} m³/h each`
                  }
                />
              );
            })}
          </div>
        </Section>

        <Section index="03" title={copy.sections.fluid} hint={copy.hints.fluid}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FLUIDS.map((choice: FluidChoice) => {
              const localized = copy.fluids[choice.id as FluidId];
              return (
                <ChoiceCard
                  key={choice.id}
                  selected={fluidId === choice.id}
                  onClick={() => {
                    setFluidId(choice.id);
                    setResult(null);
                  }}
                  title={localized.label}
                  description={localized.description}
                  badge={choice.badge}
                  meta={`${choice.temperatureC} °C · ${(choice.dynamicViscosityPaS * 1000).toFixed(2)} mPa·s${
                    choice.provisional ? ` · ${copy.provisional}` : ''
                  }`}
                />
              );
            })}
          </div>
          {'advisory' in localizedFluid && localizedFluid.advisory ? (
            <div className="mt-3 rounded-[18px] border border-hair bg-white px-4 py-3 text-sm leading-6 text-ink-70">
              {localizedFluid.advisory}
            </div>
          ) : null}
        </Section>

        <Section index="04" title={copy.sections.pipes} hint={copy.hints.pipes}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PIPES.map((pipe) => (
              <PipeCard
                key={pipe.id}
                pipe={pipe}
                locale={locale}
                selected={selectedPipeIds.has(pipe.id)}
                onClick={() => togglePipe(pipe)}
              />
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-ink-45">{copy.pipe.dimensionsHelp}</p>
        </Section>

        <Section index="05" title={copy.sections.pump}>
          <div className="grid gap-3 md:grid-cols-3">
            <NumberField
              label={copy.fields.pumpHead}
              value={pumpHead}
              onChange={(value) => {
                setPumpHead(value);
                setResult(null);
              }}
              unit="kPa"
              min={1}
              help={formatTemplate(copy.help.pumpHead, { flow: totalFlow.toFixed(1) })}
            />
            <div className="rounded-[22px] border border-hair bg-white p-5 md:col-span-2">
              <div className="text-sm font-medium text-ink-70">{copy.previousChoices}</div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label={copy.stats.branches} value={String(branches)} />
                <Stat label={copy.stats.flowPerBranch} value={`${branchFlow.toFixed(2)} m³/h`} />
                <Stat label={copy.stats.fluid} value={localizedFluid.label} />
                <Stat label={copy.stats.candidates} value={String(selectedPipes.length)} />
              </div>
            </div>
          </div>
        </Section>

        <div className="mt-4 rounded-[24px] border border-hair bg-white p-3 shadow-xl shadow-ink/10 md:sticky md:bottom-3 md:z-10 md:bg-white/90 md:backdrop-blur-xl">
          <button
            className="primary-action min-h-14 w-full rounded-[18px] bg-ink px-5 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={submitting || selectedPipes.length === 0}
          >
            {submitting ? copy.calculating : calculateLabel(selectedPipes.length)}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-6 rounded-[22px] border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div>
      ) : null}

      <div ref={resultAnchorRef} className="scroll-mt-6">
        {result ? <Results result={result} locale={locale} /> : null}
      </div>

      <Glossary locale={locale} />
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

function Results({ result, locale }: { result: SizingResponse; locale: Locale }) {
  const copy = COPY[locale];
  const counts = result.candidates.reduce(
    (accumulator, candidate) => {
      accumulator[candidate.status] += 1;
      return accumulator;
    },
    { pass: 0, warning: 0, fail: 0 },
  );

  return (
    <section className="mt-12 border-t border-hair pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-45">{copy.resultEyebrow}</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-[-0.045em]">{copy.resultTitle}</h2>
        </div>
        {result.provisional ? (
          <span className="rounded-full bg-paper-3 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-70">
            {copy.provisional}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <SummaryPill label={copy.statuses.pass} value={counts.pass} />
        <SummaryPill label={copy.statuses.warning} value={counts.warning} />
        <SummaryPill label={copy.statuses.fail} value={counts.fail} />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {result.candidates.map((candidate) => {
          const recommended = result.recommended_pipe_id === candidate.pipe_id;
          const statusLabel = recommended ? copy.statuses.recommended : copy.statuses[candidate.status];
          const regime = copy.regimes[candidate.flow_regime as keyof typeof copy.regimes] ?? candidate.flow_regime;

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
                    {copy.pipe.innerDiameter} {candidate.inner_diameter_mm.toFixed(1)} mm
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
                  {statusLabel}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <ResultMetric label={copy.metrics.velocity} value={`${candidate.velocity_m_s.toFixed(2)} m/s`} dark={recommended} />
                <ResultMetric label={copy.metrics.reynolds} value={candidate.reynolds.toFixed(0)} dark={recommended} />
                <ResultMetric label={copy.metrics.regime} value={regime} dark={recommended} />
                <ResultMetric label={copy.metrics.pressureDrop} value={`${candidate.pressure_drop_kpa.toFixed(1)} kPa`} dark={recommended} />
                <ResultMetric
                  label={copy.metrics.pumpMargin}
                  value={candidate.pump_margin_kpa == null ? '—' : `${candidate.pump_margin_kpa.toFixed(1)} kPa`}
                  dark={recommended}
                />
                <ResultMetric label={copy.metrics.flowPerBranch} value={`${candidate.flow_per_branch_m3_h.toFixed(2)} m³/h`} dark={recommended} />
              </div>

              {candidate.reasons.length > 0 ? (
                <ul className={`mt-5 space-y-2 text-sm ${recommended ? 'text-white/65' : 'text-ink-70'}`}>
                  {candidate.reasons.map((reason) => (
                    <li key={reason}>• {localizeBackendText(reason, locale)}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>

      <details className="mt-4 rounded-[22px] border border-hair bg-white p-5">
        <summary className="cursor-pointer text-sm font-semibold">{copy.assumptions}</summary>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-70">
          {result.assumptions.map((assumption) => (
            <li key={assumption}>• {localizeBackendText(assumption, locale)}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full border border-hair bg-white px-3 py-2 text-sm">
      <span className="font-semibold">{value}</span>{' '}
      <span className="text-ink-70">{label}</span>
    </div>
  );
}

function Glossary({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const entries = Object.values(copy.glossary);

  return (
    <details className="mt-8 rounded-[22px] border border-hair bg-white p-5">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-base font-semibold">{copy.glossaryTitle}</div>
            <div className="mt-1 text-xs text-ink-45">{copy.glossaryHint}</div>
          </div>
          <span className="font-mono text-xs text-ink-45">PE · SDR · Ø · Re · Δp</span>
        </div>
      </summary>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {entries.map((entry) => (
          <p key={entry} className="rounded-[16px] bg-paper-2 px-4 py-3 text-sm leading-6 text-ink-70">
            {entry}
          </p>
        ))}
      </div>
    </details>
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
