import { test, expect } from "./fixtures";
import { levels } from "../src/data/levels";
declare global {
  interface Window {
    __audio: {
      contexts: AudioContext[];
      sources: AudioBufferSourceNode[];
      gains: GainNode[];
      effects: OscillatorNode[];
      starts: number;
    };
  }
}

test("real music starts on interaction, loops once, controls volume and effects, and pauses off-tab", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__audio = {
      contexts: [],
      sources: [],
      gains: [],
      effects: [],
      starts: 0,
    };
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      constructor(options?: AudioContextOptions) {
        super(options);
        window.__audio.contexts.push(this);
      }
      createBufferSource() {
        const source = super.createBufferSource();
        window.__audio.sources.push(source);
        const start = source.start.bind(source);
        source.start = (...args) => {
          window.__audio.starts++;
          start(...args);
        };
        return source;
      }
      createGain() {
        const gain = super.createGain();
        window.__audio.gains.push(gain);
        return gain;
      }
      createOscillator() {
        const oscillator = super.createOscillator();
        window.__audio.effects.push(oscillator);
        return oscillator;
      }
    };
  });
  await page.goto("/");
  expect(await page.evaluate(() => window.__audio.contexts.length)).toBe(0);
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await expect(page.getByTestId("music-status")).toContainText("Now playing");
  expect(await page.evaluate(() => window.__audio.starts)).toBe(1);
  expect(await page.evaluate(() => window.__audio.sources[0].loop)).toBe(true);
  expect(
    await page.evaluate(() => window.__audio.sources[0].buffer!.duration),
  ).toBeGreaterThan(20);
  expect(
    await page.evaluate(() =>
      window.__audio.sources[0]
        .buffer!.getChannelData(0)
        .some((v) => Math.abs(v) > 0.001),
    ),
  ).toBe(true);
  await page.locator("#music-volume").focus();
  await page.keyboard.press("End");
  await expect(page.locator(".volume-setting output")).toHaveText("100%");
  await expect
    .poll(() => page.evaluate(() => window.__audio.gains[0].gain.value))
    .toBeGreaterThan(0.6);
  await page.keyboard.press("Home");
  await expect(page.locator(".volume-setting output")).toHaveText("0%");
  await expect
    .poll(() => page.evaluate(() => window.__audio.gains[0].gain.value))
    .toBeLessThan(0.001);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".volume-setting output")).toHaveText("1%");
  await page.getByRole("button", { name: "Music off", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: "Background music" }),
  ).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "Music on", exact: true }).click();
  await expect(page.getByTestId("music-status")).toContainText("Now playing");
  expect(await page.evaluate(() => window.__audio.starts)).toBe(1);
  await page
    .getByRole("switch", { name: "Sound effects", exact: true })
    .click();
  await page.getByRole("button", { name: "Close Preferences.exe" }).click();
  const effects = await page.evaluate(() => window.__audio.effects.length);
  await page.getByRole("button", { name: /^Select bottle 1,/ }).click();
  expect(await page.evaluate(() => window.__audio.effects.length)).toBe(
    effects,
  );
  await page.getByRole("button", { name: /^Select bottle 1,/ }).click();
  await page
    .getByRole("button", { name: "Sound effects on", exact: true })
    .click();
  await page.getByRole("button", { name: /^Select bottle 1,/ }).click();
  await expect
    .poll(() => page.evaluate(() => window.__audio.effects.length))
    .toBeGreaterThan(effects);
  await page.getByRole("button", { name: /^Select bottle 2,/ }).click();
  await expect(page.locator(".live-progress")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  expect(await page.evaluate(() => window.__audio.starts)).toBe(1);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page
    .getByRole("button", { name: "Yes, reset shelf", exact: true })
    .click();
  const order = [...levels[0].initial];
  for (let i = 0; i < order.length; i++)
    if (order[i] !== levels[0].solution[i]) {
      const j = order.indexOf(levels[0].solution[i]);
      await page
        .getByRole("button", { name: new RegExp(`^Select bottle ${i + 1},`) })
        .click();
      await page
        .getByRole("button", { name: new RegExp(`^Select bottle ${j + 1},`) })
        .click();
      await expect(page.locator(".live-progress")).toHaveAttribute(
        "aria-busy",
        "false",
      );
      [order[i], order[j]] = [order[j], order[i]];
    }
  await page.getByRole("button", { name: "Next level", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /^Select bottle/ }),
  ).toHaveCount(4);
  expect(await page.evaluate(() => window.__audio.starts)).toBe(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => page.evaluate(() => window.__audio.contexts[0].state))
    .toBe("suspended");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => page.evaluate(() => window.__audio.contexts[0].state))
    .toBe("running");
  expect(await page.evaluate(() => window.__audio.starts)).toBe(1);
  await page.getByRole("button", { name: "Music off", exact: true }).click();
  await page
    .getByRole("button", { name: "Sound effects off", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await expect(
    page.getByRole("switch", { name: "Background music" }),
  ).toHaveAttribute("aria-checked", "false");
  await expect(
    page.getByRole("switch", { name: "Sound effects", exact: true }),
  ).toHaveAttribute("aria-checked", "false");
  await expect(page.locator("#music-volume")).toHaveValue("1");
  expect(await page.evaluate(() => window.__audio.starts)).toBe(0);
});
