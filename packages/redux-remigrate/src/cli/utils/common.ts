import colors from 'picocolors';

export class RemigrateCliError extends Error {
  override name = 'RemigrateCliError';
}

export const log = {
  info: (message: string) => console.info(message),
  success: (message: string) => console.info(`${colors.green('✓')} ${message}`),
  warn: (message: string) => console.warn(`${colors.yellow('⚠')} ${message}`),
  error: (message: string) => console.error(`${colors.red('✗')} ${message}`),
  skip: (message: string) => console.info(`${colors.dim('-')} ${message}`),
};
