const path = require("node:path");
const { createExpoConfig, createNodeConfig } = require("./packages/config-jest/base.cjs");

module.exports = {
  coverageDirectory: path.join(__dirname, "coverage"),
  coverageReporters: ["text", "lcov"],
  projects: [
    createExpoConfig({
      displayName: "mobile-unit",
      rootDir: path.join(__dirname, "apps/mobile")
    }),
    createNodeConfig({
      displayName: "workspace-node",
      rootDir: __dirname
    })
  ]
};
