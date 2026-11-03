export type Ecosystem = "NPM" | "PYPI" | "GO" | "CARGO" | "RUBYGEMS" | "COMPOSER";

export interface NormalizedDependency {
  ecosystem: Ecosystem;
  name: string;
  version: string | null;
  direct: boolean;
  /** true when the dependency is only used for development (devDependencies, dev groups). */
  dev?: boolean;
  sourceFile: string;
  dependencyPath?: string[];
}

export type LockfileType =
  | "package-lock"
  | "pnpm-lock"
  | "yarn-lock"
  | "bun-lock"
  | "requirements-txt"
  | "poetry-lock"
  | "uv-lock"
  | "pipfile-lock"
  | "go-mod"
  | "cargo-lock"
  | "gemfile-lock"
  | "composer-lock";

export interface ParseResult {
  type: LockfileType;
  ecosystem: Ecosystem;
  dependencies: NormalizedDependency[];
}

export interface ParseError {
  type: "UNSUPPORTED_EXTENSION" | "PARSE_ERROR" | "EMPTY_FILE" | "FILE_TOO_LARGE";
  message: string;
}
