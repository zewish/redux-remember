import { Action, PreloadedState, Reducer, Store, StoreCreator, StoreEnhancer } from 'redux';
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
declare const rememberEnhancer: <S, A extends Action<any>, Ext>(driver: Driver, rememberedKeys: string[], { prefix, serialize, unserialize, persistThrottle, persistWholeStore }?: Partial<Options>) => (createStore: StoreCreator) => (rootReducer: Reducer<S, A>, initialState?: PreloadedState<S> | undefined, enhancer?: StoreEnhancer<Ext, {}> | undefined) => Store<S, A> & Ext;
export { rememberReducer, rememberEnhancer, REMEMBER_REHYDRATED, REMEMBER_PERSISTED };
