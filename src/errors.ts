class CustomError extends Error {
  constructor(message: string, previousError: unknown) {
    const prevStack = (previousError as Error)?.stack || '';

    super(message);
    this.name = this.constructor.name;

    if (prevStack && this.stack) {
      this.stack = this.stack
        .split('\n')
        .slice(0, 2)
        .concat(prevStack)
        .join('\n');
    }
  }
}

export class PersistError extends CustomError {
  constructor(previousError: unknown) {
    super('redux-remember: persist error', previousError);
  }
}

export class RehydrateError extends CustomError {
  constructor(previousError: unknown) {
    super('redux-remember: rehydrate error', previousError);
  }
}
