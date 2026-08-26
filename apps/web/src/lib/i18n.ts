export type Locale = 'uk' | 'en';

export const DEFAULT_LOCALE: Locale = 'uk';
export const LOCALE_STORAGE_KEY = 'groundloop.locale';

export const COPY = {
  uk: {
    languageName: 'Українська',
    shortLanguage: 'UA',
    alpha: 'гідравліка · alpha',
    eyebrow: 'Проєктування ґрунтового контуру',
    heroTitle: 'Підбираємо контур цифрами, а не звичкою.',
    heroBody:
      'Усі ключові параметри видно одразу. Обирай конфігурацію, змінюй числові значення, а GroundLoop перерахує залежні параметри та порівняє кандидати.',
    sections: {
      flow: 'Розрахункова витрата',
      boreholes: 'Свердловини',
      fluid: 'Теплоносій',
      pipes: 'Труби для порівняння',
      pump: 'Циркуляційний насос',
    },
    hints: {
      boreholes: 'Числові параметри вводимо значеннями, а геометрію U-зонда обираємо карткою.',
      fluid:
        'Типові концентрації показані одночасно. Вибір одразу змінює густину, в’язкість і число Рейнольдса в розрахунку.',
      pipes:
        'Обери всі реальні кандидати. Для кожної труби показуємо матеріал, геометрію перерізу та гідравлічний результат.',
    },
    fields: {
      totalFlow: 'Загальна витрата',
      boreholes: 'Кількість свердловин',
      depth: 'Глибина',
      headerRun: 'Відстань до колектора',
      pumpHead: 'Доступний перепад тиску в робочій точці',
    },
    help: {
      totalFlow: 'Пізніше це значення можна буде підтягувати з вибраної моделі теплового насоса.',
      pumpHead: 'Поточна робоча точка: {flow} м³/год. Наступний етап — повна характеристика насоса.',
    },
    dependent: 'Залежні параметри',
    branchFlow: 'м³/год на гілку',
    parallelBranches: 'паралельні гілки',
    previousChoices: 'Що вже залежить від попередніх виборів',
    stats: {
      branches: 'гілки',
      flowPerBranch: 'витрата/гілка',
      fluid: 'теплоносій',
      candidates: 'кандидати',
    },
    calculate: 'Порівняти {count} труби',
    calculating: 'Розраховую…',
    calculationFailed: 'Розрахунок не виконано',
    resultEyebrow: 'Результат розрахунку',
    resultTitle: 'Порівняння кандидатів',
    provisional: 'попередня модель',
    statuses: {
      pass: 'проходить',
      warning: 'увага',
      fail: 'не проходить',
      recommended: 'рекомендовано',
    },
    regimes: {
      laminar: 'ламінарний',
      transitional: 'перехідний',
      turbulent: 'турбулентний',
    },
    metrics: {
      velocity: 'швидкість',
      reynolds: 'число Re',
      regime: 'режим течії',
      pressureDrop: 'втрати тиску',
      pumpMargin: 'запас тиску',
      flowPerBranch: 'витрата/гілка',
    },
    assumptions: 'Припущення та межі поточної моделі',
    pipe: {
      material: 'Матеріал',
      outerDiameter: 'Зовнішній Ø',
      wall: 'Стінка',
      innerDiameter: 'Внутрішній Ø',
      baseline: 'базовий',
      geometry: 'Переріз труби',
      dimensionsHelp: 'Формат 40 × 3.7 означає зовнішній діаметр 40 мм і товщину стінки 3.7 мм.',
    },
    glossaryTitle: 'Інженерний словник',
    glossaryHint: 'Короткі визначення термінів, які використовує GroundLoop.',
    glossary: {
      pe100rc:
        'PE100-RC — поліетилен класу PE100 з підвищеною стійкістю до повільного росту тріщин; типовий матеріал для геотермальних зондів.',
      sdr: 'SDR — відношення зовнішнього діаметра труби до товщини її стінки.',
      od: 'Зовнішній Ø (OD) — номінальний зовнішній діаметр труби.',
      id: 'Внутрішній Ø (ID) — розрахований внутрішній прохід труби.',
      re: 'Re — число Рейнольдса, безрозмірний показник режиму течії.',
      dp: 'Δp — втрати тиску на вибраній ділянці контуру.',
    },
    loops: {
      single_u: {
        label: 'Одинарний U-зонд',
        description: 'Одна U-труба в кожній свердловині. Одна гідравлічна гілка на свердловину.',
        badge: 'Single-U',
      },
      double_u: {
        label: 'Подвійний U-зонд',
        description: 'Дві U-труби в кожній свердловині. Потік ділиться між удвічі більшою кількістю гілок.',
        badge: 'Double-U',
      },
    },
    fluids: {
      'water-reference': {
        label: 'Вода',
        description: 'Еталонний гідравлічний стан для розробки та порівняння.',
      },
      'pg20-demo': {
        label: 'PG 20%',
        description: '20% пропіленгліколю. Робочий геотермальний склад для порівняння.',
        advisory:
          'Використовуй геотермальний теплоносій, для якого виробник дозволяє концентрацію 20%. Для деяких інгібованих складів мінімальна концентрація для захисту від корозії може бути вищою.',
      },
      'pg25-demo': {
        label: 'PG 25%',
        description: '25% пропіленгліколю. Типовий діапазон із більшим запасом захисту від корозії.',
      },
      'pg30-demo': {
        label: 'PG 30%',
        description: '30% пропіленгліколю. Більший запас до замерзання, але вища в’язкість.',
      },
    },
  },
  en: {
    languageName: 'English',
    shortLanguage: 'EN',
    alpha: 'hydraulics · alpha',
    eyebrow: 'Ground-loop design',
    heroTitle: 'Size the loop with numbers, not habit.',
    heroBody:
      'Keep the key parameters visible, choose the configuration, edit the numeric inputs, and let GroundLoop recalculate dependent values and compare candidates.',
    sections: {
      flow: 'Design flow',
      boreholes: 'Boreholes',
      fluid: 'Heat-transfer fluid',
      pipes: 'Pipe candidates',
      pump: 'Circulation pump',
    },
    hints: {
      boreholes: 'Enter continuous values numerically and choose the U-tube geometry with a card.',
      fluid:
        'Typical concentrations are visible together. The choice immediately changes density, viscosity, and Reynolds number in the calculation.',
      pipes:
        'Select every realistic candidate. Each card exposes material, cross-section geometry, and the hydraulic result.',
    },
    fields: {
      totalFlow: 'Total flow',
      boreholes: 'Borehole count',
      depth: 'Depth',
      headerRun: 'Distance to manifold',
      pumpHead: 'Available pressure differential at the operating point',
    },
    help: {
      totalFlow: 'Later this value can come directly from the selected heat-pump model.',
      pumpHead: 'Current operating point: {flow} m³/h. The next step is a full pump curve.',
    },
    dependent: 'Dependent parameters',
    branchFlow: 'm³/h per branch',
    parallelBranches: 'parallel branches',
    previousChoices: 'Already determined by earlier choices',
    stats: {
      branches: 'branches',
      flowPerBranch: 'flow/branch',
      fluid: 'fluid',
      candidates: 'candidates',
    },
    calculate: 'Compare {count} pipes',
    calculating: 'Calculating…',
    calculationFailed: 'Calculation failed',
    resultEyebrow: 'Calculation result',
    resultTitle: 'Candidate comparison',
    provisional: 'provisional model',
    statuses: {
      pass: 'pass',
      warning: 'warning',
      fail: 'fail',
      recommended: 'recommended',
    },
    regimes: {
      laminar: 'laminar',
      transitional: 'transitional',
      turbulent: 'turbulent',
    },
    metrics: {
      velocity: 'velocity',
      reynolds: 'Reynolds Re',
      regime: 'flow regime',
      pressureDrop: 'pressure drop',
      pumpMargin: 'pump margin',
      flowPerBranch: 'flow/branch',
    },
    assumptions: 'Assumptions and current model limits',
    pipe: {
      material: 'Material',
      outerDiameter: 'Outer Ø',
      wall: 'Wall',
      innerDiameter: 'Inner Ø',
      baseline: 'baseline',
      geometry: 'Pipe cross-section',
      dimensionsHelp: 'The format 40 × 3.7 means a 40 mm outside diameter and a 3.7 mm wall thickness.',
    },
    glossaryTitle: 'Engineering glossary',
    glossaryHint: 'Short definitions for the terms used by GroundLoop.',
    glossary: {
      pe100rc:
        'PE100-RC is PE100 polyethylene with enhanced resistance to slow crack growth and is commonly used for geothermal probes.',
      sdr: 'SDR is the ratio between the pipe outside diameter and its wall thickness.',
      od: 'Outer Ø (OD) is the nominal outside diameter of the pipe.',
      id: 'Inner Ø (ID) is the calculated internal flow diameter.',
      re: 'Re is the Reynolds number, a dimensionless indicator of the flow regime.',
      dp: 'Δp is the pressure loss across the selected part of the loop.',
    },
    loops: {
      single_u: {
        label: 'Single-U probe',
        description: 'One U-tube per borehole. One hydraulic branch per borehole.',
        badge: 'Single-U',
      },
      double_u: {
        label: 'Double-U probe',
        description: 'Two U-tubes per borehole. Flow is divided across twice as many branches.',
        badge: 'Double-U',
      },
    },
    fluids: {
      'water-reference': {
        label: 'Water',
        description: 'Reference hydraulic state for development and comparison.',
      },
      'pg20-demo': {
        label: 'PG 20%',
        description: '20% propylene glycol. Geothermal working formulation for comparison.',
        advisory:
          'Use a geothermal formulation approved by the manufacturer for 20% concentration. Some inhibited products require a higher minimum concentration for corrosion protection.',
      },
      'pg25-demo': {
        label: 'PG 25%',
        description: '25% propylene glycol. A common range with additional corrosion-protection margin.',
      },
      'pg30-demo': {
        label: 'PG 30%',
        description: '30% propylene glycol. More freeze protection, but higher viscosity.',
      },
    },
  },
} as const;

const ASSUMPTION_TRANSLATIONS: Record<string, string> = {
  'Hydraulic calculation uses Darcy-Weisbach pressure loss and the Haaland approximation.':
    'Гідравлічний розрахунок використовує рівняння Дарсі—Вейсбаха для втрат тиску та апроксимацію Гааланда для коефіцієнта тертя.',
  'PE absolute roughness is provisionally fixed at 1.5 micrometres.':
    'Абсолютну шорсткість PE попередньо прийнято рівною 1.5 мкм.',
  'The current model treats borehole branches as balanced parallel branches.':
    'Поточна модель вважає гілки свердловин гідравлічно збалансованими та з’єднаними паралельно.',
  'Straight borehole and supply/return header pipe are included; fittings, collector/manifold network, heat-pump exchanger, filter, and valve losses are not yet included.':
    'Враховано прямі ділянки труби в свердловині та подачу/повернення до колектора; місцеві опори, колекторна мережа, теплообмінник теплового насоса, фільтр і арматура поки не враховані.',
  'The pump input is a single operating-point head, not a full interpolated pump curve.':
    'Для насоса поки задається одна робоча точка за перепадом тиску, а не повна інтерпольована характеристика.',
  'Reynolds 2500 is currently used as a provisional design screening target.':
    'Число Рейнольдса 2500 поки використовується як попередній критерій гідравлічного відбору.',
  'Pipe pressure drop exceeds available pump head at the design flow':
    'Втрати тиску в трубі перевищують доступний перепад тиску насоса за розрахункової витрати.',
};

export function localizeBackendText(text: string, locale: Locale): string {
  if (locale === 'en') return text;

  const direct = ASSUMPTION_TRANSLATIONS[text];
  if (direct) return direct;

  const reynolds = text.match(/^Reynolds (\d+(?:\.\d+)?) is below the provisional design target of (\d+(?:\.\d+)?)$/);
  if (reynolds) {
    return `Число Рейнольдса ${reynolds[1]} нижче попереднього розрахункового критерію ${reynolds[2]}.`;
  }

  return text;
}

export function formatTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)),
    template,
  );
}
