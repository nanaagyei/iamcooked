import { prisma } from "@iamcooked/db";
import { Resend } from "resend";
import { escapeHtml } from "@iamcooked/validators";
import { OsvClient, recordSeverity, SEVERITY_RANK, type CoreEcosystem, type OsvRecord, type SeverityLevel } from "@iamcooked/core";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CHECKABLE = new Set<CoreEcosystem>(["NPM", "PYPI", "GO", "CARGO", "RUBYGEMS", "COMPOSER"]);

export interface NewAdvisory {
  ecosystem: CoreEcosystem;
  packageName: string;
  id: string;
  cve: string | null;
  summary: string;
  severity: SeverityLevel;
  malware: boolean;
  published: string;
  fixedVersions: string[];
  url: string;
}

/** Advisories for `pkg` first published within the window (ms since epoch). */
export function selectNewAdvisories(
  records: OsvRecord[],
  pkg: { ecosystem: CoreEcosystem; packageName: string },
  since: number,
): NewAdvisory[] {
  const seen = new Set<string>();
  const out: NewAdvisory[] = [];
  for (const rec of [...records].sort((a, b) => Number(b.id.startsWith("GHSA-")) - Number(a.id.startsWith("GHSA-")))) {
    if (!rec.published || new Date(rec.published).getTime() < since) continue;
    const ids = [rec.id, ...(rec.aliases ?? [])];
    if (ids.some((x) => seen.has(x))) continue;
    ids.forEach((x) => seen.add(x));
    const malware = ids.some((x) => x.startsWith("MAL-"));
    const id = ids.find((x) => x.startsWith("GHSA-")) ?? rec.id;
    const fixed = new Set<string>();
    for (const a of rec.affected ?? []) for (const r of a.ranges ?? []) for (const e of r.events) if (e.fixed) fixed.add(e.fixed);
    out.push({
      ...pkg,
      id,
      cve: ids.find((x) => x.startsWith("CVE-")) ?? null,
      summary: (rec.summary || rec.details || rec.id).replace(/\s+/g, " ").slice(0, 200),
      severity: malware ? "CRITICAL" : recordSeverity(rec).severity,
      malware,
      published: rec.published,
      fixedVersions: [...fixed],
      url: id.startsWith("GHSA-") ? `https://github.com/advisories/${id}` : `https://osv.dev/vulnerability/${id}`,
    });
  }
  return out.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
}

function alertHtml(items: NewAdvisory[], unsubscribeUrl: string | null): string {
  const rows = items
    .map((a) => {
      const sev = a.malware ? "MALWARE" : a.severity;
      const fix = a.fixedVersions.length ? `Fixed in ${a.fixedVersions.map(escapeHtml).join(", ")}.` : "No fix yet.";
      return `<li style="margin-bottom:12px"><strong>${escapeHtml(a.packageName)}</strong> <span style="color:#E5484D">${sev}</span><br>
        ${escapeHtml(a.summary)}<br>
        <span style="color:#5C646B;font-size:13px">${escapeHtml(a.cve ?? a.id)} · ${fix} <a href="${escapeHtml(a.url)}">Advisory</a></span></li>`;
    })
    .join("");
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
      <h1 style="font-size: 20px; font-weight: 600;">New advisories for tools you watch</h1>
      <p style="color: #5C646B; line-height: 1.6;">Check whether your installed version is affected:</p>
      <pre style="background:#f4f4f2;padding:10px 12px;border-radius:8px;font-size:13px">npx iamcooked doctor</pre>
      <ul style="line-height: 1.6; padding-left: 18px;">${rows}</ul>
      <p><a href="${escapeHtml(appUrl)}/tools">Open Tool Watch</a> · <a href="${escapeHtml(appUrl)}/dashboard/watchlist">Manage watchlist</a></p>
      ${unsubscribeUrl ? `<p style="font-size: 12px; color: #A8B0B8;"><a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a></p>` : ""}
    </div>`;
}

/**
 * Daily job: email each user about advisories published in the last `windowHours`
 * for packages on their watchlist (including tools added from Tool Watch).
 */
export async function sendWatchlistAdvisoryAlerts(windowHours = 26): Promise<{ sent: number; packages: number; advisories: number }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey === "re-placeholder") return { sent: 0, packages: 0, advisories: 0 };

  const watched = await prisma.watchedPackage.findMany({
    select: { packageName: true, ecosystem: true, userId: true, user: { select: { email: true } } },
  });
  const unique = new Map<string, { ecosystem: CoreEcosystem; packageName: string }>();
  for (const w of watched) {
    if (!CHECKABLE.has(w.ecosystem as CoreEcosystem)) continue;
    unique.set(`${w.ecosystem}:${w.packageName}`, { ecosystem: w.ecosystem as CoreEcosystem, packageName: w.packageName });
  }

  const osv = new OsvClient({ baseUrl: process.env["OSV_API_BASE_URL"], userAgent: "iamcooked-alerts" });
  const since = Date.now() - windowHours * 60 * 60 * 1000;
  const byPackage = new Map<string, NewAdvisory[]>();
  for (const [key, pkg] of unique) {
    try {
      const records = await osv.queryPackage(pkg.ecosystem, pkg.packageName);
      const fresh = selectNewAdvisories(records, pkg, since);
      if (fresh.length) byPackage.set(key, fresh);
    } catch (err) {
      console.error(`Advisory lookup failed for ${key}:`, err);
    }
  }
  if (byPackage.size === 0) return { sent: 0, packages: unique.size, advisories: 0 };

  const resend = new Resend(resendKey);
  const byUser = new Map<string, { email: string; items: NewAdvisory[] }>();
  for (const w of watched) {
    const items = byPackage.get(`${w.ecosystem}:${w.packageName}`);
    if (!items || !w.user?.email) continue;
    const entry = byUser.get(w.userId) ?? { email: w.user.email, items: [] };
    entry.items.push(...items);
    byUser.set(w.userId, entry);
  }

  let sent = 0;
  for (const [userId, { email, items }] of byUser) {
    const sub = await prisma.newsletterSubscription.findFirst({ where: { OR: [{ userId }, { email }] }, select: { unsubscribeToken: true } });
    const worst = items[0]!;
    try {
      await resend.emails.send({
        from: "iamcooked <alerts@iamcooked.dev>",
        to: [email],
        subject: `${worst.malware ? "Malware" : worst.severity === "CRITICAL" || worst.severity === "HIGH" ? `${worst.severity[0]}${worst.severity.slice(1).toLowerCase()} CVE` : "New advisory"} in ${worst.packageName}${items.length > 1 ? ` (+${items.length - 1} more)` : ""}`,
        html: alertHtml(items.slice(0, 10), sub ? `${appUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}` : null),
      });
      sent++;
    } catch (err) {
      console.error("Alert email failed:", err);
    }
  }
  return { sent, packages: unique.size, advisories: [...byPackage.values()].flat().length };
}
