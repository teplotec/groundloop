export type Choice<T extends string = string> = {
  id: T;
  label: string;
  description: string;
  badge?: string;
};

export type FluidChoice = Choice & {
  concentrationPercent: number;
  densityKgM3: number;
  dynamicViscosityPaS: number;
  temperatureC: number;
  provisional: boolean;
  advisory?: string;
};

export type PipeChoice = Choice & {
  material: 'PE80' | 'PE100' | 'PE100-RC';
  outerDiameterMm: number;
  wallThicknessMm: number;
};

export const LOOP_CONFIGURATIONS: Choice<'single_u' | 'double_u'>[] = [
  {
    id: 'single_u',
    label: 'Single-U',
    description: 'One U-tube per borehole. One hydraulic branch per borehole.',
  },
  {
    id: 'double_u',
    label: 'Double-U',
    description: 'Two U-tubes per borehole. Flow is divided across twice as many branches.',
  },
];

export const FLUIDS: FluidChoice[] = [
  {
    id: 'water-reference',
    label: 'Water',
    description: 'Reference hydraulic state for development and comparison.',
    concentrationPercent: 0,
    densityKgM3: 999.9,
    dynamicViscosityPaS: 0.00179,
    temperatureC: 0,
    provisional: false,
  },
  {
    id: 'pg20-demo',
    label: 'PG 20%',
    description: 'Propylene glycol 20% by volume. Geothermal-specific formulation path.',
    badge: 'GEO',
    concentrationPercent: 20,
    densityKgM3: 1022,
    dynamicViscosityPaS: 0.0032,
    temperatureC: 0,
    provisional: true,
    advisory:
      'Use a geothermal formulation approved for 20% concentration. Generic inhibited PG products may require a higher concentration for corrosion protection.',
  },
  {
    id: 'pg25-demo',
    label: 'PG 25%',
    description: 'Propylene glycol 25% by volume. Common corrosion-protection range.',
    concentrationPercent: 25,
    densityKgM3: 1027,
    dynamicViscosityPaS: 0.0041,
    temperatureC: 0,
    provisional: true,
  },
  {
    id: 'pg30-demo',
    label: 'PG 30%',
    description: 'Propylene glycol 30% by volume. Higher freeze margin, higher viscosity.',
    concentrationPercent: 30,
    densityKgM3: 1031,
    dynamicViscosityPaS: 0.0052,
    temperatureC: 0,
    provisional: true,
  },
];

export const PIPES: PipeChoice[] = [
  {
    id: 'pe100rc-32x3.0',
    label: '32 × 3.0',
    description: 'PE100-RC · SDR11 · ID 26.0 mm',
    material: 'PE100-RC',
    outerDiameterMm: 32,
    wallThicknessMm: 3.0,
  },
  {
    id: 'pe100rc-40x3.7',
    label: '40 × 3.7',
    description: 'PE100-RC · SDR11 · ID 32.6 mm',
    badge: 'baseline',
    material: 'PE100-RC',
    outerDiameterMm: 40,
    wallThicknessMm: 3.7,
  },
  {
    id: 'pe100-40x2.4',
    label: '40 × 2.4',
    description: 'PE100 · SDR17 · ID 35.2 mm',
    material: 'PE100',
    outerDiameterMm: 40,
    wallThicknessMm: 2.4,
  },
  {
    id: 'pe100rc-50x4.6',
    label: '50 × 4.6',
    description: 'PE100-RC · SDR11 · ID 40.8 mm',
    material: 'PE100-RC',
    outerDiameterMm: 50,
    wallThicknessMm: 4.6,
  },
];

export function branchCount(boreholes: number, configuration: 'single_u' | 'double_u') {
  return boreholes * (configuration === 'double_u' ? 2 : 1);
}

export function flowPerBranch(
  totalFlowM3H: number,
  boreholes: number,
  configuration: 'single_u' | 'double_u',
) {
  return totalFlowM3H / branchCount(boreholes, configuration);
}
