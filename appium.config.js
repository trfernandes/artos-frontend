// Appium configuration for automated screenshot capture
// Used by the /refinamento-autonomo skill

module.exports = {
  port: 4723,
  host: 'localhost',

  // For iOS simulator
  ios: {
    platformName: 'iOS',
    automationName: 'XCUITest',
    deviceName: 'iPhone 14',
    platformVersion: 'latest',
    app: 'com.diakonia.app', // Bundle ID for your app
  },

  // For Android emulator
  android: {
    platformName: 'Android',
    automationName: 'UiAutomator2',
    deviceName: 'emulator-5554',
    app: 'com.diakonia.app', // Package ID for your app
  },
};
