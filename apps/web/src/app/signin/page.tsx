import Link from "next/link";
import { redirect } from "next/navigation";
import { GithubLogo, ShieldCheck, BellRinging, ClockCounterClockwise, Binoculars } from "@phosphor-icons/react/dist/ssr";
import { auth, signIn } from "@/lib/auth";
import { MarketingLayout, SectionContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { GlowOrbs, GridBackground, Parallax, Reveal, SplitText, BorderBeam, Stagger, StaggerItem } from "@/components/motion";

const PERKS = [
  { icon: ClockCounterClockwise, text: "Keep every scan and compare over time" },
  { icon: Binoculars, text: "Watch packages and AI tools you care about" },
  { icon: BellRinging, text: "Get an email the day a new CVE lands" },
  { icon: ShieldCheck, text: "Read-only profile access. Lockfiles are never stored" },
];

export const metadata = { title: "Sign in" };

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <MarketingLayout overlap>
      <div className="relative isolate overflow-hidden">
        <Parallax speed={30} className="absolute inset-0 -z-10">
          <GridBackground />
        </Parallax>
        <GlowOrbs className="-z-10" />
        <SectionContainer className="grid min-h-[100dvh] items-center gap-14 pb-20 pt-32 lg:grid-cols-[1.1fr_1fr]">
          <div className="max-w-lg">
            <Reveal blur={false} distance={10}>
              <p className="font-mono text-xs uppercase tracking-widest text-primary">Your workspace</p>
            </Reveal>
            <SplitText text="Save scans, watch your stack, and hear about it first." highlight={[6, 7]} className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl" />
            <Stagger as="ul" className="mt-10 space-y-4">
              {PERKS.map(({ icon: Icon, text }) => (
                <StaggerItem as="li" key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
                    <Icon className="h-4 w-4 text-primary" weight="duotone" aria-hidden />
                  </span>
                  {text}
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.25} direction="left">
            <div className="relative mx-auto w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 shadow-[0_40px_120px_-40px_rgba(249,116,59,0.4)] backdrop-blur-xl">
              <BorderBeam duration={8} />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-400 text-lg font-bold text-primary-foreground shadow-lg">
                ic
              </div>
              <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight">Sign in to iamcooked</h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">Free forever. One click with GitHub.</p>
              <form
                className="mt-8"
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/dashboard" });
                }}
              >
                <Button type="submit" className="h-12 w-full text-base" size="lg">
                  <GithubLogo className="h-5 w-5" weight="bold" aria-hidden />
                  Continue with GitHub
                </Button>
              </form>
              <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                By continuing you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </SectionContainer>
      </div>
    </MarketingLayout>
  );
}
