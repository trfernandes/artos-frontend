#!/usr/bin/env node

/**
 * Screenshot utility for Android devices (physical or emulator)
 * Used by the /refinamento-autonomo skill to capture app screenshots
 *
 * Uses ADB (Android Debug Bridge) - much faster than Appium
 *
 * Usage:
 *   node scripts/take-screenshot.js [output-path]
 *
 * Examples:
 *   node scripts/take-screenshot.js screenshot.png
 *   node scripts/take-screenshot.js ./screenshots/iteration-1.png
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputPath = process.argv[2] || `screenshot-${Date.now()}.png`;

function takeScreenshot() {
  try {
    console.log(`📸 Taking screenshot via ADB...`);

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Check if ADB is available
    try {
      execSync('adb devices', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('ADB not found. Make sure Android SDK is installed and in PATH.');
    }

    // Take screenshot on device
    console.log('  → Taking screenshot on device...');
    execSync('adb shell screencap -p /sdcard/screenshot.png', { stdio: 'pipe' });

    // Pull screenshot from device to computer
    console.log('  → Downloading from device...');
    execSync(`adb pull /sdcard/screenshot.png "${outputPath}"`, { stdio: 'pipe' });

    // Clean up device storage
    execSync('adb shell rm /sdcard/screenshot.png', { stdio: 'pipe' });

    console.log(`✅ Screenshot saved to: ${outputPath}`);
    console.log(`   Size: ${fs.statSync(outputPath).size} bytes`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error taking screenshot: ${error.message}`);
    console.error('\nMake sure:');
    console.error('  1. Device is connected: adb devices');
    console.error('  2. USB debugging is enabled');
    console.error('  3. Your app is running via Expo');
    console.error('\nTroubleshooting:');
    console.error('  - Physical device: Connect via USB cable');
    console.error('  - Emulator: emulator -avd your_emulator_name');
    process.exit(1);
  }
}

takeScreenshot();
