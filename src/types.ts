export type SerializeFunction = (data: any) => any;
export type UnserializeFunction = (data: any) => any;

export type Driver = {
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => any;
};

export type Options = {
  prefix: string,
  serialize: SerializeFunction,
  unserialize: UnserializeFunction,
  persistThrottle: number,
  persistWholeStore: boolean
};

export type ExtendedOptions = Options & {
  driver: Driver
};
