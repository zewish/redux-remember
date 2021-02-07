export declare type SerializeFunction = (data: any) => any;
export declare type UnserializeFunction = (data: any) => any;
export declare type Driver = {
    getItem: (key: String) => any;
    setItem: (key: String, value: any) => any;
};
export declare type Options = {
    prefix?: string;
    serialize?: SerializeFunction;
    unserialize?: UnserializeFunction;
    persistThrottle?: number;
    persistWholeStore?: boolean;
};
export declare type ExtendedOptions = Options & {
    driver: Driver;
};
