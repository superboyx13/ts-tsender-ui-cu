import { describe, it, expect, vi } from 'vitest';
import { calculateTotal } from './calculateTotal';


// Test suite for calculateTotal utility function
describe('calculateTotal', () => {
  it('should work with newlines', () => {
    expect(calculateTotal('100\n200\n300')).toBe(600);
  });

  it('should sum comma-separated numbers', () => {
    expect(calculateTotal('100,200,300')).toBe(600);
  });

  it('should handle mixed delimiters', () => {
    expect(calculateTotal('100,200\n300')).toBe(600);
  });

  it('should ignore empty lines/entries', () => {
    expect(calculateTotal('100,\n200\n\n300')).toBe(600);
  });

  it('should handle whitespace', () => {
    expect(calculateTotal(' 100 , 200 \n 300 ')).toBe(600);
  });

  it('should return 0 for empty string', () => {
    expect(calculateTotal('')).toBe(0);
  });

  it('should skip invalid numbers with warning', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    expect(calculateTotal('100,abc,200')).toBe(300);
    expect(consoleSpy).toHaveBeenCalledWith('Invalid number encountered: "abc"');
    consoleSpy.mockRestore();
  });

  it('should handle decimal numbers', () => {
    expect(calculateTotal('100.5,200.25\n99.25')).toBe(400);
  });

  it('should handle single number', () => {
    expect(calculateTotal('500')).toBe(500);
  });
});