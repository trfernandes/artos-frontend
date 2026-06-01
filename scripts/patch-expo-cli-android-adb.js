const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'platforms',
  'android',
  'adb.js',
);

const patchMarker = 'return device.pid; // patched by artos_frontend';

if (!fs.existsSync(targetFile)) {
  console.warn(`[patch-expo-cli-android-adb] Arquivo nao encontrado: ${targetFile}`);
  process.exit(0);
}

const source = fs.readFileSync(targetFile, 'utf8');

if (source.includes(patchMarker)) {
  console.log('[patch-expo-cli-android-adb] Patch ja aplicado.');
  process.exit(0);
}

const original = `async function getAdbNameForDeviceIdAsync(device) {
    const results = await getServer().runAsync(adbArgs(device.pid, 'emu', 'avd', 'name'));
    if (results.match(/could not connect to TCP port .*: Connection refused/)) {
        // Can also occur when the emulator does not exist.
        throw new _errors.CommandError('EMULATOR_NOT_FOUND', results);
    }
    return sanitizeAdbDeviceName(results) ?? null;
}`;

const replacement = `async function getAdbNameForDeviceIdAsync(device) {
    try {
        const results = await getServer().runAsync(adbArgs(device.pid, 'emu', 'avd', 'name'));
        if (results.match(/could not connect to TCP port .*: Connection refused/)) {
            return device.pid; // patched by artos_frontend
        }
        return sanitizeAdbDeviceName(results) ?? null;
    } catch (error) {
        const message = error == null ? void 0 : error.message;
        if (message && message.match(/could not connect to TCP port .*:.*(Connection refused|recusou ativamente)/i)) {
            return device.pid; // patched by artos_frontend
        }
        throw error;
    }
}`;

if (!source.includes(original)) {
  console.error('[patch-expo-cli-android-adb] Trecho esperado nao encontrado. Patch nao aplicado.');
  process.exit(1);
}

fs.writeFileSync(targetFile, source.replace(original, replacement), 'utf8');
console.log('[patch-expo-cli-android-adb] Patch aplicado com sucesso.');
