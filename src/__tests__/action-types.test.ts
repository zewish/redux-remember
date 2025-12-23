import { describe, it, expect } from 'vitest';
import * as actionTypes from '../action-types';

describe('action-types.ts', () => {
  it('exports proper items', () => {
    expect(actionTypes).toEqual(expect.objectContaining({
      REMEMBER_REHYDRATED: '@@REMEMBER_REHYDRATED',
      REMEMBER_PERSISTED: '@@REMEMBER_PERSISTED'
    }));
  });
});
