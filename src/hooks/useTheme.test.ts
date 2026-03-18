import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  it('throws a descriptive error when used outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
  });
});
