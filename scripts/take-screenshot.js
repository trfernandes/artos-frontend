#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function printUsage() {
  console.error(
    [
      'Uso:',
      '  node scripts/take-screenshot.js <output.png> [--serial <adb-serial>]',
      '',
      'Exemplo:',
      '  node scripts/take-screenshot.js .artifacts/refinement/current.png',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const output = args[0];
  let serial = null;

  for (let i = 1; i < args.length; i += 1) {
    if (args[i] === '--serial') {
      serial = args[i + 1] ?? null;
      i += 1;
    }
  }

  return { output, serial };
}

function getDevices() {
  const result = spawnSync('adb', ['devices'], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || 'Falha ao executar adb devices.');
  }

  return result.stdout
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 2 && parts[1] === 'device')
    .map((parts) => parts[0]);
}

function resolveSerial(serial) {
  if (serial) return serial;
  const devices = getDevices();

  if (devices.length === 0) {
    throw new Error('Nenhum device Android conectado via adb.');
  }

  if (devices.length > 1) {
    throw new Error(
      `Multiplos devices detectados (${devices.join(', ')}). Use --serial para escolher um.`,
    );
  }

  return devices[0];
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

function main() {
  const { output, serial } = parseArgs(process.argv);
  const resolvedSerial = resolveSerial(serial);
  ensureParentDir(output);

  const result = spawnSync(
    'adb',
    ['-s', resolvedSerial, 'exec-out', 'screencap', '-p'],
    { encoding: null, maxBuffer: 32 * 1024 * 1024 },
  );

  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.toString('utf8').trim() : '';
    throw new Error(stderr || 'Falha ao capturar screenshot via adb.');
  }

  fs.writeFileSync(path.resolve(output), result.stdout);
  console.log(
    JSON.stringify({
      ok: true,
      serial: resolvedSerial,
      output: path.resolve(output),
    }),
  );
}

try {
  main();
} catch (error) {
  console.error(
    JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
}
