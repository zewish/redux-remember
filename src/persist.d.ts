import { ExtendedOptions } from './types';
declare type SaveAllOptions = Pick<ExtendedOptions, 'prefix' | 'driver' | 'serialize'>;
export declare const saveAll: (state: any, oldState: any, { prefix, driver, serialize }: SaveAllOptions) => any;
export declare const saveAllKeyed: (state: any, oldState: any, { prefix, driver, serialize }: SaveAllOptions) => Promise<any[]>;
export declare const persist: (state: {}, oldState: {}, { prefix, driver, persistWholeStore, serialize }: Pick<ExtendedOptions, 'prefix' | 'driver' | 'persistWholeStore' | 'serialize'>) => Promise<void>;
export {};
