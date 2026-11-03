import { prisma } from "@iamcooked/db";
import { Resend } from "resend";
import { escapeHtml } from "@iamcooked/validators";
import {
  generateStructured,
  digestSummaryPrompt,
  DigestSummaryOutput,
  isAiConfigured,
} from "@iamcooked/ai";
import {
  buildEcosystemSummary,
  filterIncidentsByInterests,
  filterIncidentsForPackages,
  normalizeInterests,
  pickBeginnerLesson,
  type DigestIncident,
} from "./digest-helpers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function incidentHighlightsHtml(
  incidents: Array<{ title: string; beginnerTldr?: string | null; highlight?: string }>,
): string {
  if (incidents.length === 0) {
    return "<li>No new published incidents this week for your interests.</li>";
  }

  return incidents
    .map(
      (incident) =>
        `<li><strong>${escapeHtml(incident.title)}</strong> — ${escapeHtml(
          incident.highlight ?? incident.beginnerTldr?.slice(0, 120) ?? "",
        )}</li>`,
    )
    .join("");
}

async function buildDigestContent(incidents: DigestIncident[]) {
  const fallback = {
    subjectLine: `iamcooked weekly brief — ${incidents.length} incident${incidents.length === 1 ? "" : "s"} this week`,
    intro: "Top incidents from the past 7 days:",
    highlights: incidents.map((i) => ({
      title: i.title,
      highlight: i.beginnerTldr?.slice(0, 120) ?? "",
    })),
  };

  if (!isAiConfigured() || incidents.length === 0) {
    return fallback;
  }

  try {
    const result = await generateStructured(
      digestSummaryPrompt,
      `Weekly incidents:\n${incidents.map((i) => `- ${i.title}: ${i.beginnerTldr ?? ""}`).join("\n")}`,
      DigestSummaryOutput,
    );
    return {
      subjectLine: result.data.subject_line || fallback.subjectLine,
      intro: result.data.intro || fallback.intro,
      highlights: result.data.incident_highlights.length
        ? result.data.incident_highlights
        : fallback.highlights,
    };
  } catch {
    return fallback;
  }
}

async function getSubscriberPackageNames(userId: string | null, email: string): Promise<Set<string>> {
  const names = new Set<string>();

  if (userId) {
    const watched = await prisma.watchedPackage.findMany({
      where: { userId },
      select: { packageName: true },
    });
    for (const w of watched) {
      names.add(w.packageName.toLowerCase());
    }

    const scanFindings = await prisma.scanFinding.findMany({
      where: { scanReport: { userId } },
      select: { packageName: true },
      take: 500,
    });
    for (const f of scanFindings) {
      names.add(f.packageName.toLowerCase());
    }
  }

  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { email },
    select: { userId: true },
  });

  if (subscription?.userId && subscription.userId !== userId) {
    const watched = await prisma.watchedPackage.findMany({
      where: { userId: subscription.userId },
      select: { packageName: true },
    });
    for (const w of watched) {
      names.add(w.packageName.toLowerCase());
    }
  }

  return names;
}

function mapIncident(incident: {
  id: string;
  title: string;
  slug: string;
  severity: string;
  ecosystem: string | null;
  beginnerTldr: string | null;
  packages: Array<{ packageName: string; ecosystem: string }>;
}): DigestIncident {
  return {
    id: incident.id,
    title: incident.title,
    slug: incident.slug,
    severity: incident.severity,
    ecosystem: incident.ecosystem,
    beginnerTldr: incident.beginnerTldr,
    packages: incident.packages,
  };
}

export async function sendWeeklyDigest() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey === "re-placeholder") {
    console.log("RESEND_API_KEY not configured, skipping digest");
    return { sent: 0 };
  }

  const resend = new Resend(resendKey);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const allIncidents = await prisma.incident.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: weekAgo } },
    orderBy: { publishedAt: "desc" },
    include: { packages: true },
  });

  const mapped = allIncidents.map(mapIncident);
  const weekIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const lesson = pickBeginnerLesson(weekIndex);

  const subscribers = await prisma.newsletterSubscription.findMany({
    where: { frequency: { in: ["WEEKLY", "DAILY"] } },
  });

  let sent = 0;
  for (const sub of subscribers) {
    const interests = normalizeInterests(sub.interests);
    const relevant = filterIncidentsByInterests(mapped, interests).slice(0, 3);
    const content = await buildDigestContent(relevant);
    const ecosystemSummary = buildEcosystemSummary(
      filterIncidentsByInterests(mapped, interests),
    );

    const highlightsForHtml = relevant.map((incident, idx) => ({
      title: incident.title,
      beginnerTldr: incident.beginnerTldr,
      highlight: content.highlights[idx]?.highlight,
    }));

    await resend.emails.send({
      from: "iamcooked <newsletter@iamcooked.dev>",
      to: [sub.email],
      subject: content.subjectLine,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px;">
          <h1 style="font-size: 20px; font-weight: 600;">Your weekly security brief</h1>
          <p style="color: #5C646B; line-height: 1.6;">${escapeHtml(content.intro)}</p>
          <p style="color: #5C646B; line-height: 1.6; font-size: 14px;">${escapeHtml(ecosystemSummary)}</p>
          <h2 style="font-size: 16px; font-weight: 600; margin-top: 24px;">Top incidents</h2>
          <ul style="line-height: 1.8;">${incidentHighlightsHtml(highlightsForHtml)}</ul>
          <h2 style="font-size: 16px; font-weight: 600; margin-top: 24px;">Beginner lesson</h2>
          <p style="color: #5C646B; line-height: 1.6;">
            <strong>${escapeHtml(lesson.title)}</strong> — ${escapeHtml(lesson.summary)}
            <a href="${escapeHtml(appUrl)}${escapeHtml(lesson.url)}"> Read more</a>
          </p>
          <p style="margin-top: 24px;"><a href="${escapeHtml(appUrl)}/scan">Does this affect me? Scan your project</a></p>
          <hr style="border: none; border-top: 1px solid #D9DED8; margin: 24px 0;" />
          <p style="font-size: 12px; color: #A8B0B8;">
            <a href="${escapeHtml(appUrl)}/api/newsletter/unsubscribe?token=${escapeHtml(sub.unsubscribeToken)}">Unsubscribe</a>
          </p>
        </div>
      `,
    });
    sent++;
  }

  return { sent };
}

export async function sendCriticalAlerts() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey === "re-placeholder") return { sent: 0 };

  const resend = new Resend(resendKey);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const criticalIncidents = await prisma.incident.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { gte: dayAgo },
      severity: { in: ["CRITICAL", "HIGH"] },
      confidence: { in: ["CONFIRMED", "LIKELY"] },
    },
    include: { packages: true },
  });

  if (criticalIncidents.length === 0) return { sent: 0 };

  const mapped = criticalIncidents.map(mapIncident);

  const subscribers = await prisma.newsletterSubscription.findMany({
    where: { frequency: { in: ["DAILY", "WEEKLY", "CRITICAL_ONLY"] } },
  });

  let sent = 0;
  for (const sub of subscribers) {
    const interests = normalizeInterests(sub.interests);
    if (!interests.includes("npm")) continue;

    const packageNames = await getSubscriberPackageNames(sub.userId, sub.email);
    const relevant = filterIncidentsForPackages(mapped, packageNames).slice(0, 3);

    if (relevant.length === 0) continue;

    const list = relevant
      .map(
        (incident) =>
          `<li><strong>${escapeHtml(incident.title)}</strong> — ${escapeHtml(incident.beginnerTldr?.slice(0, 100) ?? "")}</li>`,
      )
      .join("");

    await resend.emails.send({
      from: "iamcooked <alerts@iamcooked.dev>",
      to: [sub.email],
      subject: `Critical alert: ${relevant[0]?.title ?? "Security incident"}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #E5484D;">Critical security alert</h1>
          <p style="color: #5C646B; line-height: 1.6;">These incidents match packages in your watchlist or recent scans.</p>
          <ul style="line-height: 1.8;">${list}</ul>
          <p><a href="${escapeHtml(appUrl)}/incidents">View incidents</a> · <a href="${escapeHtml(appUrl)}/scan">Scan your project</a></p>
          <p style="font-size: 12px; color: #A8B0B8;">
            <a href="${escapeHtml(appUrl)}/api/newsletter/unsubscribe?token=${escapeHtml(sub.unsubscribeToken)}">Unsubscribe</a>
          </p>
        </div>
      `,
    });
    sent++;
  }

  return { sent };
}
