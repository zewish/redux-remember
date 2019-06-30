import { REMEMBER_REHYDRATED } from '../action-types';

describe('rehydrate.js', () => {
    let mod;

    beforeEach(() => {
        mod = require('../rehydrate');
    });

    describe('loadAll()', () => {
        let mockPrefix;
        let mockDriver;

        const exec = (opts = {}) => mod.loadAll({
            persistableKeys: [],
            prefix: mockPrefix,
            driver: mockDriver,
            unserialize: (o) => o,
            ...opts
        });

        beforeEach(() => {
            mockDriver = {
                getItem: spy((key) => `"${key}"`)
            };

            mockPrefix = 'pref0.';
        });

        it('should call driver.getItem()', async () => {
            await exec();

            mockDriver.getItem.should.be.calledWith(
                `${mockPrefix}state@@`
            );
        });

        it('returns an empty object', async () => {
            const res1 = await exec({
                driver: {
                    getItem: async () => null
                }
            });

            res1.should.eql({});

            const res2 = await exec({
                driver: {
                    getItem: async () => undefined
                }
            });

            res2.should.eql({});
        });

        it('returns unserialized data', async () => {
            const data = {
                keyA: 'bla',
                keyB: 'yay',
                skipMe: 'byebye'
            };

            const res = await exec({
                persistableKeys: [ 'keyA', 'keyB' ],
                unserialize: () => data
            });

            res.should.eql({
                keyA: 'bla',
                keyB: 'yay'
            });
        });

        it('returns filtered data', async () => {
            const data = {
                keyZ: 'wow',
                skipMe: 'byebye',
                keyY: 'cool',
            };

            const res = await exec({
                persistableKeys: [ 'keyZ', 'keyY' ],
                driver: {
                    getItem: () => Promise.resolve(data)
                },
                unserialize: (o) => o
            });

            res.should.eql({
                keyZ: 'wow',
                keyY: 'cool'
            });
        });
    });

    describe('loadAllKeyed()', () => {
        let mockPrefix;
        let mockDriver;

        const exec = (opts = {}) => mod.loadAllKeyed({
            persistableKeys: [],
            prefix: mockPrefix,
            driver: mockDriver,
            unserialize: (o) => o,
            ...opts
        });

        beforeEach(() => {
            mockDriver = {
                getItem: spy((key) => `"${key}"`)
            };

            mockPrefix = 'prefZ.';
        });

        it('should call driver.getItem()', async () => {
            await exec({
                persistableKeys: [ 'say', 'what' ]
            });

            mockDriver.getItem.firstCall.should.be.calledWith(
                `${mockPrefix}say`
            );

            mockDriver.getItem.secondCall.should.be.calledWith(
                `${mockPrefix}what`
            );
        });

        it('returns unserialized state', async () => {
            const res = await exec({
                persistableKeys: [ 'yay', 'k' ],
                unserialize: (
                    jest.fn()
                    .mockReturnValueOnce('val1')
                    .mockReturnValueOnce('val2')
                )
            });

            res.should.eql({
                yay: 'val1',
                k: 'val2'
            });
        });

        it('returns state filtering null and undefined', async () => {
            const res = await exec({
                persistableKeys: [ 'so', 'iAmNull', 'great', 'iAmUndefined' ],
                driver: {
                    getItem: (
                        jest.fn()
                        .mockReturnValueOnce('val7')
                        .mockReturnValueOnce(null)
                        .mockReturnValueOnce('val8')
                        .mockReturnValueOnce(undefined)
                    )
                }
            });

            res.should.eql({ so: 'val7', great: 'val8' });
        });
    });

    describe('rehydrate()', () => {
        let mockStore;
        let persistableKeys;
        let mockPrefix;
        let mockDriver;

        const exec = (opts = {}) => mod.rehydrate(
            mockStore,
            persistableKeys,
            {
                prefix: mockPrefix,
                driver: mockDriver,
                ...opts
            }
        );

        beforeEach(() => {
            persistableKeys = [ 3, 2, 1 ];

            mockStore = {
                dispatch: spy(() => {})
            };

            mockDriver = {
                getItem: spy((key) => `"${key}"`)
            };

            mockPrefix = 'pref1.';
        });

        it('calls console.warn()', async () => {
            const error = 'UH OH! OH NO!';

            const consoleWarn = global.console.warn;
            global.console.warn = spy(() => {});

            mockDriver.getItem = () => Promise.reject(error);

            await exec();
            await exec({ persistWholeStore: true });

            global.console.warn.firstCall.should.be.calledWith(
                'redux-remember: rehydrate error',
                error
            );

            global.console.warn.secondCall.should.be.calledWith(
                'redux-remember: rehydrate error',
                error
            );

            global.console.warn = consoleWarn;
        });

        it('calls store.dispatch()', async () => {
            await exec();

            await exec({
                driver: {
                    getItem: async () => ({
                        3: 'zaz',
                        2: 'lol',
                        100: 'nope'
                    })
                },
                unserialize: (o) => o,
                persistWholeStore: true
            });

            mockStore.dispatch.firstCall.should.be.calledWith( {
                type: REMEMBER_REHYDRATED,
                payload: {
                    3: "pref1.3",
                    2: "pref1.2",
                    1: "pref1.1"
                }
            });

            mockStore.dispatch.secondCall.should.be.calledWith({
                type: REMEMBER_REHYDRATED,
                payload: {
                    '2': 'lol',
                    '3': 'zaz'
                }
            });
        });

        it('works if no keys were given', async () => {
            persistableKeys = undefined;
            await exec();
        });
    });

    describe('rehydrateReducer()', () => {
        let mockReducer;

        const exec = (state, action) => mod.rehydrateReducer(
            mockReducer
        )(state, action);

        beforeEach(() => {
            mockReducer = spy((state, action) => state);
        });

        it('does not break when state and action are empty', () => {
            exec(undefined, undefined).should.eql(
                {}
            );
        });

        it('returns preloaded state', () => {
            const state = { 'cool': 'state' };

            exec(state, { type: '@@INIT' }).should.eql(
                state
            );
        });

        it('returns rehydrated state', () => {
            const payload = {
                wow: 'beep',
                nah: 'lol'
            };

            exec(
                null,
                {
                    type: REMEMBER_REHYDRATED,
                    payload
                }
            )
            .should.eql(payload);
        });

        it('does not fail if there is missing payload', () => {
            exec(
                null,
                { type: REMEMBER_REHYDRATED }
            )
            .should.eql({});
        });
    });
});
