#!/usr/bin/env node

/**
 * Screenshot utility for Appium
 * Used by the /refinamento-autonomo skill to capture app screenshots
 *
 * Usage:
 *   node scripts/take-screenshot.js [output-path] [platform]
 *
 * Examples:
 *   node scripts/take-screenshot.js screenshot.png ios
 *   node scripts/take-screenshot.js ./screenshots/iteration-1.png android
 */

const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

const platform = process.argv[3] || 'ios';
const outputPath = process.argv[2] || `screenshot-${Date.now()}.png`;

const APPIUM_PORT = 4723;
const APPIUM_HOST = 'localhost';

// Platform-specific capabilities
const capabilities = {
  ios: {
    platformName: 'iOS',
    automationName: 'XCUITest',
    deviceName: 'iPhone 14',
    platformVersion: 'latest',
    app: 'com.diakonia.app',
  },
  android: {
    platformName: 'Android',
    automationName: 'UiAutomator2',
    deviceName: 'emulator-5554',
    app: 'com.diakonia.app',
  },
};

async function takeScreenshot() {
  let driver;
  try {
    console.log(`📸 Taking screenshot on ${platform}...`);

    // Connect to Appium
    driver = await remote({
      host: APPIUM_HOST,
      port: APPIUM_PORT,
      capabilities: capabilities[platform],
    });

    // Take screenshot
    const screenshot = await driver.takeScreenshot();

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write screenshot to file
    fs.writeFileSync(outputPath, screenshot, 'base64');

    console.log(`✅ Screenshot saved to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error taking screenshot: ${error.message}`);
    console.error('Make sure:');
    console.error('  1. Appium is running: appium');
    console.error('  2. iOS Simulator or Android Emulator is running');
    console.error('  3. Your app is built and running via Expo');
    process.exit(1);
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
}

takeScreenshot();
