import Link from "next/link";
import Image from "next/image";
import type { LearnArticle } from "@/lib/learn-content";
import { learnCategoryLabels, learnCategoryImages } from "@/lib/learn-content";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

interface LearnContentCardProps {
  article: LearnArticle;
  layout?: "featured" | "default" | "compact";
}

export function LearnContentCard({
  article,
  layout = "default",
}: LearnContentCardProps) {
  const categoryLabel = learnCategoryLabels[article.category];
  const kindLabel = article.kind === "guide" ? "Guide" : "Article";
  const cover = learnCategoryImages[article.category];

  if (layout === "featured") {
    return (
      <Link
        href={`/learn/${article.slug}`}
        className="group grid overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/20 lg:grid-cols-[1.1fr_1fr]"
      >
        <div className="relative min-h-[240px] overflow-hidden lg:min-h-[360px]">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent lg:bg-gradient-to-r" />
        </div>
        <div className="flex flex-col justify-center p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
              Featured {kindLabel}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {categoryLabel}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {article.title}
          </h2>
          <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
          <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
            Read {article.readTime}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              weight="bold"
              aria-hidden
            />
          </p>
        </div>
      </Link>
    );
  }

  if (layout === "compact") {
    return (
      <Link
        href={`/learn/${article.slug}`}
        className="group flex gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
          <Image src={cover} alt="" fill sizes="112px" className="object-cover" />
        </div>
        <div className="min-w-0 py-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {kindLabel} · {article.readTime}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold tracking-tight group-hover:text-primary">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/learn/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/20"
    >
      <div className="relative h-52 w-full shrink-0 overflow-hidden">
        <Image
          src={cover}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {kindLabel}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {categoryLabel}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
        <p className="mt-auto pt-4 font-mono text-xs text-muted-foreground">{article.readTime}</p>
      </div>
    </Link>
  );
}
