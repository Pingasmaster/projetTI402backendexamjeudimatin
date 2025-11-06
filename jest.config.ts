import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  setupFiles: ["<rootDir>/tests/setupEnv.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  transform: {
    "^.+\\.(t|j)s$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
          },
          target: "es2022",
        },
      },
    ],
  },
  testMatch: ["**/*.test.ts"],
};

export default config;
