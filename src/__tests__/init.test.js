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
                driver: 'some-driver'
            }
        ];
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('calls rehydrate()', async () => {
        await init(...args);

        mockRehydrate.rehydrate.should.be.calledWith(
            ...args
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

        mockPersist.persist.should.be.calledWith(
            mockState,
            {},
            args[2]
        );
    });

    it('remembers old state between store.subscribe() calls', async () => {
        mockStore = {
            subscribe: (fn) => {
                mockStore.__call_subscribe_func__ = fn;
            },
            getState: () => 'state1'
        };

        const opts = { prefix: '1', driver: '2' };

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