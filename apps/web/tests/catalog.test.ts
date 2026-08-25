import { describe, expect, it } from 'vitest';

import { branchCount, flowPerBranch } from '../src/lib/catalog';

describe('dependent-aware borefield calculations', () => {
  it('splits Single-U flow over one branch per borehole', () => {
    expect(branchCount(5, 'single_u')).toBe(5);
    expect(flowPerBranch(2.4, 5, 'single_u')).toBeCloseTo(0.48);
  });

  it('splits Double-U flow over two branches per borehole', () => {
    expect(branchCount(5, 'double_u')).toBe(10);
    expect(flowPerBranch(2.4, 5, 'double_u')).toBeCloseTo(0.24);
  });
});
