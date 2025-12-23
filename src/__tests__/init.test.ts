import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import type * as rehydrateModule from '../rehydrate';
import type * as persistModule from '../persist';
import { REMEMBER_PERSISTED } from '../action-types';
import { ExtendedOptions } from '../types';
import { Store } from 'redux';

describe('init.ts', () => {
  let mockState: any;
  let mockStore: Partial<Store> & {
    [key: string]: any
  };

  let mockRehydrate: Partial<typeof rehydrateModule>;
  let mockPersist: Partial<typeof persistModule>;
  let mockPick: Mock;
  let mockThrottle: Mock;
  let mockDebounce: Mock;

  let init: (...args: any[]) => any;
  let args: any[];
  let options: ExtendedOptions;

  beforeEach(async () => {
    mockState = 'dummy';

    mockStore = {
      dispatch: vi.fn(),
      subscribe: vi.fn((fn: () => any) => fn()),
      getState: vi.fn(() => mockState)
    };

    mockRehydrate = {
      rehydrate: vi.fn()
    };

    mockPersist = {
      persist: vi.fn()
    };

    mockPick = vi.fn((state: any) => state);
    mockThrottle = vi.fn((fn: any) => fn);
    mockDebounce = vi.fn((fn: any) => fn);

    vi.doMock(
      '../rehydrate',
      () => mockRehydrate
    );

    vi.doMock(
      '../persist',
      () => mockPersist
    );

    vi.doMock(
      '../utils',
      () => ({
        pick: mockPick,
        throttle: mockThrottle,
        debounce: mockDebounce
      })
    );

    vi.doMock(
      '../is-deep-equal',
      () => ({
        default: () => false
      })
    );

    init = (await import('../init')).default;

    options = {
      prefix: 'yay',
      driver: {
        getItem: () => {},
        setItem: () => {}
      },
      serialize() {},
      unserialize() {},
      errorHandler() {},
      persistThrottle: 100,
      persistWholeStore: true
    };

    args = [
      mockStore,
      [1, 2, 3],
      options
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('calls rehydrate()', async () => {
    await init(...args);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { serialize, persistThrottle, ...rehydrateOpts } = args[2];

    expect(mockRehydrate.rehydrate).toHaveBeenCalledWith(
      args[0], args[1], rehydrateOpts
    );
  });

  it('calls store.subscribe()', async () => {
    await init(...args);

    expect(mockStore.subscribe).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('calls pick()', async () => {
    await init(...args);

    expect(mockPick).toHaveBeenCalledWith(
      mockState,
      args[1]
    );
  });

  it('calls throttle()', async () => {
    await init(...args);
    expect(mockThrottle).toHaveBeenCalledTimes(1);
  });

  it('calls debounce()', async () => {
    options.persistDebounce = 100;

    await init(...args);
    expect(mockDebounce).toHaveBeenCalledTimes(1);
  });

  it('calls persist()', async () => {
    await init(...args);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { unserialize, persistThrottle, ...persistOpts } = args[2];

    expect(mockPersist.persist).toHaveBeenCalledWith(
      mockState,
      {},
      persistOpts
    );
  });

  it('calls store.dispatch()', async () => {
    await init(...args);

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: REMEMBER_PERSISTED,
      payload: mockState
    });
  });

  it('does not call store.dispatch()', async () => {
    vi.resetModules();
    vi.doMock('../is-deep-equal', () => ({
      default: () => true
    }));

    vi.doMock(
      '../rehydrate',
      () => mockRehydrate
    );

    vi.doMock(
      '../persist',
      () => mockPersist
    );

    vi.doMock(
      '../utils',
      () => ({
        pick: mockPick,
        throttle: mockThrottle,
        debounce: mockDebounce
      })
    );

    init = (await import('../init')).default;
    await init(...args);

    expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
  });

  it('remembers old state between store.subscribe() calls', async () => {
    mockStore.getState = () => 'state1';
    mockStore.subscribe = (fn: Mock): any => {
      mockStore.__call_subscribe_func__ = fn;
    };

    const opts = {
      prefix: '1',
      driver: '2',
      serialize() {}
    };

    await init(
      mockStore,
      [],
      opts
    );

    await mockStore.__call_subscribe_func__();

    expect(mockPersist.persist).toHaveBeenNthCalledWith(
      1,
      'state1',
      {},
      opts
    );

    mockStore.getState = () => 'state2';
    await mockStore.__call_subscribe_func__();

    expect(mockPersist.persist).toHaveBeenNthCalledWith(
      2,
      'state2',
      'state1',
      opts
    );
  });
});
