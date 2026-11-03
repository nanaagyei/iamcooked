import { describe, it, expect } from "vitest";
import { parseLockfile } from "../index";

const npmLock = JSON.stringify({
  name: "test-app",
  lockfileVersion: 3,
  packages: {
    "": { name: "test-app", version: "1.0.0" },
    "node_modules/lodash": {
      name: "lodash",
      version: "4.17.21",
    },
    "node_modules/express": {
      name: "express",
      version: "4.18.2",
    },
  },
});

const yarnLock = `
lodash@^4.17.21:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
`;

const pnpmLock = `
lockfileVersion: 5.4

dependencies:
  lodash:
    specifier: ^4.17.21
    version: 4.17.21

packages:
  /lodash@4.17.21:
    resolution:
      integrity: sha512-test==
  /@scope/pkg@1.0.0:
    resolution:
      integrity: sha512-scoped==
`;

describe("lockfile parsers", () => {
  it("parses package-lock.json", () => {
    const result = parseLockfile("package-lock.json", npmLock);
    expect("dependencies" in result).toBe(true);
    if ("dependencies" in result) {
      expect(result.dependencies.length).toBeGreaterThan(0);
      expect(result.dependencies.some((d) => d.name === "lodash")).toBe(true);
    }
  });

  it("parses yarn.lock", () => {
    const result = parseLockfile("yarn.lock", yarnLock);
    expect("dependencies" in result).toBe(true);
    if ("dependencies" in result) {
      expect(result.dependencies.some((d) => d.name === "lodash")).toBe(true);
    }
  });

  it("parses pnpm-lock.yaml", () => {
    const result = parseLockfile("pnpm-lock.yaml", pnpmLock);
    expect("dependencies" in result).toBe(true);
    if ("dependencies" in result) {
      expect(result.dependencies.some((d) => d.name === "lodash")).toBe(true);
      expect(result.dependencies.some((d) => d.name === "@scope/pkg")).toBe(true);
    }
  });

  it("parses scoped package-lock entries", () => {
    const scopedLock = JSON.stringify({
      name: "test-app",
      lockfileVersion: 3,
      packages: {
        "": { name: "test-app", version: "1.0.0" },
        "node_modules/@scope/pkg": {
          name: "@scope/pkg",
          version: "1.0.0",
        },
      },
    });

    const result = parseLockfile("package-lock.json", scopedLock);
    expect("dependencies" in result).toBe(true);
    if ("dependencies" in result) {
      expect(result.dependencies.some((d) => d.name === "@scope/pkg")).toBe(true);
    }
  });

  it("rejects unsupported files", () => {
    const result = parseLockfile("build.gradle", "foo");
    expect("message" in result).toBe(true);
  });

  it("rejects malformed JSON lockfiles", () => {
    const result = parseLockfile("package-lock.json", "{not-json");
    expect("message" in result).toBe(true);
    if ("message" in result) {
      expect(result.type).toBe("PARSE_ERROR");
    }
  });
});
