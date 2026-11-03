"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { Toaster } from "./toaster";
import { CommandProvider } from "@/components/command/command-context";
import { CommandPalette } from "@/components/command/CommandPalette";
import { SecurityCopilot } from "@/components/copilot/SecurityCopilot";
import { ScanClaimOnAuth } from "@/components/scan/ScanClaimOnAuth";
import { CookieConsent } from "@/components/consent/CookieConsent";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <CommandProvider>
            {children}
            <CommandPalette />
            <SecurityCopilot />
            <ScanClaimOnAuth />
            <Toaster />
            <CookieConsent />
          </CommandProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
