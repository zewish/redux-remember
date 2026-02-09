import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import colors from 'picocolors';
import { RemigrateCliError, log } from '../../../cli/utils/common.ts';

describe('cli/utils/common.ts', () => {
  describe('RemigrateCliError', () => {
    it('behaves like an extension class of Error', () => {
      const message = 'something went wrong';
      const error = new RemigrateCliError(message);
      expect(error).toBeInstanceOf(RemigrateCliError);
      expect(error.name).toBe('RemigrateCliError');
      expect(error.message).toBe(message);
    });
  });

  describe('cli/utils/log.ts', () => {
    let infoSpy: Mock<typeof console.info>;

    beforeEach(() => {
      infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('info()', () => {
      it('logs message to console.info', () => {
        log.info('test message');
        expect(infoSpy).toHaveBeenCalledWith('test message');
      });
    });

    describe('success()', () => {
      it('logs message with green checkmark to console.info', () => {
        log.success('operation completed');
        expect(infoSpy).toHaveBeenCalledWith(`${colors.green('✓')} operation completed`);
      });
    });

    describe('skip()', () => {
      it('logs message with dim dash to console.info', () => {
        log.skip('skipped item');
        expect(infoSpy).toHaveBeenCalledWith(`${colors.dim('-')} skipped item`);
      });
    });

    describe('warn()', () => {
      it('logs message with yellow warning to console.warn', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        log.warn('warning message');
        expect(spy).toHaveBeenCalledWith(`${colors.yellow('⚠')} warning message`);
      });
    });

    describe('error()', () => {
      it('logs message with red X to console.error', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        log.error('error message');
        expect(spy).toHaveBeenCalledWith(`${colors.red('✗')} error message`);
      });
    });
  });
});
