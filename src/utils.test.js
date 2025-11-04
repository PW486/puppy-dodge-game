import { describe, it, expect, beforeEach } from 'vitest';
import { collision, formatScore, storage } from './utils';

describe('collision', () => {
  it('detects collision between overlapping rectangles', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: 5, width: 10, height: 10 };
    expect(collision(a, b)).toBe(true);
  });

  it('returns false for non-overlapping rectangles', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 20, y: 20, width: 10, height: 10 };
    expect(collision(a, b)).toBe(false);
  });
});

describe('formatScore', () => {
  it('formats score with padding and commas', () => {
    expect(formatScore(1234)).toBe('001,234');
    expect(formatScore(0)).toBe('000,000');
    expect(formatScore(999999)).toBe('999,999');
  });
});

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves values', () => {
    storage.set('test', { score: 100 });
    expect(storage.get('test')).toEqual({ score: 100 });
  });

  it('returns default value for missing keys', () => {
    expect(storage.get('missing', 'default')).toBe('default');
  });
});