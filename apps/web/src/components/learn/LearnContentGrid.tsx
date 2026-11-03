"use client";

import { useMemo, useState } from "react";
import type { LearnArticle, LearnContentKind } from "@/lib/learn-content";
import { LearnContentCard } from "@/components/learn/LearnContentCard";
import { Button } from "@/components/ui/button";

type FilterValue = "all" | LearnContentKind;

interface LearnContentGridProps {
  articles: LearnArticle[];
  featuredSlug?: string;
}

export function LearnContentGrid({ articles, featuredSlug }: LearnContentGridProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    const list = featuredSlug
      ? articles.filter((a) => a.slug !== featuredSlug)
      : articles;
    if (filter === "all") return list;
    return list.filter((a) => a.kind === filter);
  }, [articles, featuredSlug, filter]);

  const guides = filtered.filter((a) => a.kind === "guide");
  const posts = filtered.filter((a) => a.kind === "post");

  return (
    <div className="space-y-14">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: "all", label: "All" },
            { value: "guide", label: "Guides" },
            { value: "post", label: "Articles" },
          ] as const
        ).map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={filter === option.value ? "contrast" : "outline"}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {filter !== "post" && guides.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold tracking-tight">Guides</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Step-by-step explainers for npm security concepts and iamcooked workflows.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {guides.map((article) => (
              <LearnContentCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {filter !== "guide" && posts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold tracking-tight">Articles</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Shorter reads on industry shifts, builder habits, and supply-chain news context.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {posts.map((article) => (
              <LearnContentCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No content in this category yet.</p>
      )}
    </div>
  );
}
