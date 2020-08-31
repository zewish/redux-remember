import { Reducer, StoreEnhancer } from 'redux';

declare namespace rememberEnhancer {
    export interface SerializeFunction {
        (data: any): any
    }

    export interface UnserializeFunction {
        (data: any): any
    }

    export interface Driver {
        getItem(key: String): any,
        setItem(key: String, value: any): any
    }

    export interface Options {
        prefix?: string,
        serialize?: SerializeFunction,
        unserialize?: UnserializeFunction,
        persistThrottle?: number,
        persistWholeStore?: boolean
    }
}

export function rememberReducer(reducers: Function): Reducer;
export function rememberEnhancer(
    driver: rememberEnhancer.Driver,
    rememberedKeys: string[],
    options?: rememberEnhancer.Options
): StoreEnhancer;

export const REMEMBER_REHYDRATED: string;
export const REMEMBER_PERSISTED: string;

