export type Ecosystem = "NPM";

export interface NormalizedDependency {
  ecosystem: Ecosystem;
  name: string;
  version: string | null;
  direct: boolean;
  sourceFile: string;
  dependencyPath?: string[];
}

export type LockfileType = "package-lock" | "pnpm-lock" | "yarn-lock";

export interface ParseResult {
  type: LockfileType;
  dependencies: NormalizedDependency[];
}

export interface ParseError {
  type: "UNSUPPORTED_EXTENSION" | "PARSE_ERROR" | "EMPTY_FILE" | "FILE_TOO_LARGE";
  message: string;
}
