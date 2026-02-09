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
    [`${import.meta.dirname}/../../../bin/remigrate.cjs`],
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
    projectDir = await mkdtemp(`${tmpdir()}/remigrate-test-`);

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

  it('exits with error when typescript is not installed', async () => {
    const { code, stderr } = await runBin(projectDir);

    expect(code).toBe(1);
    expect(stderr).toContain('Missing dependency');
    expect(stderr).toContain('TypeScript is required');
    expect(stderr).toContain('npm install --save-dev typescript');
  });

  it('continues when typescript is installed', async () => {
    await writeFile(
      `${projectDir}/package.json`,
      JSON.stringify({ name: 'test' })
    );

    await mkdir(
      `${projectDir}/node_modules/typescript`,
      { recursive: true }
    );

    await writeFile(`${projectDir}/node_modules/typescript/index.js`, '');
    await writeFile(`${projectDir}/node_modules/typescript/package.json`, JSON.stringify({
      name: 'typescript',
      main: 'index.js'
    }));

    const { code, stderr } = await runBin(projectDir);
    expect(stderr).not.toContain('Missing dependency');
    expect(code).toBe(0);
  });
});
