#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function printUsage() {
  console.error(
    [
      'Usage:',
      '  node scripts/take-scroll-screenshots.js <output-dir> [--serial <adb-serial>] [--max 5] [--delay 700] [--swipe-distance 900]',
      '',
      'Example:',
      '  node scripts/take-scroll-screenshots.js .artifacts/visual-improvement/scroll --max 5',
    ].join('\n'),
  );
}

function parseNumber(value, fallback, name) {
  if (value == null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
  return parsed;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const options = {
    outputDir: args[0],
    serial: null,
    max: 5,
    delay: 700,
    swipeDistance: 900,
  };

  for (let i = 1; i < args.length; i += 1) {
    const key = args[i];
    const value = args[i + 1];

    if (key === '--serial') {
      options.serial = value ?? null;
      i += 1;
    } else if (key === '--max') {
      options.max = parseNumber(value, options.max, '--max');
      i += 1;
    } else if (key === '--delay') {
      options.delay = parseNumber(value, options.delay, '--delay');
      i += 1;
    } else if (key === '--swipe-distance') {
      options.swipeDistance = parseNumber(value, options.swipeDistance, '--swipe-distance');
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  options.max = Math.floor(options.max);
  return options;
}

function runAdb(args, options = {}) {
  const result = spawnSync('adb', args, {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: options.maxBuffer ?? 32 * 1024 * 1024,
  });

  if (result.status !== 0) {
    const stderr =
      typeof result.stderr === 'string'
        ? result.stderr.trim()
        : result.stderr?.toString('utf8').trim();
    throw new Error(stderr || `adb ${args.join(' ')} failed.`);
  }

  return result.stdout;
}

function getDevices() {
  const stdout = runAdb(['devices']);
  return stdout
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 2 && parts[1] === 'device')
    .map((parts) => ({
      serial: parts[0],
      isEmulator: parts[0].startsWith('emulator-'),
    }));
}

function resolveSerial(serial) {
  if (serial) return serial;

  const devices = getDevices();
  const physical = devices.filter((device) => !device.isEmulator);
  const emulators = devices.filter((device) => device.isEmulator);

  if (physical.length === 1) return physical[0].serial;
  if (physical.length > 1) {
    throw new Error(
      `Multiple physical devices detected (${physical
        .map((device) => device.serial)
        .join(', ')}). Use --serial to choose one.`,
    );
  }

  if (emulators.length === 1) return emulators[0].serial;
  if (emulators.length > 1) {
    throw new Error(
      `Multiple emulators detected (${emulators
        .map((device) => device.serial)
        .join(', ')}). Use --serial to choose one.`,
    );
  }

  throw new Error('No online Android device or emulator found via adb.');
}

function ensureDir(dirPath) {
  fs.mkdirSync(path.resolve(dirPath), { recursive: true });
}

function screenshot(serial, outputPath) {
  const result = spawnSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], {
    encoding: null,
    maxBuffer: 32 * 1024 * 1024,
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.toString('utf8').trim() : '';
    throw new Error(stderr || 'Failed to capture screenshot via adb.');
  }

  fs.writeFileSync(outputPath, result.stdout);
}

function getScreenSize(serial) {
  const stdout = runAdb(['-s', serial, 'shell', 'wm', 'size']);
  const match = stdout.match(/(\d+)x(\d+)/);
  if (!match) {
    return { width: 1080, height: 2400 };
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

function swipeUp(serial, size, swipeDistance) {
  const x = Math.floor(size.width / 2);
  const startY = Math.floor(size.height * 0.78);
  const endY = Math.max(80, startY - swipeDistance);

  runAdb(['-s', serial, 'shell', 'input', 'swipe', String(x), String(startY), String(x), String(endY), '320']);
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function main() {
  const options = parseArgs(process.argv);
  const serial = resolveSerial(options.serial);
  const outputDir = path.resolve(options.outputDir);
  const screenSize = getScreenSize(serial);
  const captures = [];

  ensureDir(outputDir);

  for (let index = 1; index <= options.max; index += 1) {
    const filename = `viewport-${String(index).padStart(3, '0')}.png`;
    const outputPath = path.join(outputDir, filename);
    screenshot(serial, outputPath);
    captures.push(outputPath);

    if (index < options.max) {
      swipeUp(serial, screenSize, options.swipeDistance);
      sleep(options.delay);
    }
  }

  const metadataPath = path.join(outputDir, 'metadata.json');
  fs.writeFileSync(
    metadataPath,
    JSON.stringify(
      {
        ok: true,
        serial,
        outputDir,
        max: options.max,
        delay: options.delay,
        swipeDistance: options.swipeDistance,
        screenSize,
        captures,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(
    JSON.stringify({
      ok: true,
      serial,
      outputDir,
      captures,
      metadata: metadataPath,
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
