# TestBox Worker Lab

A runnable, original Parcel Dispatch application that shows Eric Peterson’s TestBox parallel-worker work through **TestBox RUN, the CommandBox CLI, and GitHub Actions**. Eight bundles exercise 32 real assertions: parcel quotes, express pricing, weight/destination validation, and receipt files. Each spec pauses for 300 ms so a presenter can follow progress. This is an intentionally paced demonstration, not a production benchmark.

## Prerelease dependencies

**TestBox 7.2.0 does not contain the draft worker APIs.** This project checks out development source, never installs the released framework as a substitute. The source package may display `7.2.0` or `@build.version@`; the Git commit establishes identity.

| Dependency                                                                       | Exact identity                                                                                  |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [TestBox PR217](https://github.com/Ortus-Solutions/TestBox/pull/217)             | `a197c61faa9a5d7b104b32a95cd8c266c9270979`                                                      |
| [TestBox CLI PR28](https://github.com/Ortus-Solutions/testbox-cli/pull/28)       | `4e06f5c155302f9cce434886703cc2310cff6890`                                                      |
| [Runner completion PR27](https://github.com/Ortus-Solutions/testbox-cli/pull/27) | `a5a4c072a3366aafa720d79b53fd50aaaeaf95ee`, independent merged PR; not included in this CLI pin |
| BoxLang core / servlet                                                           | `1.18.0+66` / `1.18.6+62`                                                                       |
| CFML compatibility module                                                        | `1.37.0`                                                                                        |
| CommandBox / BoxLang module                                                      | `6.3.5` / `1.22.0`                                                                              |

`dependencies.json` pins source commits and SHA-256 checksums for binary/module archives, including TestBox’s Globber, CBStreams, CBProxies and CBMockData dependencies. The servlet has a separate version from the core. The official servlet archive contains the same core build used by the workers. Java 21 is required; CI uses Temurin 21.0.10. macOS/Linux are the supported setup platforms.

## Setup and local demo

Prerequisites: Java 21, Git, Python 3, internet access. Node is only needed for optional browser QA. No database, paid service, credentials, or global CommandBox module installation is needed.

```sh
git clone https://github.com/elpete/testbox-worker-lab.git
cd testbox-worker-lab
python3 scripts/setup.py
scripts/start
```

Open **http://127.0.0.1:8642/** for the comparison page, or **http://127.0.0.1:8642/tests/runner.parallel.bxm** for the native RUN IDE. In RUN, select Workers and Run All. The comparison page runs the standard serial endpoint followed by real isolated workers; Download JSON preserves measured reports. Blank cells stay blank until execution completes.

Use the supplied `scripts/box` wrapper for the pinned CLI. It passes every argument directly to the genuine CommandBox executable in the project’s private home. Commands written as `box testbox …` in the upstream PRs become `scripts/box testbox …` here. **Do not install these draft modules into your normal `~/.CommandBox`.**

```sh
scripts/box testbox run runner=serial outputFile=results/serial.json
scripts/box testbox run runner=parallel workers=2 interactive=false outputFile=results/parallel-2.json
scripts/box testbox run runner=parallel workers=4 interactive=false outputFile=results/parallel-4.json
python3 scripts/check-results.py results/parallel-4.json
scripts/box server stop
```

Omit `interactive=false` in a supported interactive terminal to see redrawn worker rows. The permanent log output is verified locally and used in CI; visual behavior of terminal animation is not claimed by browser QA. PR27 adds named-runner completion independently; this demo pins PR28 for the worker/shard APIs and does not claim PR27 completion in that checkout.

`PARCEL_DELAY_MS` controls the deliberate pause, read by both the serial app and child workers. Change the `server.json` environment value and restart to compare another workload. Use `0` for fast correctness checks. Keep the same value for every comparison/shard. Startup, compilation and cleanup can outweigh the useful work: four workers are not guaranteed to beat two or serial. Eight workers can consume over 2 GB of heap plus native overhead; choose according to available memory.

## Local CI-shard rehearsal

Start the server, use a fresh directory, and give every shard the same run identity:

```sh
scripts/box testbox run runner=serial shard=1/2 shardRunId=local-demo outputFile=results/shards/one.json
scripts/box testbox run runner=serial shard=2/2 shardRunId=local-demo outputFile=results/shards/two.json
scripts/box testbox merge directory=results/shards outputFile=results/combined.json
python3 scripts/check-results.py results/combined.json
python3 scripts/verify-merge.py
scripts/test-contracts
```

The contract harness also runs a deliberately failing fixture outside the application suite and confirms its failure survives native merge. The real merge command rejects missing, duplicate and mixed-run reports. Keep unrelated JSON out of the input directory. Retried jobs need a fresh identity and directory. Failing assertions remain failed in the combined report. Combined test duration is the **longest shard’s test duration**, not GitHub workflow wall time.

## GitHub Actions

[`.github/workflows/demo.yml`](.github/workflows/demo.yml) runs automatically on main pushes and supports manual dispatch. It uses immutable Actions commits and read-only repository permissions.

- `workers`: serial, two/four isolated JVMs, coverage/count checks, the comparison page and native RUN browser checks.
- `shards`: four distinct Ubuntu jobs with their own application setup and `shard=1/4` through `4/4`.
- `merge`: runs even when a shard fails; downloads **every** report, executes native `testbox merge`, checks all 32 assertions/eight exact bundles, and tests merge rejection safeguards. It needs no application server.

Every shard uploads results with `if: always()` and missing-file failure. The shared identity includes GitHub run ID, attempt and source SHA. Worker/browser evidence and combined JSON are downloadable artifacts. CI never deploys the site. See [verification](docs/verification.md) for observed results, not just configured jobs.

## How isolation works

`tests/runner.parallel.bxm` is a small wrapper around the actual TestBox `Runner`. The application-owned `ProcessProvider.cfc` implements the native lifecycle: prepare, start, poll, stop, finish. It starts **one real BoxLang JVM per assigned batch**, each with a private BoxLang home, module copy and `java.io.tmpdir`. Each bundle also owns a UUID scratch directory and cleans it after assertions. Tests neither share mutable application scopes nor write into a common manifest.

The child executes TestBox `runRaw()` with assigned bundles and native filters. `ProgressFile` writes real TestBox callback events to JSONL; the provider forwards them to the coordinator. Reports are genuine `TestResult.getMemento()` results. The coordinator verifies exact bundle coverage and streams the combined report through RUN/CLI/the comparison page.

Stopping signals every owned JVM first, waits against one 30-second grace deadline, force-stops remaining owned processes, then verifies process exit and removes homes/workspaces. Small diagnostic `cleanup.json`, progress, selection, process logs and results remain in the TestBox temporary evidence root. The provider never stops other application processes. Close the stream only after the cancellation result; a disconnected stream is not confirmed cleanup.

This isolation boundary fits this file-based demo. A database-backed application would also need separate databases/schemas and its other mutable services. It is not a general environment manager for arbitrary applications.

## Presenter walkthrough and browser checks

[Five-minute presenter guide](docs/presenter.md) includes a two-person handoff for Eric and Luis. [Verification notes](docs/verification.md) distinguish local, browser and hosted evidence.

Optional browser QA:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

The browser test exercises the comparison button, downloaded real JSON, mobile overflow, native RUN’s two-worker execution and Stop. It saves screenshots and receipts under ignored `results/browser/`. One upstream Bootstrap tooltip message (`Please use show on visible elements`) is explicitly recorded; unexpected console errors fail QA.

Limitations: proposed APIs can change; no coverage recording merge; no `workers` plus `shard` combination; scheduling is at bundle level with no work stealing. This demo is BoxLang-only. Adobe/Lucee worker behavior and hosted speedup claims are outside its evidence.

License: MIT for original demo code. Fetched dependencies retain their own licenses. No upstream source or private application code is vendored in this repository.
