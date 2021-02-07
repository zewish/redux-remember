import { Store } from 'redux';
import { ExtendedOptions } from './types';
declare type RehydrateOptions = Pick<ExtendedOptions, 'prefix' | 'driver' | 'persistWholeStore' | 'unserialize'>;
declare type LoadAllOptions = Pick<ExtendedOptions, 'driver' | 'prefix' | 'unserialize'> & {
    rememberedKeys: string[];
};
export declare const loadAll: ({ rememberedKeys, driver, prefix, unserialize }: LoadAllOptions) => Promise<Pick<any, string>>;
export declare const loadAllKeyed: ({ rememberedKeys, driver, prefix, unserialize }: LoadAllOptions) => Promise<{}>;
export declare const rehydrate: (store: Store, rememberedKeys: string[], { prefix, driver, persistWholeStore, unserialize }: RehydrateOptions) => Promise<void>;
export {};
