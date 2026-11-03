import type { Ecosystem, LockfileType, ParseResult, ParseError, NormalizedDependency } from "./types";
import { parsePackageLock } from "./parsers/package-lock";
import { parsePnpmLock } from "./parsers/pnpm-lock";
import { parseYarnLock } from "./parsers/yarn-lock";
import { parseBunLock } from "./parsers/bun-lock";
import { parsePipfileLock, parsePoetryLock, parseRequirementsTxt, parseUvLock } from "./parsers/python";
import { parseCargoLock, parseComposerLock, parseGemfileLock, parseGoMod } from "./parsers/other";

export type { Ecosystem, NormalizedDependency, LockfileType, ParseResult, ParseError } from "./types";
export {
  analyzeMcpConfig,
  isMcpConfig,
  splitNpmSpec,
  splitPySpec,
} from "./mcp";
export type { McpAnalysis, McpIssue, McpIssueCode, McpIssueSeverity, McpServerInfo } from "./mcp";
export { normalizePypiName, stripJsonc } from "./parsers/util";
export { parsePnpmPackageKey } from "./parsers/pnpm-lock";

interface LockfileSpec {
  type: LockfileType;
  ecosystem: Ecosystem;
  label: string;
  parse: (raw: string) => NormalizedDependency[];
}

const LOCKFILES: Record<string, LockfileSpec> = {
  "package-lock.json": { type: "package-lock", ecosystem: "NPM", label: "npm", parse: parsePackageLock },
  "npm-shrinkwrap.json": { type: "package-lock", ecosystem: "NPM", label: "npm", parse: parsePackageLock },
  "pnpm-lock.yaml": { type: "pnpm-lock", ecosystem: "NPM", label: "pnpm", parse: parsePnpmLock },
  "yarn.lock": { type: "yarn-lock", ecosystem: "NPM", label: "Yarn", parse: parseYarnLock },
  "bun.lock": { type: "bun-lock", ecosystem: "NPM", label: "Bun", parse: parseBunLock },
  "poetry.lock": { type: "poetry-lock", ecosystem: "PYPI", label: "Poetry", parse: parsePoetryLock },
  "uv.lock": { type: "uv-lock", ecosystem: "PYPI", label: "uv", parse: parseUvLock },
  "Pipfile.lock": { type: "pipfile-lock", ecosystem: "PYPI", label: "Pipenv", parse: parsePipfileLock },
  "go.mod": { type: "go-mod", ecosystem: "GO", label: "Go", parse: parseGoMod },
  "Cargo.lock": { type: "cargo-lock", ecosystem: "CARGO", label: "Cargo", parse: parseCargoLock },
  "Gemfile.lock": { type: "gemfile-lock", ecosystem: "RUBYGEMS", label: "Bundler", parse: parseGemfileLock },
  "composer.lock": { type: "composer-lock", ecosystem: "COMPOSER", label: "Composer", parse: parseComposerLock },
};

const REQUIREMENTS: LockfileSpec = {
  type: "requirements-txt",
  ecosystem: "PYPI",
  label: "pip",
  parse: parseRequirementsTxt,
};

/** Every filename the scanner understands, for UIs and docs. */
export const SUPPORTED_LOCKFILES: Array<{ name: string; ecosystem: Ecosystem; label: string }> = [
  ...Object.entries(LOCKFILES).map(([name, s]) => ({ name, ecosystem: s.ecosystem, label: s.label })),
  { name: "requirements.txt", ecosystem: "PYPI", label: "pip" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function specFor(filename: string): LockfileSpec | null {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  if (LOCKFILES[base]) return LOCKFILES[base]!;
  if (/^requirements[\w.-]*\.(txt|in)$/i.test(base) && !base.endsWith(".in")) return REQUIREMENTS;
  return null;
}

export function detectLockfileType(filename: string): LockfileType | null {
  return specFor(filename)?.type ?? null;
}

export function detectEcosystem(filename: string): Ecosystem | null {
  return specFor(filename)?.ecosystem ?? null;
}

export function parseLockfile(filename: string, raw: string): ParseResult | ParseError {
  const spec = specFor(filename);
  if (!spec) {
    return { type: "UNSUPPORTED_EXTENSION", message: `Unsupported lockfile: ${filename}` };
  }

  if (!raw.trim()) {
    return { type: "EMPTY_FILE", message: "Lockfile is empty" };
  }

  if (raw.length > MAX_FILE_SIZE) {
    return { type: "FILE_TOO_LARGE", message: "Lockfile exceeds 10MB limit" };
  }

  try {
    const dependencies = spec.parse(raw).map((dep) => ({ ...dep, sourceFile: filename }));
    return { type: spec.type, ecosystem: spec.ecosystem, dependencies };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { type: "PARSE_ERROR", message: `Failed to parse ${filename}: ${message}` };
  }
}
