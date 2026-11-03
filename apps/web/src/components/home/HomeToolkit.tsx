import Link from "next/link";
import { ArrowRight, FileMagnifyingGlass, Plugs, Robot, GitPullRequest } from "@phosphor-icons/react/dist/ssr";
import { SectionContainer } from "@/components/layout";
import { CopyCommand } from "@/components/check/CopyCommand";

const CARDS = [
  {
    href: "/scan",
    icon: FileMagnifyingGlass,
    eyebrow: "Your code",
    title: "Scan every dependency",
    body: "npm, pnpm, Yarn, Bun, pip, Poetry, uv, Go, Cargo, Bundler and Composer lockfiles. CVEs, known-malicious releases and actively-exploited bugs, each with the exact fix command.",
    cta: "Scan a lockfile",
  },
  {
    href: "/mcp",
    icon: Plugs,
    eyebrow: "Your agent's plugins",
    title: "Check your MCP servers",
    body: "Paste a Cursor, Claude, Windsurf or VS Code MCP config. We flag vulnerable servers, leaked API keys, unpinned npx -y installs and whole-disk file access. It runs in your browser.",
    cta: "Check MCP config",
  },
  {
    href: "/tools",
    icon: Robot,
    eyebrow: "Your tools",
    title: "Watch your AI coding stack",
    body: "Claude Code, Codex, Gemini CLI, MCP SDKs, Next.js, Supabase, LangChain and more. See what's in a CVE right now and get an email when something new lands.",
    cta: "Open Tool Watch",
  },
] as const;

export function HomeToolkit() {
  return (
    <section className="border-b border-border py-20 sm:py-24">
      <SectionContainer>
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Three ways to get cooked</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tighter sm:text-4xl">
            Your code, your agent&apos;s plugins, and the tools themselves.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Vibecoding moved the attack surface. It&apos;s not only your dependencies anymore. It&apos;s the MCP servers
            your agent launches and the agent CLIs you installed last Tuesday.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {CARDS.map(({ href, icon: Icon, eyebrow, title, body, cta }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
                <Icon className="h-5 w-5 text-primary" weight="bold" aria-hidden />
              </span>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                {cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" weight="bold" aria-hidden />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-muted/30 p-6 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium">
              <GitPullRequest className="h-4 w-4 text-primary" weight="bold" aria-hidden /> Put it in CI
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fail the build on critical CVEs or malware, upload SARIF to GitHub code scanning, and get a plain-English
              job summary on every PR.
            </p>
          </div>
          <div className="space-y-2">
            <CopyCommand command="npx iamcooked --ci --format sarif -o iamcooked.sarif" />
            <CopyCommand prompt="#" command="uses: nanaagyei/iamcooked@main" />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
