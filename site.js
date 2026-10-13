"use strict";
const $ = (id) => document.getElementById(id);
let stream,
  runId,
  ticker,
  began,
  baseline,
  parallel,
  baselineWallMs,
  parallelWallMs,
  parallelBegan,
  delayMs,
  active = false;
const workers = new Map();
const seconds = (ms) => (ms / 1000).toFixed(2) + " s";
const passed = (r) => `${r.totalPass}/${r.totalSpecs}`;
function status(message) {
  $("status").textContent = message;
}
function lock(on) {
  active = on;
  $("run").disabled = on;
  $("workers").disabled = on;
  $("profile").disabled = on;
  $("stop").disabled = !on || !stream;
}
function row(id) {
  if (workers.has(id)) return workers.get(id);
  const el = document.createElement("div");
  el.className = "worker";
  const label = document.createElement("div");
  label.className = "worker-label";
  label.textContent = "Worker " + id;
  const track = document.createElement("div");
  track.className = "track";
  const note = document.createElement("span");
  note.className = "worker-state";
  note.textContent = "Starting private JVM…";
  track.append(note);
  el.append(label, track);
  $("timeline").append(el);
  const w = { track, note, bundles: new Map() };
  workers.set(id, w);
  return w;
}
function record(type, d) {
  const lines = $("events").textContent.split("\n").filter(Boolean);
  lines.push(type + " " + JSON.stringify(d));
  $("events").textContent = lines.slice(-12).join("\n");
  if (!d.workerId) return;
  const w = row(d.workerId);
  if (type === "bundleStart") {
    const b = document.createElement("span");
    b.className = "bundle active";
    b.textContent = d.path.split(".").pop().replace(/Spec$/, "");
    b.title = d.path;
    w.track.insertBefore(b, w.note);
    w.bundles.set(d.path, b);
    w.note.textContent = "Executing";
  }
  if (type === "bundleEnd") {
    const b = w.bundles.get(d.path);
    if (b) {
      b.classList.remove("active");
      b.textContent += " · " + seconds(d.totalDuration || 0);
    }
  }
  if (type === "workerEnd") {
    w.note.textContent = d.complete
      ? `${d.totalPass} passed · complete`
      : "Incomplete";
  }
  if (type === "workerError") w.note.textContent = "Worker error";
}
function finish(error) {
  if (stream) stream.close();
  stream = undefined;
  clearInterval(ticker);
  lock(false);
  if (error) status(error);
  $("export").disabled = !baseline && !parallel;
}
$("run").addEventListener("click", async () => {
  if (active) return;
  baseline = parallel = undefined;
  delayMs = Number($("profile").value);
  $("export").disabled = true;
  workers.clear();
  $("timeline").replaceChildren();
  $("events").textContent = "";
  for (const id of [
    "serial-pass",
    "serial-time",
    "parallel-workers",
    "parallel-pass",
    "parallel-time",
    "serial-wall",
    "parallel-wall",
  ])
    $(id).textContent = "—";
  lock(true);
  began = performance.now();
  ticker = setInterval(
    () => ($("clock").textContent = seconds(performance.now() - began)),
    200,
  );
  status("Running standard serial baseline…");
  try {
    const response = await fetch(`tests/runner.bxm?reporter=json&demoDelayMs=${delayMs}`);
    if (!response.ok)
      throw Error("Serial runner returned HTTP " + response.status);
    baseline = await response.json();
    baselineWallMs = performance.now() - began;
    $("serial-pass").textContent = passed(baseline);
    $("serial-time").textContent = seconds(baseline.totalDuration);
    $("serial-wall").textContent = seconds(baselineWallMs);
    if (baseline.totalFail || baseline.totalError)
      throw Error("Serial baseline failed; inspect the downloaded report.");
    const count = Number($("workers").value);
    $("parallel-workers").textContent = count;
    status(`Starting ${count} isolated workers…`);
    parallelBegan = performance.now();
    runId = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    stream = new EventSource(
      `tests/runner.parallel.bxm?action=run&streaming=true&runId=${runId}&workers=${count}&demoDelayMs=${delayMs}`,
    );
    $("stop").disabled = false;
    for (const type of [
      "runPhase",
      "workerStart",
      "bundleStart",
      "bundleEnd",
      "specEnd",
      "workerEnd",
      "workerError",
      "runCancelling",
    ])
      stream.addEventListener(type, (event) => {
        const d = JSON.parse(event.data);
        record(type, d);
        if (type === "runPhase") status(d.message);
        if (type === "runCancelling")
          status("Cancellation requested. Waiting for owned JVM cleanup…");
      });
    stream.addEventListener("testRunEnd", (event) => {
      const data = JSON.parse(event.data);
      parallel = data.results;
      parallelWallMs = performance.now() - parallelBegan;
      $("parallel-pass").textContent = passed(parallel);
      $("parallel-time").textContent = seconds(parallel.totalDuration);
      $("parallel-wall").textContent = seconds(parallelWallMs);
      const verified =
        parallel.passed && parallel.parallel?.coverageMatched === true;
      status(
        verified
          ? "Complete. Real assertions and worker cleanup verified."
          : "Run incomplete or failed. Inspect the JSON report.",
      );
      $("comparison").textContent =
        `Measured HTTP elapsed: serial ${seconds(baselineWallMs)}, ${count} workers ${seconds(parallelWallMs)} (${(baselineWallMs / parallelWallMs).toFixed(2)}× ratio). ${delayMs} ms deliberate waiting per test. Includes compilation, worker JVM startup and cleanup; this server was already running. This is synthetic latency, not a production benchmark.`;
      finish();
    });
    stream.onerror = () =>
      finish(
        "Stream disconnected before confirmed completion. Check RUN/CLI and retained worker logs.",
      );
  } catch (e) {
    finish(e.message);
  }
});
$("stop").addEventListener("click", async () => {
  $("stop").disabled = true;
  try {
    const r = await fetch(
      `tests/runner.parallel.bxm?action=cancel&runId=${runId}`,
      { method: "POST" },
    );
    if (!r.ok) throw Error("Cancel returned HTTP " + r.status);
    status("Stop requested. Retaining progress until cleanup finishes…");
  } catch (e) {
    status(e.message);
    $("stop").disabled = false;
  }
});
$("export").addEventListener("click", () => {
  const blob = new Blob(
    [
      JSON.stringify(
        { recordedAt: new Date().toISOString(), delayMs, simulatedWait: true, baseline, parallel, baselineWallMs, parallelWallMs, boundary: "HTTP request through complete response/SSE result; already-running server, worker JVM startup and cleanup included, server provisioning excluded" },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "worker-lab-comparison.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
