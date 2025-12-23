import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as utils from '../utils';

describe('utils.ts', () => {
  describe('pick()', () => {
    it('does not break for non-object values', () => {
      expect(utils.pick(null, [])).toEqual({});
      expect(utils.pick(undefined, [])).toEqual({});
      expect(utils.pick([] as any, [])).toEqual({});
      expect(utils.pick(10 as any, [])).toEqual({});
      expect(utils.pick('string' as any, [])).toEqual({});
    });

    it('works properly for objects', () => {
      const src = {
        first: 'get me',
        skipped: 'I will be skipped :(',
        third: 'get me too'
      };

      expect(utils.pick(src, ['first', 'third'])).toEqual({
        first: 'get me',
        third: 'get me too'
      });
    });

    it('does not copy non-existent properties', () => {
      const src = {
        first: 'get the first only',
        skipped: 'I will be skipped :(',
      };

      expect(utils.pick(src, ['first', 'third'] as any)).toEqual({
        first: 'get the first only'
      });
    });
  });

  describe('throttle()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('calls immediately on first call', () => {
      const spy = vi.fn();
      utils.throttle(spy, 1000)();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('throttles, and always calls with the latest call arguments', () => {
      const spy = vi.fn((value: string) => {}); // eslint-disable-line @typescript-eslint/no-unused-vars
      const fn = utils.throttle(spy, 1000);

      fn('first');
      fn('second-skipped');
      fn('third-skipped');
      fn('fourth');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith('first');

      vi.advanceTimersByTime(1000);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith('fourth');
    });
  });

  describe('debounce()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('only calls after the debounce interval', () => {
      const spy = vi.fn();
      const debouncedSpy = utils.debounce(spy, 1000);
      debouncedSpy();

      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('debounces, and only calls with the latest call arguments', () => {
      const spy = vi.fn((value: number) => {}); // eslint-disable-line @typescript-eslint/no-unused-vars
      const debouncedSpy = utils.debounce(spy, 1000);

      for (let i = 0; i < 100; i++) {
        debouncedSpy(i);
      }

      expect(spy).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith(99);
    });
  });
});
