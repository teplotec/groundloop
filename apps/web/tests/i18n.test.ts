import { describe, expect, it } from 'vitest';

import { COPY, localizeBackendText } from '../src/lib/i18n';

describe('engineering glossary', () => {
  it('keeps Ukrainian as the product default copy', () => {
    expect(COPY.uk.resultTitle).toBe('Порівняння кандидатів');
    expect(COPY.uk.pipe.outerDiameter).toBe('Зовнішній Ø');
  });

  it('localizes known API assumptions', () => {
    expect(
      localizeBackendText(
        'Hydraulic calculation uses Darcy-Weisbach pressure loss and the Haaland approximation.',
        'uk',
      ),
    ).toContain('Дарсі—Вейсбаха');
  });

  it('localizes dynamic Reynolds warnings without changing the numbers', () => {
    expect(
      localizeBackendText('Reynolds 2085 is below the provisional design target of 2500', 'uk'),
    ).toBe('Число Рейнольдса 2085 нижче попереднього розрахункового критерію 2500.');
  });

  it('leaves backend text unchanged in English', () => {
    const message = 'Pipe pressure drop exceeds available pump head at the design flow';
    expect(localizeBackendText(message, 'en')).toBe(message);
  });
});
