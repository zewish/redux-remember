import * as actionTypes from '../action-types';

describe('action-types.ts', () => {
  it('exports proper items', () => {
    expect(actionTypes).toEqual({
      REMEMBER_REHYDRATED: '@@REMEMBER_REHYDRATED',
      REMEMBER_PERSISTED: '@@REMEMBER_PERSISTED'
    });
  });
});
