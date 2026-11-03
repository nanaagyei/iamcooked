import type { CoreEcosystem } from "./ecosystems";

export type PackageManager =
  | "npm"
  | "pnpm"
  | "yarn"
  | "bun"
  | "pip"
  | "poetry"
  | "uv"
  | "pipenv"
  | "go"
  | "cargo"
  | "bundler"
  | "composer";

export function packageManagerForFile(file: string | undefined, ecosystem: CoreEcosystem): PackageManager {
  const base = (file ?? "").split(/[\\/]/).pop() ?? "";
  switch (base) {
    case "pnpm-lock.yaml":
      return "pnpm";
    case "yarn.lock":
      return "yarn";
    case "bun.lock":
      return "bun";
    case "poetry.lock":
      return "poetry";
    case "uv.lock":
      return "uv";
    case "Pipfile.lock":
      return "pipenv";
  }
  switch (ecosystem) {
    case "NPM":
      return "npm";
    case "PYPI":
      return "pip";
    case "GO":
      return "go";
    case "CARGO":
      return "cargo";
    case "RUBYGEMS":
      return "bundler";
    case "COMPOSER":
      return "composer";
  }
}

export interface FixPlan {
  /** Shell command that applies the fix, when one exists. */
  command: string | null;
  /** One-line, plain-English instruction. */
  instruction: string;
}

export function buildFixPlan(input: {
  ecosystem: CoreEcosystem;
  name: string;
  fixedVersion: string | null;
  direct: boolean;
  sourceFile?: string;
  malicious?: boolean;
}): FixPlan {
  const { ecosystem, name, fixedVersion, direct } = input;
  const pm = packageManagerForFile(input.sourceFile, ecosystem);
  const src = input.sourceFile ?? "";

  // Globally installed tools (from `iamcooked tools`)
  if (src === "npm (global)" || src === "pipx" || src.endsWith("(installed)")) {
    if (input.malicious) {
      return {
        command: src === "pipx" ? `pipx uninstall ${name}` : src === "npm (global)" ? `npm uninstall -g ${name}` : null,
        instruction: `Uninstall ${name} now and rotate every credential this machine had access to.`,
      };
    }
    if (!fixedVersion) return { command: null, instruction: `No fixed release of ${name} yet — watch the advisory and limit what the tool can access until then.` };
    if (src === "npm (global)") return { command: `npm install -g ${name}@^${fixedVersion}`, instruction: `Update your global ${name} to ${fixedVersion} or later.` };
    if (src === "pipx") return { command: `pipx upgrade ${name}`, instruction: `Upgrade ${name} to ${fixedVersion} or later.` };
    return {
      command: null,
      instruction: `Update ${name} to ${fixedVersion} or later the same way you installed it (built-in updater, Homebrew, or \`npm i -g ${name}@latest\`).`,
    };
  }

  if (input.malicious) {
    const remove: Record<PackageManager, string> = {
      npm: `npm uninstall ${name}`,
      pnpm: `pnpm remove ${name}`,
      yarn: `yarn remove ${name}`,
      bun: `bun remove ${name}`,
      pip: `pip uninstall -y ${name}`,
      poetry: `poetry remove ${name}`,
      uv: `uv remove ${name}`,
      pipenv: `pipenv uninstall ${name}`,
      go: `go mod edit -droprequire=${name}`,
      cargo: `cargo remove ${name}`,
      bundler: `bundle remove ${name}`,
      composer: `composer remove ${name}`,
    };
    return {
      command: direct ? remove[pm] : null,
      instruction: direct
        ? `Remove ${name} immediately, then rotate every secret that was on the machine (env vars, tokens, SSH keys).`
        : `Find which dependency pulls in ${name}, remove or replace it, and rotate every secret that was on the machine.`,
    };
  }

  if (!fixedVersion) {
    return {
      command: null,
      instruction: `No patched version yet. Check whether you use the affected feature, look for an alternative package, and watch the advisory for a fix.`,
    };
  }

  if (ecosystem === "GO" && name === "stdlib") {
    return {
      command: `go mod edit -toolchain=go${fixedVersion}`,
      instruction: `Upgrade Go to ${fixedVersion} or newer (this is a Go standard-library vulnerability).`,
    };
  }

  const v = fixedVersion;
  if (direct) {
    const cmd: Record<PackageManager, string> = {
      npm: `npm install ${name}@^${v}`,
      pnpm: `pnpm add ${name}@^${v}`,
      yarn: `yarn add ${name}@^${v}`,
      bun: `bun add ${name}@^${v}`,
      pip: `pip install "${name}>=${v}"`,
      poetry: `poetry add "${name}@^${v}"`,
      uv: `uv add "${name}>=${v}"`,
      pipenv: `pipenv install "${name}>=${v}"`,
      go: `go get ${name}@v${v}`,
      cargo: `cargo update -p ${name} --precise ${v}`,
      bundler: `bundle update ${name} --conservative`,
      composer: `composer require "${name}:^${v}"`,
    };
    return { command: cmd[pm], instruction: `Upgrade ${name} to ${v} or later.` };
  }

  // Transitive dependency: refresh the lockfile, or force a version with overrides.
  const transitive: Record<PackageManager, FixPlan> = {
    npm: { command: `npm update ${name}`, instruction: `Update the lockfile so ${name} resolves to ${v}+. If a parent pins it, add "overrides": { "${name}": "^${v}" } to package.json.` },
    pnpm: { command: `pnpm update ${name} --depth Infinity`, instruction: `Refresh ${name} to ${v}+. If a parent pins it, add "pnpm": { "overrides": { "${name}": "^${v}" } } to package.json.` },
    yarn: { command: `yarn up -R ${name}`, instruction: `Refresh ${name} to ${v}+. If a parent pins it, add "resolutions": { "${name}": "^${v}" } to package.json.` },
    bun: { command: `bun update ${name}`, instruction: `Refresh ${name} to ${v}+. If a parent pins it, add "overrides": { "${name}": "^${v}" } to package.json.` },
    pip: { command: `pip install --upgrade "${name}>=${v}"`, instruction: `Upgrade ${name} to ${v}+ and re-freeze your requirements.` },
    poetry: { command: `poetry update ${name}`, instruction: `Update ${name} to ${v}+ in poetry.lock.` },
    uv: { command: `uv lock --upgrade-package ${name}`, instruction: `Upgrade ${name} to ${v}+ in uv.lock.` },
    pipenv: { command: `pipenv update ${name}`, instruction: `Update ${name} to ${v}+ in Pipfile.lock.` },
    go: { command: `go get ${name}@v${v} && go mod tidy`, instruction: `Bump the indirect module ${name} to v${v}.` },
    cargo: { command: `cargo update -p ${name} --precise ${v}`, instruction: `Update ${name} to ${v} in Cargo.lock.` },
    bundler: { command: `bundle update ${name} --conservative`, instruction: `Update ${name} to ${v}+ in Gemfile.lock.` },
    composer: { command: `composer update ${name} --with-dependencies`, instruction: `Update ${name} to ${v}+ in composer.lock.` },
  };
  return transitive[pm];
}
