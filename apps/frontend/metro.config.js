// Learn more https://docs.expo.dev/guides/customizing-metro/
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withTamagui } = require("@tamagui/metro-plugin");

/** @type {import('expo/metro-config').MetroConfig} */
const projectRoot = __dirname;

// Base Expo config (with CSS enabled for web)
const config = getDefaultConfig(projectRoot, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Constrain Metro to only use the app-local node_modules when building from a subdirectory (e.g. Vercel Root Dir = apps/frontend).
// This avoids Metro trying to stat an ancestor node_modules like /vercel/path0/node_modules which doesn't exist in that environment.
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];
config.resolver = {
  ...(config.resolver || {}),
  nodeModulesPaths: [path.resolve(projectRoot, "node_modules")],
  // PNPM/link-friendly
  unstable_enableSymlinks: true,
};

// Add Tamagui optimizing compiler + CSS extraction for better web support
module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./tamagui-web.css",
});
