import { REMEMBER_PERSISTED } from '../action-types';

describe('init.js', () => {
    let mockState;
    let mockStore;
    let mockRehydrate;
    let mockPersist;
    let mockPick;

    let init;
    let args;

    beforeEach(() => {
        mockState = 'dummy';

        mockStore = {
            dispatch: spy(() => {}),
            subscribe: spy((fn) => fn()),
            getState: spy(() => mockState)
        };

        mockRehydrate = {
            rehydrate: spy(() => {})
        };

        mockPersist = {
            persist: spy(() => {})
        };

        mockPick = spy((state) => state);

        jest.mock(
            '../rehydrate',
            () => mockRehydrate
        );

        jest.mock(
            '../persist',
            () => mockPersist
        );

        jest.mock(
            'lodash.pick',
            () => mockPick
        );

        init = require('../init').default;

        args = [
            mockStore,
            [ 1, 2, 3 ],
            {
                prefix: 'yay',
                driver: 'some-driver',
                serialize() {},
                unserialize() {}
            }
        ];
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('calls rehydrate()', async () => {
        await init(...args);

        const { serialize, ...rehydrateOpts } = args[2];

        mockRehydrate.rehydrate.should.be.calledWith(
            args[0], args[1], rehydrateOpts
        );
    });

    it('calls store.subscribe()', async () => {
        await init(...args);

        mockStore.subscribe.should.be.calledWith(
            sinon.match.func
        );
    });

    it('calls lodash.pick()', async () => {
        await init(...args);

        mockPick.should.be.calledWith(
            mockState,
            args[1]
        );
    });

    it('calls persist()', async () => {
        await init(...args);

        const { unserialize, ...persistOpts } = args[2];

        mockPersist.persist.should.be.calledWith(
            mockState,
            {},
            persistOpts
        );
    });

    it('calls store.dispatch()', async () => {
        await init(...args);

        mockStore.dispatch.should.be.calledWith({
            type: REMEMBER_PERSISTED,
            payload: mockState
        });
    });

    it('remembers old state between store.subscribe() calls', async () => {
        mockStore = {
            dispatch() {},
            subscribe: (fn) => {
                mockStore.__call_subscribe_func__ = fn;
            },
            getState: () => 'state1'
        };

        const opts = { prefix: '1', driver: '2', serialize() {} };

        await init(
            mockStore,
            [],
            opts
        );

        await mockStore.__call_subscribe_func__();

        mockPersist.persist.firstCall.should.be.calledWith(
            'state1',
            {},
            opts
        );

        mockStore.getState = () => 'state2';
        await mockStore.__call_subscribe_func__();

        mockPersist.persist.secondCall.should.be.calledWith(
            'state2',
            'state1',
            opts
        );
    });
});
