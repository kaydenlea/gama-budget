function createWorkspaceModuleNameMapper(rootDirPrefix) {
  return {
    "^@gama/core-domain$": `${rootDirPrefix}/packages/core-domain/src/index.ts`,
    "^@gama/schemas$": `${rootDirPrefix}/packages/schemas/src/index.ts`,
    "^@gama/api-client$": `${rootDirPrefix}/packages/api-client/src/index.ts`,
    "^@gama/supabase-types$": `${rootDirPrefix}/packages/supabase-types/src/index.ts`,
    "^@gama/ui-mobile$": `${rootDirPrefix}/packages/ui-mobile/src/index.tsx`,
    "^@gama/ui-web$": `${rootDirPrefix}/packages/ui-web/src/index.tsx`
  };
}

function createExpoConfig({ displayName, rootDir }) {
  return {
    displayName,
    rootDir,
    preset: "jest-expo",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testEnvironment: "node",
    testMatch: [
      "<rootDir>/src/**/*.test.ts",
      "<rootDir>/src/**/*.test.tsx",
      "<rootDir>/app/**/*.test.ts",
      "<rootDir>/app/**/*.test.tsx"
    ],
    transformIgnorePatterns: [],
    moduleNameMapper: createWorkspaceModuleNameMapper("<rootDir>/../.."),
    collectCoverageFrom: ["<rootDir>/src/**/*.{ts,tsx}", "<rootDir>/app/**/*.{ts,tsx}"],
    clearMocks: true
  };
}

function createNodeConfig({ displayName, rootDir }) {
  return {
    displayName,
    rootDir,
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
      "^.+\\.(ts|tsx)$": [
        "ts-jest",
        {
          tsconfig: "<rootDir>/tsconfig.jest.json"
        }
      ]
    },
    moduleNameMapper: createWorkspaceModuleNameMapper("<rootDir>"),
    testMatch: [
      "<rootDir>/packages/**/*.test.ts",
      "<rootDir>/packages/**/*.test.tsx",
      "<rootDir>/apps/web/**/*.test.ts",
      "<rootDir>/apps/web/**/*.test.tsx"
    ],
    testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
    collectCoverageFrom: ["<rootDir>/packages/**/*.{ts,tsx}", "<rootDir>/apps/web/**/*.{ts,tsx}"],
    clearMocks: true
  };
}

module.exports = {
  createExpoConfig,
  createNodeConfig
};
