import { parseArgs } from 'node:util';
import path from 'node:path';
import process from 'node:process';
import colors from 'picocolors';
import { findConfigFile, loadConfigOptions } from './config/index.ts';
import { RemigrateCliError, log } from './utils/common.ts';
import { init } from './init.ts';
import { cleanup } from './cleanup.ts';
import { create } from './create.ts';
import { validate } from './validate.ts';

export const usage = `
${colors.bold('Usage:')} remigrate <command> [options]

${colors.bold('Commands:')}
  init [suffix]        Initialize migrations directory
  create [suffix]      Create a new migration file if store type changed
  cleanup              Remove unreferenced version type files
  validate             Validate migrations for TypeScript errors

${colors.bold('Options:')}
  -c, --config <file>  Override config file path
`.trim();

export const commands = {
  init,
  create,
  cleanup,
  validate,
};

export const runCli = async () => {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      config: {
        type: 'string',
        short: 'c',
      },
      help: {
        type: 'boolean',
        short: 'h',
      },
    },
    allowPositionals: true,
  });

  if (values.help || positionals.length === 0) {
    log.info(usage);
    process.exit(0);
  }

  const [cmd, suffix = ''] = positionals as [keyof typeof commands, string];

  try {
    const options = values.config
      ? await loadConfigOptions(path.resolve(
        process.cwd(),
        values.config
      ))
      : await loadConfigOptions(await findConfigFile(
        process.cwd()
      ));

    switch (cmd) {
      case 'init':
      case 'create':
        await commands[cmd]({
          ...options,
          typeFileSuffix: suffix ? `-${suffix}` : ''
        });
        break;

      case 'cleanup':
      case 'validate':
        if (suffix) {
          log.error(`Command "${cmd}" does not accept arguments\n`);
          log.info(usage);
          process.exit(5);
        }
        await commands[cmd](options);
        break;

      default:
        log.error(`Unknown command: ${cmd as string}\n`);
        log.info(usage);
        process.exit(4);
    }
  } catch (err) {
    if (err instanceof RemigrateCliError) {
      log.error(err.message);
    } else {
      log.error(`An unexpected error occurred\n${err as Error}`);
    }

    process.exit(3);
  }
};
