import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

describe('Testing Setup', () => {
  test('vitest is working', () => {
    expect(true).toBe(true);
  });

  test('fast-check is working', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n === n;
      })
    );
  });
});
