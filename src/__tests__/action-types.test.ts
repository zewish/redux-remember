describe('action-types.ts', () => {
  const actionTypes = require('../action-types');

  it('exports proper items', () => {
    expect(actionTypes).toEqual({
      REMEMBER_REHYDRATED: '@@REMEMBER_REHYDRATED',
      REMEMBER_PERSISTED: '@@REMEMBER_PERSISTED'
    });
  });
});
