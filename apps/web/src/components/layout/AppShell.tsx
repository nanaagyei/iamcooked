import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
}

export async function AppShell({
  children,
  title,
  description,
  breadcrumbs,
  actions,
}: AppShellProps) {
  const session = await auth();
  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main-content" className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-7 sm:px-8 lg:py-9">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
            >
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-1">
                  {i > 0 && <CaretRight className="h-3 w-3" weight="bold" aria-hidden />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {(title || description || actions) && (
            <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </header>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
