import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const runBin = (cwd: string): Promise<{
  code: number | null;
  stderr: string;
}> => new Promise((resolve) => {
  const child = spawn(
    'node',
    [`${import.meta.dirname}/../bin/remigrate.cjs`],
    {
      cwd,
      stdio: 'pipe'
    }
  );

  let stderr = '';
  child.stderr.on('data', (data) => {
    stderr += data;
  });

  child.on('close', (code) => {
    resolve({ code, stderr });
  });
});

describe('bin/remigrate.cjs', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(`${tmpdir()}/remigrate-wrapper-test-`);

    await writeFile(
      `${projectDir}/package.json`,
      JSON.stringify({ name: 'test' })
    );
  });

  afterEach(async () => {
    await rm(projectDir, {
      recursive: true,
      force: true
    });
  });

  it('exits with error when redux-remigrate is not installed', async () => {
    const { code, stderr } = await runBin(projectDir);

    expect(code).toBe(1);
    expect(stderr).toContain('Missing dependency');
    expect(stderr).toContain('Redux Remigrate is required');
    expect(stderr).toContain('npm install redux-remigrate');
  });

  it('delegates to redux-remigrate CLI when installed', async () => {
    const cliMessage = 'REDUX-REMIGRATE-CLI';

    await mkdir(`${projectDir}/node_modules/redux-remigrate/bin`, { recursive: true });
    await writeFile(`${projectDir}/node_modules/redux-remigrate/index.js`, '');
    await writeFile(
      `${projectDir}/node_modules/redux-remigrate/bin/remigrate.cjs`,
      `console.error("${cliMessage}");`
    );

    await writeFile(
      `${projectDir}/node_modules/redux-remigrate/package.json`,
      JSON.stringify({
        name: 'redux-remigrate',
        main: 'index.js',
        exports: {
          '.': './index.js',
          './bin/remigrate.cjs': './bin/remigrate.cjs'
        }
      })
    );

    const { code, stderr } = await runBin(projectDir);
    expect(code).toBe(0);
    expect(stderr).not.toContain('Redux Remigrate is required');
    expect(stderr).toContain(cliMessage);
  });
});
