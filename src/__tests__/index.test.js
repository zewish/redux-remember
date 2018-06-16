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

        it('exports needed functions', () => {
            const res = reduxRemember('DUMMY_DRIVER');

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
            mockDriver = 'MOCK_DRIVER'

            params = [
                mockDriver
            ];

            exec = (...args) => reduxRemember(...params)
            .combineReducers(
                ...args
            );
        });

        it('calls redux.combineReducers()', () => {
            const persistable = { persistMe: 'yay' };
            const forgettable = { forgetMe: 'nay' };

            const extra = [
                'whatever1',
                'whatever2',
                'whatever3'
            ];

            exec(
                persistable,
                forgettable,
                ...extra
            );

            mockRedux.combineReducers.should.be.calledWith(
                {
                    ...persistable,
                    ...forgettable,
                    storeLoaded: sinon.match.func
                },
                ...extra
            );
        });

        it('storeLoaded() reducer always just returns state', () => {
            mockRehydrate.rehydrateReducer = (reducers) => reducers;
            
            const res = exec();

            res.storeLoaded('123').should.equal(
                '123'
            );

            res.storeLoaded('whatever').should.equal(
                'whatever'
            );

            res.storeLoaded().should.be.false;
        });

        it('it allows changing the name of storeLoaded reducer', () => {
            const persistable = { persistMe: 'super' };
            const forgettable = { forgetMe: 'bye' };

            params.push({
                loadedKey: 'LOADED'
            });

            exec(
                persistable,
                forgettable
            );

            mockRedux.combineReducers.should.be.calledWith(
                {
                    ...persistable,
                    ...forgettable,
                    LOADED: sinon.match.func
                }
            );
        });

        it('calls rehydrateReducer()', () => {
            const persistable = {
                one: 'super',
                two: 'yay'
            };

            const forgettable = {
                byeOne: 'bye',
                byeTwo: 'cya'
            };

            exec(
                persistable,
                forgettable
            );

            mockRehydrate.rehydrateReducer.should.be.calledWith({
                ...persistable,
                ...forgettable,
                storeLoaded: sinon.match.func
            });
        });

        it('returns rehydrate reducer', () => {
            exec().should.equal('REHYDRATE_REDUCER');
        });
    });

    describe('reduxRemember().createStore()', () => {
        let mockDriver;
        let params;
        let exec;

        beforeEach(() => {
            mockDriver = 'MOCK_DRIVER_1'

            params = [
                mockDriver
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

            const persistable = {
                one: 'one',
                two: 'two'
            };

            const forgettable = {
                yay: 'cool'
            };

            mockRedux.createStore = () => store;
            mockRehydrate.rehydrateReducer = () => () => 'whatever';

            params.push({
                prefix: '123'
            });

            const {
                combineReducers,
                createStore
            } = reduxRemember(...params);

            const res = createStore(
                combineReducers(persistable, forgettable)
            );

            mockInit.should.be.calledWith(
                store,
                Object.keys(persistable),
                {
                    driver: params[0],
                    prefix: params[1].prefix
                }
            );

            res.should.equal(
                store
            );
        });
    });
});
