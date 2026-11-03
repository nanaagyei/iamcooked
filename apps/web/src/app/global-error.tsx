"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 text-center text-foreground">
        <h1 className="text-2xl font-semibold">Application error</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          iamcooked hit an unexpected error. You can retry or return home.
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </body>
    </html>
  );
}
