import { describe, it, expect } from "vitest";
import { parseLockfile, detectEcosystem, parsePnpmPackageKey } from "../index";
import type { NormalizedDependency } from "../index";

function deps(filename: string, raw: string): NormalizedDependency[] {
  const r = parseLockfile(filename, raw);
  if ("message" in r) throw new Error(r.message);
  return r.dependencies;
}
const find = (list: NormalizedDependency[], name: string) => list.find((d) => d.name === name);

describe("pnpm key formats", () => {
  it.each([
    ["/lodash/4.17.21", "lodash", "4.17.21"],
    ["/@scope/pkg/1.0.0_react@18.2.0", "@scope/pkg", "1.0.0"],
    ["/lodash@4.17.21", "lodash", "4.17.21"],
    ["/@scope/pkg@1.0.0(react@18.2.0)", "@scope/pkg", "1.0.0"],
    ["lodash@4.17.21", "lodash", "4.17.21"],
    ["@ai-sdk/anthropic@4.0.0", "@ai-sdk/anthropic", "4.0.0"],
    ["next@15.1.0(react-dom@19.0.0(react@19.0.0))(react@19.0.0)", "next", "15.1.0"],
  ])("%s", (key, name, version) => {
    expect(parsePnpmPackageKey(key)).toEqual({ name, version });
  });

  it("parses pnpm v9 lockfiles with importers", () => {
    const raw = `lockfileVersion: '9.0'
importers:
  .:
    dependencies:
      next:
        specifier: ^15.0.0
        version: 15.1.0(react@19.0.0)
    devDependencies:
      vitest:
        specifier: ^3.0.0
        version: 3.0.0
packages:
  next@15.1.0:
    resolution: {integrity: sha512-x}
  vitest@3.0.0:
    resolution: {integrity: sha512-y}
  picocolors@1.1.0:
    resolution: {integrity: sha512-z}
  tinypool@1.1.1:
    resolution: {integrity: sha512-w}
snapshots:
  next@15.1.0(react@19.0.0):
    dependencies:
      picocolors: 1.1.0
  vitest@3.0.0:
    dependencies:
      tinypool: 1.1.1
      picocolors: 1.1.0
  picocolors@1.1.0: {}
  tinypool@1.1.1: {}
`;
    const list = deps("pnpm-lock.yaml", raw);
    expect(list).toHaveLength(4);
    expect(find(list, "next")).toMatchObject({ version: "15.1.0", direct: true });
    expect(find(list, "next")!.dev).toBeUndefined();
    expect(find(list, "vitest")).toMatchObject({ direct: true, dev: true });
    // reachable from prod (via next) → not dev, even though vitest also uses it
    expect(find(list, "picocolors")).toMatchObject({ direct: false });
    expect(find(list, "picocolors")!.dev).toBeUndefined();
    // only reachable from a devDependency → dev-only
    expect(find(list, "tinypool")).toMatchObject({ direct: false, dev: true });
  });
});

describe("yarn berry", () => {
  it("reads `version:` entries and skips workspaces", () => {
    const raw = `__metadata:
  version: 8
  cacheKey: 10

"lodash@npm:^4.17.20, lodash@npm:^4.17.21":
  version: 4.17.21
  resolution: "lodash@npm:4.17.21"

"my-app@workspace:.":
  version: 0.0.0-use.local
`;
    const list = deps("yarn.lock", raw);
    expect(list).toEqual([expect.objectContaining({ name: "lodash", version: "4.17.21" })]);
  });
});

describe("package-lock direct detection", () => {
  it("marks only top-level installs as direct and skips workspace links", () => {
    const raw = JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": { dependencies: { a: "^1.0.0" }, devDependencies: { b: "^1" } },
        "node_modules/a": { version: "1.0.0" },
        "node_modules/b": { version: "1.0.0", dev: true },
        "node_modules/c/node_modules/a": { version: "0.9.0" },
        "packages/internal": { version: "0.0.1" },
      },
    });
    const list = deps("package-lock.json", raw);
    expect(list.filter((d) => d.name === "a").map((d) => [d.version, d.direct])).toEqual([
      ["1.0.0", true],
      ["0.9.0", false],
    ]);
    expect(find(list, "b")).toMatchObject({ dev: true, direct: true });
    expect(list.some((d) => d.name === "packages/internal" || d.name === "internal")).toBe(false);
  });
});

describe("bun.lock", () => {
  it("parses JSONC with trailing commas", () => {
    const raw = `{
  "lockfileVersion": 1,
  "workspaces": {
    "": {
      "name": "app",
      "dependencies": { "react": "^19.0.0", },
      "devDependencies": { "@types/react": "^19.0.0", },
    },
  },
  "packages": {
    "react": ["react@19.0.0", "", {}, "sha512-a"],
    "@types/react": ["@types/react@19.0.1", "", { "dependencies": { "csstype": "^3" } }, "sha512-b"],
    "csstype": ["csstype@3.1.3", "", {}, "sha512-c"],
  },
}`;
    const list = deps("bun.lock", raw);
    expect(list).toHaveLength(3);
    expect(find(list, "react")).toMatchObject({ direct: true, version: "19.0.0" });
    expect(find(list, "@types/react")).toMatchObject({ direct: true, dev: true });
    expect(find(list, "csstype")).toMatchObject({ direct: false });
  });
});

describe("python", () => {
  it("parses requirements.txt including extras, hashes and pip-compile annotations", () => {
    const raw = `# generated
Django==4.2.1 \\
    --hash=sha256:abc
requests[socks]==2.31.0 ; python_version >= "3.8"
    # via -r requirements.in
urllib3==2.0.0
    # via requests
fastapi>=0.100
-r other.txt
git+https://github.com/x/y.git
`;
    const list = deps("requirements.txt", raw);
    expect(list.map((d) => [d.name, d.version, d.direct])).toEqual([
      ["django", "4.2.1", true],
      ["requests", "2.31.0", true],
      ["urllib3", "2.0.0", false],
      ["fastapi", null, true],
    ]);
    expect(list[0]!.ecosystem).toBe("PYPI");
  });

  it("detects requirements variants", () => {
    expect(detectEcosystem("requirements-dev.txt")).toBe("PYPI");
    expect(detectEcosystem("backend/requirements.prod.txt")).toBe("PYPI");
    expect(detectEcosystem("requirements.in")).toBeNull();
  });

  it("parses poetry.lock", () => {
    const raw = `[[package]]
name = "Flask"
version = "2.2.0"
description = "x"
groups = ["main"]

[package.dependencies]
Werkzeug = ">=2.2.0"

[[package]]
name = "pytest"
version = "7.0.0"
groups = ["dev"]
`;
    const list = deps("poetry.lock", raw);
    expect(list.map((d) => [d.name, d.version, !!d.dev])).toEqual([
      ["flask", "2.2.0", false],
      ["pytest", "7.0.0", true],
    ]);
  });

  it("parses uv.lock and skips the project itself", () => {
    const raw = `version = 1

[[package]]
name = "my-app"
version = "0.1.0"
source = { editable = "." }
dependencies = [
    { name = "fastapi" },
]

[[package]]
name = "fastapi"
version = "0.110.0"
source = { registry = "https://pypi.org/simple" }
dependencies = [
    { name = "starlette" },
]

[[package]]
name = "starlette"
version = "0.36.3"
source = { registry = "https://pypi.org/simple" }
`;
    const list = deps("uv.lock", raw);
    expect(list.map((d) => [d.name, d.version, d.direct])).toEqual([
      ["fastapi", "0.110.0", true],
      ["starlette", "0.36.3", false],
    ]);
  });

  it("parses Pipfile.lock", () => {
    const raw = JSON.stringify({
      default: { requests: { version: "==2.25.0" } },
      develop: { black: { version: "==23.1.0" } },
    });
    const list = deps("Pipfile.lock", raw);
    expect(list.map((d) => [d.name, d.version, !!d.dev])).toEqual([
      ["requests", "2.25.0", false],
      ["black", "23.1.0", true],
    ]);
  });
});

describe("go.mod", () => {
  it("parses require blocks, indirect markers and the stdlib toolchain", () => {
    const raw = `module example.com/app

go 1.22

toolchain go1.22.3

require github.com/gin-gonic/gin v1.9.0

require (
	golang.org/x/net v0.17.0 // indirect
	github.com/foo/bar v2.0.0+incompatible
)
`;
    const list = deps("go.mod", raw);
    expect(list.map((d) => [d.name, d.version, d.direct])).toEqual([
      ["github.com/gin-gonic/gin", "1.9.0", true],
      ["golang.org/x/net", "0.17.0", false],
      ["github.com/foo/bar", "2.0.0", true],
      ["stdlib", "1.22.3", true],
    ]);
  });
});

describe("Cargo.lock", () => {
  it("skips workspace crates without a source", () => {
    const raw = `version = 3

[[package]]
name = "my-crate"
version = "0.1.0"
dependencies = ["tokio"]

[[package]]
name = "tokio"
version = "1.28.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "abc"
`;
    expect(deps("Cargo.lock", raw)).toEqual([
      expect.objectContaining({ ecosystem: "CARGO", name: "tokio", version: "1.28.0" }),
    ]);
  });
});

describe("Gemfile.lock", () => {
  it("parses specs and marks DEPENDENCIES as direct", () => {
    const raw = `GEM
  remote: https://rubygems.org/
  specs:
    nokogiri (1.15.4-x86_64-linux)
      racc (~> 1.4)
    racc (1.7.1)
    rails (7.0.4)

PLATFORMS
  x86_64-linux

DEPENDENCIES
  rails (~> 7.0)

BUNDLED WITH
   2.4.10
`;
    const list = deps("Gemfile.lock", raw);
    expect(list.map((d) => [d.name, d.version, d.direct])).toEqual([
      ["nokogiri", "1.15.4", false],
      ["racc", "1.7.1", false],
      ["rails", "7.0.4", true],
    ]);
  });
});

describe("composer.lock", () => {
  it("strips v prefixes and skips dev branches", () => {
    const raw = JSON.stringify({
      packages: [
        { name: "laravel/framework", version: "v10.0.0" },
        { name: "acme/wip", version: "dev-main" },
      ],
      "packages-dev": [{ name: "phpunit/phpunit", version: "10.1.0" }],
    });
    const list = deps("composer.lock", raw);
    expect(list.map((d) => [d.name, d.version, !!d.dev])).toEqual([
      ["laravel/framework", "10.0.0", false],
      ["phpunit/phpunit", "10.1.0", true],
    ]);
  });
});
