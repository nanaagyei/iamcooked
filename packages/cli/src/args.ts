import type { FailOn } from "./report";

export type Command = "scan" | "mcp" | "tools" | "doctor" | "help" | "version";
export type Format = "text" | "json" | "markdown" | "sarif";

export interface CliOptions {
  command: Command;
  paths: string[];
  format: Format;
  failOn: FailOn;
  output?: string;
  showDev: boolean;
  all: boolean;
  verbose: boolean;
  mcp: boolean;
  kev: boolean;
  quiet: boolean;
}

const COMMANDS = new Set<Command>(["scan", "mcp", "tools", "doctor", "help", "version"]);
const FORMATS = new Set<Format>(["text", "json", "markdown", "sarif"]);
const FAIL_ON = new Set<FailOn>(["none", "any", "low", "medium", "high", "critical"]);

export class UsageError extends Error {}

export function parseArgs(argv: string[], env: NodeJS.ProcessEnv = process.env): CliOptions {
  const opts: CliOptions = {
    command: "scan",
    paths: [],
    format: "text",
    failOn: (env["IAMCOOKED_FAIL_ON"] as FailOn) ?? "none",
    showDev: true,
    all: false,
    verbose: false,
    mcp: true,
    kev: true,
    quiet: false,
  };

  const rest = [...argv];
  if (rest[0] && COMMANDS.has(rest[0] as Command)) opts.command = rest.shift() as Command;

  const value = (flag: string, inline?: string): string => {
    const v = inline ?? rest.shift();
    if (v === undefined || v.startsWith("--")) throw new UsageError(`${flag} needs a value`);
    return v;
  };

  while (rest.length) {
    const raw = rest.shift()!;
    const [flag, inline] = raw.startsWith("--") && raw.includes("=") ? [raw.slice(0, raw.indexOf("=")), raw.slice(raw.indexOf("=") + 1)] : [raw, undefined];
    switch (flag) {
      case "-h":
      case "--help":
        opts.command = "help";
        break;
      case "-v":
      case "--version":
        opts.command = "version";
        break;
      case "--json":
        opts.format = "json";
        break;
      case "-f":
      case "--format": {
        const f = value(flag, inline) as Format;
        if (!FORMATS.has(f)) throw new UsageError(`--format must be one of: ${[...FORMATS].join(", ")}`);
        opts.format = f;
        break;
      }
      case "--fail-on": {
        const f = value(flag, inline).toLowerCase() as FailOn;
        if (!FAIL_ON.has(f)) throw new UsageError(`--fail-on must be one of: ${[...FAIL_ON].join(", ")}`);
        opts.failOn = f;
        break;
      }
      case "--ci":
        if (opts.failOn === "none") opts.failOn = "high";
        break;
      case "-o":
      case "--output":
        opts.output = value(flag, inline);
        break;
      case "--prod":
      case "--no-dev":
        opts.showDev = false;
        break;
      case "--dev":
        opts.showDev = true;
        break;
      case "--all":
        opts.all = true;
        break;
      case "--verbose":
        opts.verbose = true;
        opts.all = true;
        break;
      case "--no-mcp":
        opts.mcp = false;
        break;
      case "--no-kev":
        opts.kev = false;
        break;
      case "-q":
      case "--quiet":
        opts.quiet = true;
        break;
      default:
        if (flag.startsWith("-")) throw new UsageError(`Unknown option: ${flag}`);
        opts.paths.push(flag);
    }
  }
  if (opts.paths.length === 0) opts.paths.push(".");
  return opts;
}

export const HELP = `
  iamcooked — am I cooked? CVE & malware check for vibecoders

  Usage
    npx iamcooked [path]            Scan lockfiles + project MCP configs (default)
    npx iamcooked mcp               Check every MCP server config on this machine
    npx iamcooked tools             Check installed AI coding tools & global packages
    npx iamcooked doctor [path]     All of the above

  Options
    -f, --format <fmt>    text (default) | json | markdown | sarif
        --json            Shortcut for --format json
    -o, --output <file>   Write the report to a file
        --fail-on <sev>   Exit 1 if anything at/above: any | low | medium | high | critical
        --ci              Same as --fail-on high (unless --fail-on is set)
        --prod            Hide dev-only dependencies (malware is always shown)
        --all             Show every affected package, not just the top 15
        --verbose         Show every advisory per package
        --no-mcp          Skip MCP config checks during scan
        --no-kev          Skip the CISA Known Exploited Vulnerabilities lookup
    -q, --quiet           No progress output
    -h, --help            Show help
    -v, --version         Show version

  Supported files
    npm, pnpm, Yarn (v1 + Berry), Bun (bun.lock) · requirements*.txt, Poetry, uv, Pipenv
    go.mod (incl. Go stdlib) · Cargo.lock · Gemfile.lock · composer.lock
    MCP: .cursor/mcp.json, .vscode/mcp.json, .mcp.json, Claude Desktop/Code, Windsurf, Zed…

  Examples
    npx iamcooked
    npx iamcooked ./apps/web --prod
    npx iamcooked --ci --format sarif -o iamcooked.sarif
    npx iamcooked doctor
`;
