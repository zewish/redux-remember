import { Reducer, StoreEnhancer } from 'redux';
declare const REMEMBER_REHYDRATED = "@@REMEMBER_REHYDRATED";
declare const REMEMBER_PERSISTED = "@@REMEMBER_PERSISTED";
type SerializeFunction = (data: any) => any;
type UnserializeFunction = (data: any) => any;
type Driver = {
    getItem: (key: String) => any;
    setItem: (key: String, value: any) => any;
};
type Options = {
    prefix: string;
    serialize: SerializeFunction;
    unserialize: UnserializeFunction;
    persistThrottle: number;
    persistWholeStore: boolean;
};
declare const rememberReducer: (reducers: Reducer) => Reducer;
declare const rememberEnhancer: (driver: Driver, rememberedKeys: string[], { prefix, serialize, unserialize, persistThrottle, persistWholeStore }?: Partial<Options>) => StoreEnhancer;
export { rememberReducer, rememberEnhancer, REMEMBER_REHYDRATED, REMEMBER_PERSISTED };
