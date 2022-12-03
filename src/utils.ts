type TimeoutHandle = ReturnType<typeof setTimeout>;

const getObjectType = (o: object): string => Object.prototype.toString.call(o).match(
  /\[object (.*)\]/
)?.[1] || '';

const isTypedArray = (o: object): boolean => (
  /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/
    .test(Object.prototype.toString.call(o))
);

export const pick = <T extends Record<string, any>, K extends keyof T>(
  src: T | null | undefined,
  keys: K[]
): Partial<T> => {
  if (src === null || typeof src !== 'object') {
    return {};
  }

  let index = -1;
  const dest = {} as T;

  while (++index < keys.length) {
    const key = keys[index];
    dest[key] = src[key];
  }

  return dest;
};

export const throttle = <T extends (...args: any) => void>(
  callback: T,
  msecs: number
): T => {
  let nextCallNow = 0;
  let nextCallTimeout: TimeoutHandle | null;

  return ((...args: any): void => {
    const now = +new Date();
    const timeLeft = (nextCallNow || now) - now;

    if (timeLeft <= 0 && !nextCallTimeout) {
      nextCallNow = now + msecs;
      callback(...args);
      return;
    }

    if (nextCallTimeout) {
      clearTimeout(nextCallTimeout);
      nextCallTimeout = null;
    }

    nextCallTimeout = setTimeout(() => {
      nextCallNow = +new Date() + msecs;
      callback(...args);

      clearTimeout(nextCallTimeout as TimeoutHandle);
      nextCallTimeout = null;
    }, timeLeft);
  }) as T;
};

export const isEqual = (a: any, b: any): boolean => {
  if (a === b) {
    return true;
  }

  if (typeof a !== 'object' || typeof b !== 'object'
    || a === null || a === undefined || b === null || b === undefined
  ) {
    return a !== a && b !== b;
  }

  if (a.constructor !== b.constructor) {
    return false;
  }

  if (a.constructor === RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  if (Array.isArray(a)) {
    if (a.length != b.length) {
      return false;
    }

    for (let i = a.length; i-- !== 0;) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  if (isTypedArray(a) && isTypedArray(b)) {
    if (a.byteLength !== b.byteLength) {
      return false;
    }

    for (let i = a.byteLength; i-- !== 0;) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  const aType = getObjectType(a);
  const bType = getObjectType(b);

  if (aType === 'DataView' && bType === 'DataView') {
    if (a.byteLength != b.byteLength || a.byteOffset != b.byteOffset) {
      return false;
    }

    return isEqual(a.buffer, b.buffer);
  }

  if (aType === 'ArrayBuffer' && bType === 'ArrayBuffer') {
    if (a.byteLength != b.byteLength) {
      return false;
    }

    return isEqual(new Uint8Array(a), new Uint8Array(b));
  }

  if (aType === 'Map' && bType === 'Map') {
    if (a.size !== b.size) {
      return false;
    }

    for (let [key] of a.entries()) {
      if (!b.has(key)) {
        return false;
      }
    }

    for (let [key, value] of a.entries()) {
      if (!isEqual(value, b.get(key))) {
        return false;
      }
    }

    return true;
  }

  if (aType === 'Set' && bType === 'Set') {
    if (a.size !== b.size) {
      return false;
    }

    for (let [key] of a.entries()) {
      if (!b.has(key)) {
        return false;
      }
    }

    return true;
  }

  if (aType === 'Date' && bType === 'Date') {
    return +a === +b;
  }

  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) {
    return false;
  }

  for (let i = aKeys.length; i-- !== 0;) {
    if (!Object.prototype.hasOwnProperty.call(b, aKeys[i])) {
      return false;
    }
  }

  for (let i = aKeys.length; i-- !== 0;) {
    const key = aKeys[i];

    if (!isEqual(a[key], b[key])) {
      return false;
    }
  }

  if (aType !== 'Object' && bType !== 'Object') {
    return a === b;
  }

  return true;
};
