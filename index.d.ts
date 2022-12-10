import { Action, AnyAction, Reducer, ReducersMapObject } from 'redux';
declare const REMEMBER_REHYDRATED = "@@REMEMBER_REHYDRATED";
declare const REMEMBER_PERSISTED = "@@REMEMBER_PERSISTED";
type SerializeFunction = (data: any, key: string) => any;
type UnserializeFunction = (data: any, key: string) => any;
type Driver = {
    getItem: (key: string) => any;
    setItem: (key: string, value: any) => any;
};
type Options = {
    prefix: string;
    serialize: SerializeFunction;
    unserialize: UnserializeFunction;
    persistThrottle: number;
    persistWholeStore: boolean;
};
declare const rememberReducer: <S = any, A extends Action<any> = AnyAction>(reducer: Reducer<S, A> | ReducersMapObject<S, A>) => Reducer<S, A>;
declare const rememberEnhancer: (driver: Driver, rememberedKeys: string[], { prefix, serialize, unserialize, persistThrottle, persistWholeStore }?: Partial<Options>) => any;
export { rememberReducer, rememberEnhancer, REMEMBER_REHYDRATED, REMEMBER_PERSISTED };
