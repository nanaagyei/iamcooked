import { test, expect } from "@playwright/test";
import path from "node:path";

// Pre-accept cookies so the consent banner never overlaps controls under test.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const consent = { version: 1, necessary: true, preferences: true, analytics: false, updatedAt: new Date().toISOString() };
    document.cookie = `iamcooked_consent=${encodeURIComponent(JSON.stringify(consent))}; Path=/`;
  });
});

test.describe("public pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("incident feed loads", async ({ page }) => {
    await page.goto("/incidents");
    await expect(page.getByRole("heading", { name: /supply-chain drama/i })).toBeVisible();
  });

  test("scan page loads", async ({ page }) => {
    await page.goto("/scan");
    await expect(page.getByRole("heading", { name: /drop a lockfile/i })).toBeVisible();
  });

  test("learn hub loads", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: /security explained/i })).toBeVisible();
  });
});

test.describe("scan upload", () => {
  test("accepts a valid package-lock.json", async ({ page }) => {
    await page.goto("/scan");
    const fixture = path.join(__dirname, "fixtures", "package-lock.json");
    await page.locator('input[type="file"]').setInputFiles(fixture);
    await page.getByRole("button", { name: /scan dependencies/i }).click();
    await page.waitForURL(/\/scan\/report\//, { timeout: 60_000 });
    await expect(page.getByText(/risk score/i)).toBeVisible();
  });
});

test.describe("auth gates", () => {
  test("admin redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/signin/);
  });

  test("dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/signin/);
  });
});

test.describe("newsletter", () => {
  test("subscribe form is present on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("textbox", { name: /email address/i }).first()).toBeVisible();
  });
});
