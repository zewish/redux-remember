import * as utils from '../utils.js';

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
  });

  describe('throttle()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('calls immediately on first call', () => {
      const spy = jest.fn();
      utils.throttle(spy, 1000)();
      expect(spy).toBeCalledTimes(1);
    });

    it('throttles, and always calls with the latest call arguments', () => {
      const spy = jest.fn((value: string) => {});
      const fn = utils.throttle(spy, 1000);

      fn('first');
      fn('second-skipped');
      fn('third-skipped');
      fn('fourth');

      expect(spy).toBeCalledTimes(1);
      expect(spy).lastCalledWith('first');

      jest.advanceTimersByTime(1000);
      expect(spy).toBeCalledTimes(2);
      expect(spy).lastCalledWith('fourth');
    });
  });
});
