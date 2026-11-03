"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeverityBadge } from "@/components/badges";
import { Binoculars, Trash } from "@phosphor-icons/react";

const ECOSYSTEMS: Array<[string, string]> = [
  ["NPM", "npm"],
  ["PYPI", "PyPI"],
  ["GO", "Go"],
  ["CARGO", "crates.io"],
  ["RUBYGEMS", "RubyGems"],
  ["COMPOSER", "Packagist"],
];

interface WatchItem {
  id: string;
  packageName: string;
  ecosystem: string;
}

interface RelatedIncident {
  slug: string;
  title: string;
  severity: string;
}

export function WatchlistClient() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [related, setRelated] = useState<RelatedIncident[]>([]);
  const [packageName, setPackageName] = useState("");
  const [ecosystem, setEcosystem] = useState("NPM");
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setRelated(data.relatedIncidents ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addPackage = async () => {
    if (!packageName.trim()) return;
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageName: packageName.trim(), ecosystem }),
    });
    if (res.ok) {
      toast.success("Package added to watchlist");
      setPackageName("");
      load();
    } else {
      toast.error("Could not add package");
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Removed from watchlist");
      load();
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading watchlist...</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Watched packages</h2>
        <div className="flex gap-2">
          <label htmlFor="watch-eco" className="sr-only">Ecosystem</label>
          <select
            id="watch-eco"
            value={ecosystem}
            onChange={(e) => setEcosystem(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-2 text-sm"
          >
            {ECOSYSTEMS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Input
            aria-label="Package name"
            placeholder="e.g. lodash"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="font-mono"
          />
          <Button onClick={addPackage}>Add</Button>
        </div>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Binoculars className="mx-auto h-8 w-8 text-muted-foreground" weight="bold" />
            <p className="mt-3 text-sm text-muted-foreground">
              Add packages you want to monitor. You&apos;ll get an email when a new CVE or malicious release is
              published. Or add your AI tools from{" "}
              <Link href="/tools" className="underline underline-offset-4">Tool Watch</Link>.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3"
              >
                <span className="font-mono text-sm">
                  {item.packageName}
                  {item.ecosystem && item.ecosystem !== "NPM" && (
                    <span className="ml-2 text-xs text-muted-foreground">{item.ecosystem}</span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.packageName}`}
                >
                  <Trash className="h-4 w-4" weight="bold" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Related open incidents</h2>
        {related.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published incidents match your watchlist yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {related.map((inc) => (
              <li
                key={inc.slug}
                className="rounded-xl border border-border/60 bg-card p-4"
              >
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={inc.severity as "HIGH"} />
                  <Link
                    href={`/incidents/${inc.slug}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {inc.title}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
