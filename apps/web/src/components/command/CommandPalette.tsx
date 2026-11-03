"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  House,
  Newspaper,
  Upload,
  Gauge,
  Gear,
  BookOpen,
  Sparkle,
  ClockCounterClockwise,
  Binoculars,
} from "@phosphor-icons/react";
import { useCommand } from "./command-context";

const navigation = [
  { href: "/", label: "Home", icon: House },
  { href: "/incidents", label: "Incidents", icon: Newspaper },
  { href: "/scan", label: "Scan project", icon: Upload },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/dashboard/scans", label: "Scan history", icon: ClockCounterClockwise },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Binoculars },
  { href: "/settings", label: "Settings", icon: Gear },
  { href: "/learn", label: "Learn", icon: BookOpen },
];

export function CommandPalette() {
  const router = useRouter();
  const { open, setOpen, openCopilot } = useCommand();

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden border-2 border-border bg-popover p-0 text-popover-foreground shadow-2xl isolate sm:max-w-lg [&>button]:hidden">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command className="bg-popover [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b border-border bg-popover px-3">
            <Command.Input
              placeholder="Search pages and actions..."
              className="flex h-12 w-full bg-popover py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto bg-popover p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigate">
              {navigation.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.label}
                  onSelect={() => run(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted aria-selected:text-foreground"
                >
                  <item.icon className="h-4 w-4 shrink-0" weight="bold" aria-hidden />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Actions">
              <Command.Item
                value="Ask security copilot"
                onSelect={openCopilot}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-muted aria-selected:text-foreground"
              >
                <Sparkle className="h-4 w-4 shrink-0 text-primary" weight="bold" aria-hidden />
                Ask security copilot
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
