import { auth, signIn } from "@/lib/auth";
import { MarketingLayout, SectionContainer } from "@/components/layout";
import { PageBackdrop } from "@/components/layout/PageBackdrop";
import { RadarIllustration } from "@/components/ui/radar-illustration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubLogo, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <MarketingLayout>
      <div className="relative overflow-hidden">
        <PageBackdrop variant="hero" seed="signin-hero" />
        <div className="absolute inset-y-0 right-0 hidden w-[45%] [mask-image:linear-gradient(to_left,black,transparent)] lg:block">
          <RadarIllustration variant="ambient" seed="signin-radar" className="opacity-40 dark:opacity-60" />
        </div>
        <SectionContainer className="relative grid min-h-[80dvh] items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="max-w-lg">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Secure workspace
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tighter sm:text-4xl">
            Save scans, track risk, and get alerts that match your stack.
          </h1>
          <p className="mt-4 max-w-[65ch] leading-relaxed text-muted-foreground">
            Sign in with GitHub to keep scan history, manage a package watchlist,
            and receive digest emails when new incidents affect your dependencies.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" weight="bold" aria-hidden />
              Read-only GitHub profile access
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" weight="bold" aria-hidden />
              Lockfile contents are not stored
            </li>
          </ul>
        </div>
        <Card className="relative mx-auto w-full max-w-md rounded-2xl border-border bg-card/95 shadow-[var(--shadow-diffusion)] backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl tracking-tight">Sign in to iamcooked</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <Button type="submit" className="h-12 w-full" size="lg">
                <GithubLogo className="h-5 w-5" weight="bold" aria-hidden />
                Continue with GitHub
              </Button>
            </form>
            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              By continuing, you agree to our terms and privacy policy.
            </p>
          </CardContent>
        </Card>
        </SectionContainer>
      </div>
    </MarketingLayout>
  );
}
