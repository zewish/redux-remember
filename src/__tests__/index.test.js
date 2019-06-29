describe('index.js', () => {
    let mockRedux;
    let mockRehydrate;
    let mockInit;
    let index;
    let reduxRemember;

    beforeEach(() => {
        mockRedux = {
            combineReducers: spy((reducers) => reducers),
            createStore: spy(() => {})
        };

        mockRehydrate = {
            rehydrateReducer: spy(() => 'REHYDRATE_REDUCER'),
            REMEMBER_REHYDRATED: '@@REMEMBER_REHYDRATED'
        };

        mockInit = spy(() => {});

        jest.mock(
            'redux',
            () => mockRedux
        );

        jest.mock(
            '../rehydrate',
            () => mockRehydrate
        );

        jest.mock(
            '../init',
            () => mockInit
        );

        index = require('../index');

        reduxRemember = (...args) => index.default(
            ...args
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('exports proper items', () => {
        index.REMEMBER_REHYDRATED.should.equal(
            mockRehydrate.REMEMBER_REHYDRATED
        );

        index.default.should.be.a(
            'function'
        );
    });

    describe('reduxRemeber()', () => {
        it('throws when no driver', () => {
            expect(() => reduxRemember()).to.throw(
                Error,
                'redux-remember error: driver required'
            );
        });

        it('throws when persistableKeys is not an array', () => {
            expect(() => reduxRemember('driver1')).to.throw(
                Error,
                'redux-remember error: persistableKeys needs to be an array'
            );
        });

        it('exports needed functions', () => {
            const res = reduxRemember('DUMMY_DRIVER', []);

            res.combineReducers.should.be.a(
                'function'
            );

            res.createStore.should.be.a(
                'function'
            );
        });
    });

    describe('reduxRemember().combineReducers()', () => {
        let mockDriver;
        let params;
        let exec;

        beforeEach(() => {
            mockDriver = 'MOCK_DRIVER';

            params = [
                mockDriver,
                []
            ];

            exec = (...args) => reduxRemember(...params)
            .combineReducers(
                ...args
            );
        });

        it('calls redux.combineReducers()', () => {
            const reducers = {
                persistMe: 'yay',
                forgetMe: 'nay'
            };

            const extra = [
                'whatever1',
                'whatever2',
                'whatever3'
            ];

            exec(
                reducers,
                ...extra
            );

            mockRedux.combineReducers.should.be.calledWith(
                {
                    ...reducers,
                    __rehydrated__: sinon.match.func
                },
                ...extra
            );
        });

        it('__rehydrated__ reducer always just returns state', () => {
            mockRehydrate.rehydrateReducer = (reducers) => reducers;

            const res = exec();

            res.__rehydrated__('123').should.equal(
                '123'
            );

            res.__rehydrated__('whatever').should.equal(
                'whatever'
            );

            res.__rehydrated__().should.be.false;
        });

        it('it allows changing the name of rehydratedKey reducer', () => {
            const reducers = {
                persistMe: 'yay',
                forgetMe: 'nay'
            };

            params.push({
                rehydratedKey: 'LOADED'
            });

            exec(reducers);

            mockRedux.combineReducers.should.be.calledWith(
                {
                    ...reducers,
                    LOADED: sinon.match.func
                }
            );
        });

        it('calls rehydrateReducer()', () => {
            const reducers = {
                one: 'super',
                two: 'yay',
                three: 'bye'
            };

            exec(reducers);

            mockRehydrate.rehydrateReducer.should.be.calledWith({
                ...reducers,
                __rehydrated__: sinon.match.func
            });
        });

        it('returns rehydrate reducer', () => {
            exec().should.equal('REHYDRATE_REDUCER');
        });
    });

    describe('reduxRemember().createStore()', () => {
        let mockDriver;
        let mockPersistableKeys;
        let params;
        let exec;

        beforeEach(() => {
            mockDriver = 'MOCK_DRIVER_1';
            mockPersistableKeys = [];

            params = [
                mockDriver,
                mockPersistableKeys
            ];

            exec = (...args) => reduxRemember(...params)
            .createStore(
                ...args
            );
        });

        it('calls reducer() with no args', () => {
            const reducer = spy(() => {});

            exec(reducer);

            reducer.should.be.calledWith();
        });

        it('calls reducer() with no args', () => {
            const reducer = spy(() => {});

            exec(reducer, () => {});

            reducer.should.be.calledWith();
        });

        it('calls reducer() with preloaded state', () => {
            const reducer = spy(() => {});
            const preloadedState = { preloaded: 'yay' };

            exec(reducer, preloadedState);

            reducer.should.be.calledWith(
                preloadedState
            );
        });

        it('calls createStore() with reducer() result', () => {
            const reducer = () => 'rehydrateReducer!';

            exec(
                reducer,
                { 'preloaded state': '123' },
                'other', 'stuff'
            );

            mockRedux.createStore.should.be.calledWith(
                'rehydrateReducer!',
                'other', 'stuff'
            );
        });

        it('calls createStore() with reducer() result and enhancer', () => {
            const enhancer = () => {};

            exec(
                () => 'rehydrateReducer2',
                enhancer,
                'some', 'other', 'stuff'
            );

            mockRedux.createStore.should.be.calledWith(
                'rehydrateReducer2',
                enhancer,
                'some', 'other', 'stuff'
            );
        });

        it('calls init() and returns store', async () => {
            const store = 'DUMMY_STORE';

            const reducers = {
                one: 'one',
                two: 'two',
                three: 'three'
            };

            mockRedux.createStore = () => store;
            mockRehydrate.rehydrateReducer = () => () => 'whatever';

            params = [
                mockDriver,
                [ 'one', 'two' ],
                {
                    prefix: '123',
                    serialize() {},
                    unserialize() {}
                }
            ];

            const {
                combineReducers,
                createStore
            } = reduxRemember(...params);

            const res = createStore(
                combineReducers(reducers)
            );

            mockInit.should.be.calledWith(
                store,
                params[1],
                {
                    driver: params[0],
                    prefix: params[2].prefix,
                    serialize: params[2].serialize,
                    unserialize: params[2].unserialize
                }
            );

            res.should.equal(
                store
            );
        });
    });
});
