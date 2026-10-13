import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { levels } from "../src/data/levels";
import { SAVE_KEY, LEGACY_KEY } from "../src/utils/storage";
async function boot(page: Page) {
  await page.goto("/");
}
async function exchange(page: Page, a: number, b: number) {
  await page
    .getByRole("button", { name: new RegExp(`^Select bottle ${a + 1},`) })
    .click();
  await page
    .getByRole("button", { name: new RegExp(`^Select bottle ${b + 1},`) })
    .click();
  await expect(page.locator(".live-progress")).toHaveAttribute(
    "aria-busy",
    "false",
  );
}
async function solve(page: Page, n: number) {
  const order = [...levels[n - 1].initial],
    target = levels[n - 1].solution;
  for (let i = 0; i < order.length; i++)
    if (order[i] !== target[i]) {
      const j = order.indexOf(target[i]);
      await exchange(page, i, j);
      [order[i], order[j]] = [order[j], order[i]];
    }
}
async function finish(page: Page) {
  await expect(
    page.getByRole("heading", { name: "Perfectly placed!" }),
  ).toBeVisible();
}

test("automatic totals increase, decrease and stay unchanged without revealing positions", async ({
  page,
}) => {
  await boot(page);
  await expect(
    page.getByRole("button", { name: /check|submit|finish|hint/i }),
  ).toHaveCount(0);
  await expect(page.getByTestId("correct-count")).toHaveText("0 / 3");
  await expect(
    page.getByRole("progressbar", { name: "Bottles in place" }),
  ).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator(".slot-label")).toHaveText(["01", "02", "03"]);
  const first = page.getByRole("button", { name: /^Select bottle 1,/ });
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("aria-pressed", "false");
  // Extra synchronous clicks cannot queue or count a second swap.
  await first.click();
  await page
    .getByRole("button", { name: /^Select bottle 2,/ })
    .evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
  await expect(page.getByTestId("swaps")).toHaveText("01");
  await expect(page.getByTestId("correct-count")).toHaveText("1 / 3");
  await expect(page.locator(".progress-gain")).toHaveText("+1 CORRECT");
  await exchange(page, 0, 1);
  await expect(page.getByTestId("correct-count")).toHaveText("0 / 3");
  await expect(page.getByTestId("swaps")).toHaveText("02");
  await exchange(page, 0, 1);
  await expect(
    page.locator(
      ".potion-slot [data-correct], .potion-slot .correct, .potion-slot .incorrect",
    ),
  ).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "BOTTLE CHECKER.exe" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("list", { name: "Previous swaps" }).locator(":scope > li"),
  ).toHaveCount(3);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page
    .getByRole("button", { name: "Yes, reset shelf", exact: true })
    .click();
  await expect(page.getByTestId("swaps")).toHaveText("00");
  await expect(page.getByTestId("correct-count")).toHaveText("0 / 3");
  await solve(page, 1);
  await finish(page);
  await expect(page.getByTestId("swaps")).toHaveText(
    String(levels[0].target).padStart(2, "0"),
  );
  await page.getByRole("button", { name: "Next level", exact: true }).click();
  await expect(page.getByTestId("correct-count")).toHaveText("0 / 4");
  const order = levels[1].initial;
  let pair: number[] = [];
  for (let a = 0; a < 4; a++)
    for (let b = a + 1; b < 4; b++) {
      const next = [...order];
      [next[a], next[b]] = [next[b], next[a]];
      if (next.every((id, i) => id !== levels[1].solution[i])) pair = [a, b];
    }
  expect(pair).toHaveLength(2);
  await exchange(page, pair[0], pair[1]);
  await expect(page.getByTestId("correct-count")).toHaveText("0 / 4");
  await expect(page.locator(".progress-gain")).toHaveText("");
});

test("all 15 hidden-order shelves are playable and persist best results", async ({
  page,
}) => {
  test.setTimeout(240000);
  await boot(page);
  for (let n = 1; n <= 15; n++) {
    await solve(page, n);
    await finish(page);
    const win = page.getByRole("dialog", { name: "A little celebration.exe" });
    await expect(win.getByLabel("3 stars", { exact: true })).toBeVisible();
    if (n < 15)
      await win
        .getByRole("button", { name: "Next level", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Visit level archive", exact: true })
    .click();
  await expect(page.getByText("15 / 15 shelves sorted")).toBeVisible();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(Object.values(saved.stars)).toEqual(Array(15).fill(3));
  expect(Object.values(saved.bestSwaps)).toEqual(levels.map((l) => l.target));
  await page.reload();
  await page
    .getByRole("button", { name: "Level Archive", exact: true })
    .click();
  await expect(page.getByText("15 / 15 shelves sorted")).toBeVisible();
});

test("automatic completion locks swapping and replays preserve the best stars and swaps", async ({
  page,
}) => {
  await boot(page);
  await solve(page, 1);
  await finish(page);
  await expect(
    page
      .getByRole("dialog", { name: "A little celebration.exe" })
      .getByLabel("3 stars"),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Close A little celebration.exe",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: /^Select bottle 1,/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page
    .getByRole("button", { name: "Yes, reset shelf", exact: true })
    .click();
  await exchange(page, 0, 1);
  await exchange(page, 0, 1);
  await solve(page, 1);
  await finish(page);
  await expect(
    page
      .getByRole("dialog", { name: "A little celebration.exe" })
      .getByLabel("2 stars"),
  ).toBeVisible();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    SAVE_KEY,
  );
  expect(saved.stars[1]).toBe(3);
  expect(saved.bestSwaps[1]).toBe(levels[0].target);
});

test("bottle labels, desktop menus, stacking, minimize and mobile resize remain functional", async ({
  page,
}) => {
  await boot(page);
  await page
    .getByRole("button", { name: /^Read .* label$/ })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "Bottle Label.exe" }),
  ).not.toContainText("Unknown");
  await page.getByRole("button", { name: "Back to swapping" }).click();
  await page.getByRole("button", { name: "Bottles", exact: true }).click();
  await page.getByRole("button", { name: "Open Bottlepedia" }).click();
  await expect(page.locator(".pedia-card")).toHaveCount(10);
  await page.getByRole("button", { name: "Minimize Bottlepedia.exe" }).click();
  await expect(page.getByText("Meet the bottle bunch.")).toBeHidden();
  await page
    .getByRole("button", { name: "Bottlepedia.exe", exact: true })
    .click();
  await expect(page.getByText("Meet the bottle bunch.")).toBeVisible();
  await page.getByRole("button", { name: "Maximize Bottlepedia.exe" }).click();
  await expect(
    page.getByRole("dialog", { name: "Bottlepedia.exe" }),
  ).toHaveClass(/maximized/);
  await page.getByRole("button", { name: "Close Bottlepedia.exe" }).click();
  const title = page.locator(".game-window .window-title");
  const before = await title.boundingBox();
  await title.hover({ position: { x: 200, y: 15 } });
  await page.mouse.down();
  await page.mouse.move(before!.x + 240, before!.y + 45, { steps: 5 });
  await page.mouse.up();
  expect((await title.boundingBox())!.x).toBeGreaterThan(before!.x + 20);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => (await title.boundingBox())!.x)
    .toBeGreaterThanOrEqual(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("mobile has readable 3–9 bottle shelves and supports touch swapping", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(120000);
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    proxy: process.env.PLAYWRIGHT_PROXY_SERVER
      ? { server: process.env.PLAYWRIGHT_PROXY_SERVER }
      : undefined,
  });
  const page = await context.newPage();
  if (process.env.PLAYWRIGHT_VERIFIED_TRANSPORT === "1")
    await page.route("**/*", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response });
    });
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          stars: Object.fromEntries(
            Array.from({ length: 14 }, (_, i) => [i + 1, 3]),
          ),
          bestSwaps: {},
          music: false,
          sound: false,
          volume: 0.35,
          currentLevel: 15,
          tutorialDone: true,
        }),
      );
    },
    { key: SAVE_KEY },
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /^Select bottle/ }),
  ).toHaveCount(9);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const first = page.getByRole("button", { name: /^Select bottle 1,/ });
  await first.tap();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await first.tap();
  await solve(page, 15);
  await finish(page);
  await page
    .getByRole("button", { name: "Visit level archive", exact: true })
    .click();
  await expect(page.getByText("15 / 15 shelves sorted")).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.unrouteAll({ behavior: "wait" });
  await context.close();
});

test("old saves are kept safely while new progression and preferences migrate", async ({
  page,
}) => {
  const legacy = {
    stars: { 1: 3, 2: 2, 15: 3 },
    discovered: ["moondew"],
    sound: false,
    reducedMotion: true,
    currentLevel: 15,
  };
  await page.addInitScript(
    ({ key, data }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(data));
    },
    { key: LEGACY_KEY, data: legacy },
  );
  await boot(page);
  await expect(
    page.getByRole("heading", { name: "New fizz. Fresh shelves." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Let’s shuffle" }).click();
  await expect(
    page.getByRole("button", { name: /^Select bottle/ }),
  ).toHaveCount(3);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      LEGACY_KEY,
    ),
  ).toEqual(legacy);
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: "Sound effects", exact: true }),
  ).toHaveAttribute("aria-checked", "false");
  await expect(
    page.getByRole("switch", { name: "Less motion" }),
  ).toHaveAttribute("aria-checked", "true");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "New fizz. Fresh shelves." }),
  ).toHaveCount(0);
});

test("unavailable storage does not prevent completing a shelf", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Unavailable");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Unavailable");
    };
  });
  await boot(page);
  await expect(page.getByRole("status")).toContainText(
    "Browser storage is unavailable",
  );
  await solve(page, 1);
  await finish(page);
  await expect(
    page.getByText("Progress saved for this session only."),
  ).toBeVisible();
});

test("restarting during an animation cancels its pending progress and completion", async ({
  page,
}) => {
  await boot(page);
  await page.getByRole("button", { name: /^Select bottle 1,/ }).click();
  await page.getByRole("button", { name: /^Select bottle 2,/ }).click();
  // Trigger the existing File menu action within the animation frame.
  await page
    .getByRole("button", { name: "File", exact: true })
    .evaluate((b: HTMLButtonElement) => b.click());
  await page
    .getByRole("button", { name: "Restart shelf", exact: true })
    .evaluate((b: HTMLButtonElement) => b.click());
  await page
    .getByRole("button", { name: "Yes, reset shelf", exact: true })
    .click();
  await page.waitForTimeout(450);
  await expect(page.getByTestId("swaps")).toHaveText("00");
  await expect(page.getByTestId("correct-count")).toHaveText("0 / 3");
  await expect(
    page.getByRole("heading", { name: "Perfectly placed!" }),
  ).toHaveCount(0);
  await solve(page, 1);
  await finish(page);
});
