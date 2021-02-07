import { REMEMBER_REHYDRATED, REMEMBER_PERSISTED } from './action-types';
import { Driver, Options } from './types';
import { Reducer, StoreEnhancer } from 'redux';
declare const rememberReducer: (reducers: Reducer) => Reducer;
declare const rememberEnhancer: (driver: Driver, rememberedKeys: string[], { prefix, serialize, unserialize, persistThrottle, persistWholeStore }?: Options) => StoreEnhancer;
export { rememberReducer, rememberEnhancer, REMEMBER_REHYDRATED, REMEMBER_PERSISTED };
