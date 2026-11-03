/**
 * Ecosystem-agnostic version comparison, good enough for SemVer (npm, Cargo, Go),
 * PEP 440 (PyPI) and RubyGems orderings that appear in OSV ranges. We avoid the
 * `semver` package so the core stays dependency-free and works for non-npm versions.
 */

const PRE_RANK: Record<string, number> = {
  dev: -4,
  alpha: -3,
  a: -3,
  beta: -2,
  b: -2,
  pre: -2,
  preview: -2,
  rc: -1,
  c: -1,
  post: 1,
};

type Token = number | string;

function tokenize(version: string): { release: number[]; tail: Token[] } {
  const v = version.trim().replace(/^v/i, "").replace(/\+.*$/, ""); // build metadata never orders
  const m = v.match(/^(\d+(?:\.\d+)*)(.*)$/);
  if (!m) return { release: [], tail: [v.toLowerCase()] };
  const release = m[1]!.split(".").map(Number);
  const tail: Token[] = [];
  for (const part of m[2]!.toLowerCase().split(/[.\-_]+|(?<=\d)(?=[a-z])|(?<=[a-z])(?=\d)/)) {
    if (!part) continue;
    tail.push(/^\d+$/.test(part) ? Number(part) : part);
  }
  return { release, tail };
}

function rank(token: Token): number {
  if (typeof token === "number") return 0;
  return PRE_RANK[token] ?? -1; // unknown labels behave like pre-releases
}

/** Returns <0 if a<b, 0 if equal, >0 if a>b. */
export function compareVersions(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  const len = Math.max(ta.release.length, tb.release.length);
  for (let i = 0; i < len; i++) {
    const d = (ta.release[i] ?? 0) - (tb.release[i] ?? 0);
    if (d !== 0) return d;
  }
  // Same release: compare suffixes. No suffix == final release.
  const n = Math.max(ta.tail.length, tb.tail.length);
  for (let i = 0; i < n; i++) {
    const x = ta.tail[i];
    const y = tb.tail[i];
    // A missing suffix is the final release: newer than pre-releases, older than post-releases.
    if (x === undefined) return rank(y!) < 0 ? 1 : -1;
    if (y === undefined) return rank(x) < 0 ? -1 : 1;
    if (typeof x === "number" && typeof y === "number") {
      if (x !== y) return x - y;
      continue;
    }
    const rx = rank(x);
    const ry = rank(y);
    if (rx !== ry) return rx - ry;
    if (typeof x === "string" && typeof y === "string" && x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

export function isGreater(a: string, b: string): boolean {
  return compareVersions(a, b) > 0;
}
