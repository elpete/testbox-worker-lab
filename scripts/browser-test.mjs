import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.DEMO_URL || "http://127.0.0.1:8642";
await mkdir("results/browser", { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  const upstreamTooltipMessages = [];
  page.on("pageerror", (e) => {
    if (e.message === "Please use show on visible elements")
      upstreamTooltipMessages.push({ message: e.message, source: "pageerror" });
    else errors.push(e.message);
  });
  page.on("console", (m) => {
    if (m.type() === "error") {
      if (m.text() === "Please use show on visible elements")
        upstreamTooltipMessages.push({
          message: m.text(),
          location: m.location(),
        });
      else errors.push(m.text());
    }
  });
  await page.goto(base);
  assert.equal(await page.title(), "Worker Lab · Parcel Dispatch");
  assert.match(await page.locator("h1").innerText(), /One workload/);
  await page.getByRole("button", { name: "Run comparison" }).click();
  await page.waitForFunction(
    () => document.querySelector("#status").textContent.startsWith("Complete."),
    {},
    { timeout: 120000 },
  );
  assert.equal(await page.locator("#serial-pass").innerText(), "32/32");
  assert.equal(await page.locator("#parallel-pass").innerText(), "32/32");
  assert.equal(await page.locator(".worker").count(), 4);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON" }).click();
  const download = await downloadPromise;
  await download.saveAs("results/browser/comparison.json");
  await page.screenshot({
    path: "results/browser/desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({ path: "results/browser/mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/tests/runner.parallel.bxm");
  assert.equal(await page.title(), "TestBox Run IDE");
  await page.waitForFunction(() =>
    document.body.innerText.includes("32 specs"),
  );
  await page.locator("#workerCount").fill("2");
  await page
    .locator('button[data-bs-title="Run All (Ctrl/Cmd + Enter)"]')
    .click();
  await page.waitForFunction(
    () => {
      const x = Alpine.$data(document.querySelector("[x-data]"));
      return !x.isRunning && x.metaGlobalStats.totalPass === 32;
    },
    {},
    { timeout: 120000 },
  );
  const run = await page.evaluate(() => {
    const x = Alpine.$data(document.querySelector("[x-data]"));
    return { stats: x.metaGlobalStats, progress: x.workerProgress };
  });
  assert.equal(run.stats.totalFail, 0);
  assert.equal(run.stats.totalError, 0);
  assert.equal(run.progress.workers.length, 2);
  assert.ok(run.progress.workers.every((w) => w.state === "completed"));
  await page.screenshot({ path: "results/browser/run.png", fullPage: true });
  // Exercise native cancellation while child JVMs are starting.
  await page
    .locator('button[data-bs-title="Run All (Ctrl/Cmd + Enter)"]')
    .click();
  await page.waitForFunction(
    () => Alpine.$data(document.querySelector("[x-data]")).isRunning,
  );
  await page.locator('button[aria-label="Stop tests"]:visible').first().click();
  await page.waitForFunction(
    () => !Alpine.$data(document.querySelector("[x-data]")).isRunning,
    {},
    { timeout: 60000 },
  );
  const cancelled = await page.evaluate(() => {
    const x = Alpine.$data(document.querySelector("[x-data]"));
    return x.workerProgress;
  });
  assert.ok(
    cancelled.cancelled ||
      JSON.stringify(cancelled).toLowerCase().includes("cancel"),
  );
  assert.deepEqual(errors, []);
  await writeFile(
    "results/browser/verification.json",
    JSON.stringify(
      {
        base,
        desktop: [1440, 1000],
        mobile: [390, 844],
        run,
        cancelled,
        errors,
        upstreamTooltipMessages,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: comparison 32/32 twice, mobile no overflow, native RUN 32/32 on 2 workers, cancellation, no unexpected console errors (known upstream tooltip message recorded)",
  );
} finally {
  await browser.close();
}
