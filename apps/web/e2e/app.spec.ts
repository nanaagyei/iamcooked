import { test, expect } from "@playwright/test";
import path from "node:path";

test.describe("public pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("incident feed loads", async ({ page }) => {
    await page.goto("/incidents");
    await expect(page.getByRole("heading", { name: /incidents affecting your stack/i })).toBeVisible();
  });

  test("scan page loads", async ({ page }) => {
    await page.goto("/scan");
    await expect(page.getByRole("heading", { name: /scan your project/i })).toBeVisible();
  });

  test("learn hub loads", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: /guides and articles/i })).toBeVisible();
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
    await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
  });
});
