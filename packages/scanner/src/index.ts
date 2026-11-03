import type { LockfileType, ParseResult, ParseError, NormalizedDependency } from "./types";
import { parsePackageLock } from "./parsers/package-lock";
import { parsePnpmLock } from "./parsers/pnpm-lock";
import { parseYarnLock } from "./parsers/yarn-lock";

export type { Ecosystem, NormalizedDependency, LockfileType, ParseResult, ParseError } from "./types";

const LOCKFILE_MAP: Record<string, LockfileType> = {
  "package-lock.json": "package-lock",
  "pnpm-lock.yaml": "pnpm-lock",
  "yarn.lock": "yarn-lock",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function detectLockfileType(filename: string): LockfileType | null {
  const base = filename.split("/").pop() ?? filename;
  return LOCKFILE_MAP[base] ?? null;
}

export function parseLockfile(filename: string, raw: string): ParseResult | ParseError {
  const type = detectLockfileType(filename);
  if (!type) {
    return { type: "UNSUPPORTED_EXTENSION", message: `Unsupported lockfile: ${filename}` };
  }

  if (!raw.trim()) {
    return { type: "EMPTY_FILE", message: "Lockfile is empty" };
  }

  if (raw.length > MAX_FILE_SIZE) {
    return { type: "FILE_TOO_LARGE", message: "Lockfile exceeds 10MB limit" };
  }

  try {
    let dependencies: NormalizedDependency[];

    switch (type) {
      case "package-lock":
        dependencies = parsePackageLock(raw);
        break;
      case "pnpm-lock":
        dependencies = parsePnpmLock(raw);
        break;
      case "yarn-lock":
        dependencies = parseYarnLock(raw);
        break;
    }

    dependencies = dependencies.map((dep) => ({ ...dep, sourceFile: filename }));

    return { type, dependencies };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { type: "PARSE_ERROR", message: `Failed to parse ${filename}: ${message}` };
  }
}
