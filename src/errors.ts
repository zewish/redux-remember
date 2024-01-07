class CustomError extends Error {
  originalError?: Error;

  constructor(originalError: unknown) {
    const isOrigErrorValid = originalError instanceof Error;
    const prevStackLines = isOrigErrorValid
      ? originalError.stack?.split('\n')
      : [];

    super(isOrigErrorValid
      ? `${originalError.name}: ${originalError.message}`
      : '');

    this.name = this.constructor.name;
    if (isOrigErrorValid) {
      this.originalError = originalError;
    }

    if (prevStackLines?.length && this.stack) {
      this.stack = this.stack
        .split('\n')
        .slice(0, 2)
        .concat(
          prevStackLines.slice(1, prevStackLines.length)
        )
        .join('\n');
    }
  }
}

export class PersistError extends CustomError {}
export class RehydrateError extends CustomError {}
