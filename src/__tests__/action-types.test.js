describe('action-types.js', () => {
    const actionTypes = require('../action-types');

    it('exports proper items', () => {
        expect(actionTypes).to.eql({
            REMEMBER_REHYDRATED: '@@REMEMBER_REHYDRATED',
            REMEMBER_PERSISTED: '@@REMEMBER_PERSISTED'
        });
    });
});
