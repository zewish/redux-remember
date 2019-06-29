import { REMEMBER_REHYDRATED } from '../action-types';

describe('rehydrate.js', () => {
    let rehydrate;

    beforeEach(() => {
        rehydrate = require('../rehydrate');
    });

    it('exports proper items', async () => {
        rehydrate.rehydrate.should.be.a(
            'function'
        );

        rehydrate.rehydrateReducer.should.be.a(
            'function'
        );
    });

    describe('rehydrate()', () => {
        let mockStore;
        let persistableKeys;
        let mockPrefix;
        let mockDriver;

        const exec = () => rehydrate.rehydrate(
            mockStore,
            persistableKeys,
            {
                prefix: mockPrefix,
                driver: mockDriver
            }
        );

        beforeEach(() => {
            mockStore = {
                dispatch: spy(() => {})
            };

            persistableKeys = [ 3, 2, 1 ];

            mockDriver = {
                getItem: spy((key) => `"${key}"`)
            };

            mockPrefix = 'pref1.';
        });

        it('should call driver.getItem()', async () => {
            await exec();

            mockDriver.getItem.firstCall.should.be.calledWith(
                `${mockPrefix}${persistableKeys[0]}`
            );

            mockDriver.getItem.secondCall.should.be.calledWith(
                `${mockPrefix}${persistableKeys[1]}`
            );

            mockDriver.getItem.thirdCall.should.be.calledWith(
                `${mockPrefix}${persistableKeys[2]}`
            );
        });

        it('calls console.warn()', async () => {
            const error = 'UH OH! OH NO!';

            const consoleWarn = global.console.warn;
            global.console.warn = spy(() => {});

            mockDriver.getItem = () => Promise.reject(error);

            await exec();

            global.console.warn.should.be.calledWith(
                'redux-remember: rehydrate error',
                error
            );

            global.console.warn = consoleWarn;
        });

        it('does not parse null results of driver.getItem()', async () => {
            mockDriver.getItem = () => null;

            await exec();

            mockStore.dispatch.should.be.calledWith({
                type: REMEMBER_REHYDRATED,
                payload: {}
            });
        });

        it('calls store.dispatch()', async () => {
            await exec();

            mockStore.dispatch.should.be.calledWith({
                type: REMEMBER_REHYDRATED,
                payload: {
                    3: "pref1.3",
                    2: "pref1.2",
                    1: "pref1.1"
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
        let loadedKey;
        let preloaded;

        const exec = (state, action) => rehydrate.rehydrateReducer(
            mockReducer, loadedKey
        )(preloaded)(state, action);

        beforeEach(() => {
            mockReducer = spy((state, action) => state);

            loadedKey = 'rehydrated';

            preloaded = {
                wow: 'so cool!',
                yay: 'it works'
            };
        });

        it('works with no preloaded state', () => {
            preloaded = undefined;
            exec().should.eql({});
        });

        it('returns preloaded state', () => {
            exec().should.eql(
                preloaded
            );
        });

        it('returns rehydrated state', () => {
            const payload = {
                wow: 'beep',
                nah: 'lol'
            }

            exec(
                null,
                {
                    type: REMEMBER_REHYDRATED,
                    payload
                }
            )
            .should.eql({
                wow: 'beep',
                yay: 'it works',
                nah: 'lol',
                [loadedKey]: true
            });
        });

        it('does not fail if there is missing payload', () => {
            exec(
                null,
                { type: REMEMBER_REHYDRATED }
            )
            .should.eql({
                ...preloaded,
                [loadedKey]: true
            });
        });
    });
});
