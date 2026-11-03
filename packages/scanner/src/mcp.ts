import type { NormalizedDependency } from "./types";
import { normalizePypiName, stripJsonc } from "./parsers/util";

/**
 * MCP (Model Context Protocol) config analysis.
 *
 * Vibecoders wire MCP servers into Cursor, Claude, Windsurf, VS Code and Zed by pasting
 * snippets like `npx -y some-server`. Every one of those runs with your user's permissions,
 * so we (1) extract the packages they launch so they can be checked for CVEs/malware, and
 * (2) flag risky config patterns. Pure TypeScript — safe to run in the browser.
 */

export type McpIssueSeverity = "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type McpIssueCode =
  | "HARDCODED_SECRET"
  | "UNPINNED_PACKAGE"
  | "INSECURE_TRANSPORT"
  | "REMOTE_SERVER"
  | "UNPINNED_IMAGE"
  | "BROAD_FILESYSTEM"
  | "PIPE_TO_SHELL";

export interface McpIssue {
  server: string;
  code: McpIssueCode;
  severity: McpIssueSeverity;
  title: string;
  detail: string;
  fix: string;
}

export interface McpServerInfo {
  name: string;
  transport: "stdio" | "remote";
  command?: string;
  url?: string;
  /** Package the server launches, when we can tell (npx/uvx/pipx/bunx/dlx). */
  package?: { ecosystem: "NPM" | "PYPI"; name: string; version: string | null; spec: string };
  image?: string;
}

export interface McpAnalysis {
  servers: McpServerInfo[];
  dependencies: NormalizedDependency[];
  issues: McpIssue[];
}

interface RawServer {
  command?: unknown;
  args?: unknown;
  env?: unknown;
  headers?: unknown;
  url?: unknown;
  serverUrl?: unknown;
  type?: unknown;
}

const NPM_RUNNERS = new Set(["npx", "bunx", "pnpx"]);
const DLX_RUNNERS = new Set(["pnpm", "yarn", "bun", "npm"]);
const PY_RUNNERS = new Set(["uvx", "pipx"]);

const SECRET_KEY = /(api[_-]?key|token|secret|password|passwd|auth|credential|private[_-]?key|access[_-]?key|bearer|cookie|session)/i;
const SECRET_VALUE = [
  /\bsk-(?:ant-|proj-|live-)?[A-Za-z0-9_-]{16,}/, // OpenAI / Anthropic / Stripe style
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}/,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{30,}/,
  /\bglpat-[A-Za-z0-9_-]{20,}/,
  /\bnpm_[A-Za-z0-9]{30,}/,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, // JWT (e.g. Supabase service role)
];

function isPlaceholder(value: string): boolean {
  const v = value.trim();
  return (
    v === "" ||
    /^\$\{[^}]+\}$/.test(v) || // ${env:FOO} / ${input:foo} / ${FOO}
    /^\$[A-Z_][A-Z0-9_]*$/.test(v) ||
    /^<[^>]+>$/.test(v) ||
    /^(your|my|xxx|changeme|replace|todo|placeholder|example)/i.test(v) ||
    /^x+$/i.test(v)
  );
}

function looksLikeSecret(key: string, value: string): boolean {
  if (isPlaceholder(value)) return false;
  if (SECRET_VALUE.some((re) => re.test(value))) return true;
  return SECRET_KEY.test(key) && value.length >= 12 && !/\s/.test(value) && !/^https?:\/\//.test(value);
}

function mask(value: string): string {
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}…${value.slice(-2)}`;
}

/** Split an npm spec: "@scope/pkg@1.2.3" → { name, version }. */
export function splitNpmSpec(spec: string): { name: string; version: string | null } {
  const at = spec.lastIndexOf("@");
  if (at > 0) return { name: spec.slice(0, at), version: spec.slice(at + 1) || null };
  return { name: spec, version: null };
}

/** Split a Python spec: "pkg==1.2.3", "pkg@1.2.3", "pkg[extra]>=1" → { name, version }. */
export function splitPySpec(spec: string): { name: string; version: string | null } {
  const m = spec.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(?:\[[^\]]*\])?(?:(==|@)([^\s;,]+))?/);
  if (!m) return { name: spec, version: null };
  return { name: normalizePypiName(m[1]!), version: m[3] ?? null };
}

function isExactVersion(v: string | null): boolean {
  return !!v && /^\d+(\.\d+){0,3}([-.+][0-9A-Za-z.-]+)?$/.test(v);
}

function firstPositional(args: string[], flagsWithValue: string[]): { value?: string; from?: string } {
  let from: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--from" || a === "--package" || a === "-p" || a === "--spec") {
      from = args[i + 1];
      i++;
      continue;
    }
    if (a.startsWith("--package=") || a.startsWith("--from=")) {
      from = a.split("=").slice(1).join("=");
      continue;
    }
    if (flagsWithValue.includes(a)) {
      i++;
      continue;
    }
    if (a.startsWith("-")) continue;
    return { value: a, from };
  }
  return { from };
}

function detectPackage(command: string, args: string[]): McpServerInfo["package"] | undefined {
  const bin = command.split(/[\\/]/).pop()!.replace(/\.(cmd|exe)$/i, "");
  let rest = args;
  let eco: "NPM" | "PYPI" | null = null;

  if (NPM_RUNNERS.has(bin)) eco = "NPM";
  else if (DLX_RUNNERS.has(bin) && (args[0] === "dlx" || args[0] === "exec" || args[0] === "x")) {
    eco = "NPM";
    rest = args.slice(1);
  } else if (PY_RUNNERS.has(bin)) {
    eco = "PYPI";
    if (bin === "pipx" && args[0] === "run") rest = args.slice(1);
  } else if (bin === "uv" && args[0] === "tool" && args[1] === "run") {
    eco = "PYPI";
    rest = args.slice(2);
  }
  if (!eco) return undefined;

  const { value, from } = firstPositional(rest, ["--python", "--registry", "--cache", "--with", "--index-url", "--node-options"]);
  const spec = from ?? value;
  if (!spec || spec.startsWith(".") || spec.startsWith("/") || spec.includes("://")) return undefined;

  if (eco === "NPM") {
    if (spec.startsWith("github:") || spec.includes(".tgz")) return undefined;
    const { name, version } = splitNpmSpec(spec);
    return { ecosystem: "NPM", name, version, spec };
  }
  const { name, version } = splitPySpec(spec);
  return { ecosystem: "PYPI", name, version, spec };
}

function detectDockerImage(command: string, args: string[]): string | undefined {
  const bin = command.split(/[\\/]/).pop()!;
  if (bin !== "docker" && bin !== "podman") return undefined;
  if (args[0] !== "run") return undefined;
  const withValue = new Set(["-e", "--env", "-v", "--volume", "--name", "-p", "--publish", "--network", "--env-file", "-w", "--workdir", "--user", "-u", "--mount", "--entrypoint"]);
  for (let i = 1; i < args.length; i++) {
    const a = args[i]!;
    if (withValue.has(a)) {
      i++;
      continue;
    }
    if (a.startsWith("-")) continue;
    return a;
  }
  return undefined;
}

function isLocalHost(url: URL): boolean {
  return ["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"].includes(url.hostname);
}

function stringRecord(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) if (typeof val === "string") out[k] = val;
  return out;
}

function analyzeServer(name: string, raw: RawServer, issues: McpIssue[]): McpServerInfo {
  const urlValue = typeof raw.url === "string" ? raw.url : typeof raw.serverUrl === "string" ? raw.serverUrl : undefined;
  const command = typeof raw.command === "string" ? raw.command : undefined;
  const args = Array.isArray(raw.args) ? raw.args.filter((a): a is string => typeof a === "string") : [];
  const env = stringRecord(raw.env);
  const headers = stringRecord(raw.headers);

  // Some configs put the whole command line in `command`
  let cmd = command;
  let argv = args;
  if (cmd && args.length === 0 && /\s/.test(cmd.trim())) {
    const parts = cmd.trim().split(/\s+/);
    cmd = parts[0];
    argv = parts.slice(1);
  }

  const info: McpServerInfo = { name, transport: urlValue ? "remote" : "stdio", command: cmd, url: urlValue };

  // --- secrets in env, headers, args ---
  for (const [k, v] of [...Object.entries(env), ...Object.entries(headers)]) {
    if (looksLikeSecret(k, v.replace(/^Bearer\s+/i, ""))) {
      issues.push({
        server: name,
        code: "HARDCODED_SECRET",
        severity: "HIGH",
        title: `Hard-coded secret in "${k}"`,
        detail: `The value (${mask(v)}) is stored in plain text in this config. Config files get synced, screenshotted, pasted into chats and committed to git.`,
        fix: `Reference an environment variable instead (e.g. "\${env:${k}}" in VS Code/Cursor, or set it in your shell), and rotate the key if this file was ever shared or committed.`,
      });
    }
  }
  for (const a of argv) {
    const tokenish = a.includes("=") ? a.split("=").slice(1).join("=") : a;
    if (SECRET_VALUE.some((re) => re.test(tokenish))) {
      issues.push({
        server: name,
        code: "HARDCODED_SECRET",
        severity: "HIGH",
        title: "Secret passed as a command-line argument",
        detail: `An argument (${mask(tokenish)}) looks like an API token. Arguments are visible to every process on the machine (ps/Task Manager) and are stored in plain text here.`,
        fix: "Move the token into an environment variable the server reads, and rotate it if this config was shared.",
      });
    }
  }

  // --- remote servers ---
  if (urlValue) {
    try {
      const u = new URL(urlValue);
      if (u.protocol === "http:" && !isLocalHost(u)) {
        issues.push({
          server: name,
          code: "INSECURE_TRANSPORT",
          severity: "HIGH",
          title: "Remote MCP server over plain HTTP",
          detail: `${u.host} is reached without TLS, so anyone on the network path can read or change the tool calls and responses your agent receives.`,
          fix: "Use the https:// endpoint, or run the server locally.",
        });
      } else if (!isLocalHost(u)) {
        issues.push({
          server: name,
          code: "REMOTE_SERVER",
          severity: "INFO",
          title: `Remote server: ${u.host}`,
          detail: "Tool descriptions and results from a remote server go straight into your agent's context. A compromised or malicious server can inject instructions (prompt injection).",
          fix: "Only connect remote servers from vendors you trust, and prefer OAuth over long-lived tokens.",
        });
      }
    } catch {
      /* ignore invalid URLs */
    }
    return info;
  }

  if (!cmd) return info;

  // --- package-launching servers ---
  const pkg = detectPackage(cmd, argv);
  if (pkg) {
    info.package = pkg;
    if (!isExactVersion(pkg.version)) {
      const pinned = pkg.ecosystem === "NPM" ? `${pkg.name}@<version>` : `${pkg.name}==<version>`;
      issues.push({
        server: name,
        code: "UNPINNED_PACKAGE",
        severity: "MEDIUM",
        title: `${pkg.name} is not pinned to a version`,
        detail: `Every time your editor starts, ${cmd} downloads whatever version of ${pkg.name} was published most recently${argv.includes("-y") || argv.includes("--yes") ? " and runs it without asking (-y)" : ""}. If the maintainer's account is hijacked, malicious code runs on your machine automatically.`,
        fix: `Pin an exact version you've reviewed: "${pinned}".`,
      });
    }
  }

  const image = detectDockerImage(cmd, argv);
  if (image) {
    info.image = image;
    const hasDigest = image.includes("@sha256:");
    const tag = image.split("/").pop()!.split(":")[1];
    if (!hasDigest && (!tag || tag === "latest")) {
      issues.push({
        server: name,
        code: "UNPINNED_IMAGE",
        severity: "LOW",
        title: `Docker image ${image} uses a floating tag`,
        detail: "The image can change underneath you between runs.",
        fix: "Pin a specific tag, or better, an @sha256 digest.",
      });
    }
  }

  // --- filesystem servers with the whole disk exposed ---
  if (/server-filesystem|mcp-server-filesystem|filesystem/i.test(pkg?.name ?? argv.join(" "))) {
    const broad = argv.find((a) => /^(\/|~\/?|\$HOME\/?|%USERPROFILE%\\?|[A-Za-z]:\\?|\/Users\/[^/]+\/?|\/home\/[^/]+\/?)$/.test(a));
    if (broad) {
      issues.push({
        server: name,
        code: "BROAD_FILESYSTEM",
        severity: "MEDIUM",
        title: `Filesystem access to "${broad}"`,
        detail: "This gives the agent read/write access to your entire home directory or disk, including SSH keys, .env files and browser profiles.",
        fix: "Point it at the specific project folder(s) the agent actually needs.",
      });
    }
  }

  // --- curl | sh wrappers ---
  const line = [cmd, ...argv].join(" ");
  if (/(curl|wget)\s[^|]*\|\s*(sudo\s+)?(ba|z)?sh\b/.test(line)) {
    issues.push({
      server: name,
      code: "PIPE_TO_SHELL",
      severity: "HIGH",
      title: "Downloads and executes a remote script",
      detail: "The server start command pipes a script from the internet straight into a shell on every launch.",
      fix: "Download the script once, review it, and run a local copy (or install the server from a package registry with a pinned version).",
    });
  }

  return info;
}

function collectServerMaps(data: unknown): Array<[string, RawServer]> {
  const out: Array<[string, RawServer]> = [];
  if (!data || typeof data !== "object") return out;
  const obj = data as Record<string, unknown>;

  const take = (map: unknown, prefix = "") => {
    if (!map || typeof map !== "object" || Array.isArray(map)) return;
    for (const [name, server] of Object.entries(map)) {
      if (server && typeof server === "object") out.push([prefix + name, server as RawServer]);
    }
  };

  take(obj["mcpServers"]); // Cursor, Claude Desktop, Claude Code, Windsurf, Cline
  take(obj["servers"]); // VS Code .vscode/mcp.json
  take(obj["context_servers"]); // Zed
  take((obj["mcp"] as Record<string, unknown> | undefined)?.["servers"]); // VS Code settings.json
  // Claude Code ~/.claude.json keeps per-project servers
  const projects = obj["projects"];
  if (projects && typeof projects === "object") {
    for (const [path, p] of Object.entries(projects as Record<string, unknown>)) {
      const short = path.split(/[\\/]/).filter(Boolean).pop() ?? path;
      take((p as Record<string, unknown> | null)?.["mcpServers"], `${short}/`);
    }
  }
  return out;
}

/** True when the JSON text looks like an MCP client config. */
export function isMcpConfig(raw: string): boolean {
  return /"(mcpServers|context_servers)"\s*:|"servers"\s*:\s*\{[\s\S]*"(command|url)"\s*:/.test(raw);
}

export function analyzeMcpConfig(raw: string, sourceFile = "mcp.json"): McpAnalysis {
  const data = JSON.parse(stripJsonc(raw)) as unknown;
  const issues: McpIssue[] = [];
  const servers: McpServerInfo[] = [];
  const dependencies: NormalizedDependency[] = [];

  for (const [name, server] of collectServerMaps(data)) {
    const info = analyzeServer(name, server, issues);
    servers.push(info);
    if (info.package) {
      dependencies.push({
        ecosystem: info.package.ecosystem,
        name: info.package.name,
        version: isExactVersion(info.package.version) ? info.package.version : null,
        direct: true,
        sourceFile,
        dependencyPath: [`mcp:${name}`],
      });
    }
  }

  const order: Record<McpIssueSeverity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, INFO: 3 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);
  return { servers, dependencies, issues };
}
