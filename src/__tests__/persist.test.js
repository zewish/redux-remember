describe('persist.js', () => {
    let mockDriver;
    let mockIsEqual;

    let persist;

    beforeEach(() => {
        mockDriver = {
            setItem: spy(() => {})
        };

        mockIsEqual = spy((a, b) => a === b);

        jest.mock(
            'lodash.isequal',
            () => mockIsEqual
        );

        persist = require('../persist').persist;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('calls lodash.isequal()', async () => {
        await persist(
            {
                key1: 'val1',
                key2: 'val2'
            },
            {
                key1: 'val11',
                key2: 'val22'
            },
            { driver: mockDriver }
        );

        mockIsEqual.firstCall.should.be.calledWith(
            'val1', 'val11'
        );

        mockIsEqual.secondCall.should.be.calledWith(
            'val2', 'val22'
        );
    });

    it('calls driver.setItem()', async () => {
        await persist(
            {
                key1: 'yay',
                key2: 'i_am_not_changed',
                key3: 'wow'
            },
            {
                key1: 'cool',
                key2: 'i_am_not_changed',
                key3: 'super'
            },
            {
                prefix: 'yada.',
                driver: mockDriver
            }
        );

        mockDriver.setItem.firstCall.should.be.calledWith(
            'yada.key1', '"yay"'
        );

        mockDriver.setItem.secondCall.should.be.calledWith(
            'yada.key3', '"wow"'
        );
    });

    it('calls console.warn()', async () => {
        const error = 'DUMMY ERROR!!!';

        const consoleWarn = global.console.warn;
        global.console.warn = spy(() => {});

        await persist(
            { key1: 'yay' },
            { key1: 'cool' },
            {
                driver: {
                    setItem: () => Promise.reject(error)
                }
            }
        );

        global.console.warn.should.be.calledWith(
            'redux-remember: persist error',
            error
        );

        global.console.warn = consoleWarn;
    });

    it('still works if no state were provided', async () => {
        await persist(
            undefined,
            undefined,
            {
                driver: mockDriver
            }
        );
    });
});
