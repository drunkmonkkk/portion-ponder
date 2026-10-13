import { test as base, expect } from "@playwright/test";

// In the managed cloud, Node already trusts the platform proxy CA. Route live
// browser requests through that HTTPS client without weakening TLS verification
// or installing a new trusted root in Chromium's persistent certificate store.
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    if (process.env.PLAYWRIGHT_VERIFIED_TRANSPORT === "1") {
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.route("**/*", async (route) => {
        try {
          const response = await route.fetch();
          if (response.status() >= 400)
            errors.push(`HTTP ${response.status()}: ${route.request().url()}`);
          await route.fulfill({ response });
        } catch (error) {
          errors.push(String(error));
          await route.abort();
        }
      });
    }
    await use(page);
    if (process.env.PLAYWRIGHT_VERIFIED_TRANSPORT === "1") {
      // A favicon request can start just after the final reload assertion.
      // Drain the page before removing interception so Chromium never falls
      // back to its separate certificate store during test teardown.
      await page.waitForLoadState("networkidle");
      await page.unrouteAll({ behavior: "wait" });
    }
    expect(errors, "Live HTTPS, asset, and JavaScript errors").toEqual([]);
  },
});
export { expect };
