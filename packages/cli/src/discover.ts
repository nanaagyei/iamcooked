import { readdirSync, statSync, existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join, relative, resolve } from "node:path";
import { detectLockfileType } from "@iamcooked/scanner";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".hg",
  ".venv",
  "venv",
  "env",
  ".tox",
  "__pycache__",
  "site-packages",
  "vendor",
  "target",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".turbo",
  ".cache",
  "coverage",
  ".pnpm-store",
]);

const PROJECT_MCP_FILES = [".mcp.json", "mcp.json", ".cursor/mcp.json", ".vscode/mcp.json", ".roo/mcp.json", ".kiro/settings/mcp.json"];

export interface DiscoveredFile {
  path: string;
  /** Path relative to the scan root, used in output. */
  display: string;
}

export function findLockfiles(root: string, maxDepth = 6): DiscoveredFile[] {
  const out: DiscoveredFile[] = [];
  const abs = resolve(root);

  const walk = (dir: string, depth: number) => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        if (depth < maxDepth && !SKIP_DIRS.has(name) && !name.startsWith(".")) walk(full, depth + 1);
      } else if (st.isFile() && detectLockfileType(name)) {
        out.push({ path: full, display: relative(abs, full) || name });
      }
    }
  };

  if (existsSync(abs) && statSync(abs).isFile()) {
    return [{ path: abs, display: relative(process.cwd(), abs) }];
  }
  walk(abs, 0);
  return dedupeLockfiles(out);
}

/**
 * In a folder with both package-lock.json and yarn.lock etc. we keep all of them, but we
 * drop requirements*.txt when a real Python lockfile sits next to it (it's usually derived).
 */
function dedupeLockfiles(files: DiscoveredFile[]): DiscoveredFile[] {
  const byDir = new Map<string, DiscoveredFile[]>();
  for (const f of files) {
    const dir = f.path.slice(0, f.path.length - (f.path.split(/[\\/]/).pop()?.length ?? 0));
    byDir.set(dir, [...(byDir.get(dir) ?? []), f]);
  }
  const out: DiscoveredFile[] = [];
  for (const group of byDir.values()) {
    const hasPyLock = group.some((f) => /(poetry|uv)\.lock$|Pipfile\.lock$/.test(f.path));
    out.push(...group.filter((f) => !(hasPyLock && /requirements[^/\\]*\.txt$/.test(f.path))));
  }
  return out.sort((a, b) => a.display.localeCompare(b.display));
}

export function findProjectMcpConfigs(root: string): DiscoveredFile[] {
  const abs = resolve(root);
  return PROJECT_MCP_FILES.map((p) => join(abs, p))
    .filter((p) => existsSync(p))
    .map((p) => ({ path: p, display: relative(abs, p) }));
}

/** Well-known user-level MCP config locations for popular AI clients. */
export function globalMcpConfigCandidates(): Array<DiscoveredFile & { client: string }> {
  const home = homedir();
  const os = platform();
  const appData = process.env["APPDATA"] ?? join(home, "AppData", "Roaming");
  const claudeDesktop =
    os === "darwin"
      ? join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json")
      : os === "win32"
        ? join(appData, "Claude", "claude_desktop_config.json")
        : join(home, ".config", "Claude", "claude_desktop_config.json");
  const vscodeUser =
    os === "darwin"
      ? join(home, "Library", "Application Support", "Code", "User", "mcp.json")
      : os === "win32"
        ? join(appData, "Code", "User", "mcp.json")
        : join(home, ".config", "Code", "User", "mcp.json");

  const list: Array<{ client: string; path: string }> = [
    { client: "Cursor", path: join(home, ".cursor", "mcp.json") },
    { client: "Claude Desktop", path: claudeDesktop },
    { client: "Claude Code", path: join(home, ".claude.json") },
    { client: "Windsurf", path: join(home, ".codeium", "windsurf", "mcp_config.json") },
    { client: "VS Code", path: vscodeUser },
    { client: "Gemini CLI", path: join(home, ".gemini", "settings.json") },
    { client: "Zed", path: join(home, ".config", "zed", "settings.json") },
    { client: "Amazon Q", path: join(home, ".aws", "amazonq", "mcp.json") },
  ];
  return list
    .filter((x) => existsSync(x.path))
    .map((x) => ({ ...x, display: x.path.replace(home, "~") }));
}
