type TimeoutHandle = ReturnType<typeof setTimeout>;

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

    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
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

export const debounce = <T extends (...args: any) => void>(
  callback: T,
  msecs: number
): T => {
  let nextCallTimeout: TimeoutHandle | null;

  return ((...args: any): void => {
    clearTimeout(nextCallTimeout as TimeoutHandle);

    nextCallTimeout = setTimeout(() => {
      callback(...args);
      nextCallTimeout = null;
    }, msecs);
  }) as T;
};
