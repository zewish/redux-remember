import * as rehydrateModule from '../rehydrate';
import * as persistModule from '../persist';
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
  let mockPick: Function;
  let mockThrottle: Function;
  let mockDebounce: Function;

  let init: (...args: any[]) => any;
  let args: any[];
  let options: Partial<ExtendedOptions>;

  beforeEach(async () => {
    mockState = 'dummy';

    mockStore = {
      dispatch: jest.fn(),
      subscribe: jest.fn((fn: () => any) => fn()),
      getState: jest.fn(() => mockState)
    };

    mockRehydrate = {
      rehydrate: jest.fn()
    };

    mockPersist = {
      persist: jest.fn()
    };

    mockPick = jest.fn((state: any) => state);
    mockThrottle = jest.fn((fn: any) => fn);
    mockDebounce = jest.fn((fn: any) => fn);

    jest.mock(
      '../rehydrate',
      () => mockRehydrate
    );

    jest.mock(
      '../persist',
      () => mockPersist
    );

    jest.mock(
      '../utils',
      () => ({
        pick: mockPick,
        throttle: mockThrottle,
        debounce: mockDebounce
      })
    );

    jest.mock(
      '../is-deep-equal',
      () => ({
        __esModule: true,
        default: () => false
      })
    );

    init = (await import('../init')).default as any;

    options = {
      prefix: 'yay',
      driver: {
        getItem: () => {},
        setItem: () => {}
      },
      serialize() {},
      unserialize() {},
      persistWholeStore: true
    };

    args = [
      mockStore,
      [1, 2, 3],
      options
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('calls rehydrate()', async () => {
    await init(...args);

    const { serialize, ...rehydrateOpts } = args[2];

    expect(mockRehydrate.rehydrate).toBeCalledWith(
      args[0], args[1], rehydrateOpts
    );
  });

  it('calls store.subscribe()', async () => {
    await init(...args);

    expect(mockStore.subscribe).toBeCalledWith(
      expect.any(Function)
    );
  });

  it('calls pick()', async () => {
    await init(...args);

    expect(mockPick).toBeCalledWith(
      mockState,
      args[1]
    );
  });

  it('calls throttle()', async () => {
    await init(...args);
    expect(mockThrottle).toBeCalledTimes(1);
  });

  it('calls debounce()', async () => {
    options.persistDebounce = 100;

    await init(...args);
    expect(mockDebounce).toBeCalledTimes(1);
  });

  it('calls persist()', async () => {
    await init(...args);

    const { unserialize, ...persistOpts } = args[2];

    expect(mockPersist.persist).toBeCalledWith(
      mockState,
      {},
      persistOpts
    );
  });

  it('calls store.dispatch()', async () => {
    await init(...args);

    expect(mockStore.dispatch).toBeCalledWith({
      type: REMEMBER_PERSISTED,
      payload: mockState
    });
  });

  it('does not call store.dispatch()', async () => {
    jest.resetModules();
    jest.mock('../is-deep-equal', () => ({
      __esModule: true,
      default: () => true
    }));

    init = (await import('../init')).default as any;
    await init(...args);

    expect(mockStore.dispatch).toBeCalledTimes(0);
  });

  it('remembers old state between store.subscribe() calls', async () => {
    mockStore.getState = () => 'state1';
    mockStore.subscribe = (fn: Function): any => {
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

    expect(mockPersist.persist).nthCalledWith(
      1,
      'state1',
      {},
      opts
    );

    mockStore.getState = () => 'state2';
    await mockStore.__call_subscribe_func__();

    expect(mockPersist.persist).nthCalledWith(
      2,
      'state2',
      'state1',
      opts
    );
  });
});
