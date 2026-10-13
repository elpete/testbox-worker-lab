# TestBox Worker Lab

An original Parcel Dispatch application showing Eric Peterson’s parallel-worker work through **TestBox RUN, CommandBox CLI and GitHub Actions**. Eight bundles contain 32 real tests for quotes, express fees, guards and manifest files. A configurable 300 ms pause makes progress visible; this is a demonstration, not a production speedup benchmark.

**Installed CommandBox is the entry point for installation, setup, server lifecycle and tests.** All authored executable tooling/application code is BoxLang. Presentation uses HTML/CSS/JavaScript. No Python, shell wrappers, npm manifests or authored Node tooling are required. There is no manual Java/JAR bootstrap.

## Setup with CommandBox

Prerequisites: **CommandBox 6.3.5 or newer**, Git, internet access, macOS/Linux. CommandBox and its pinned BoxLang module manage the Java 21 and BoxLang runtime installations. CI installs CommandBox 6.3.5 with the official setup Action.

```sh
git clone https://github.com/elpete/testbox-worker-lab.git
cd testbox-worker-lab
mkdir -p .runtime/commandbox
export COMMANDBOX_HOME="$PWD/.runtime/commandbox"
export BOXLANG_HOME="$PWD/.runtime/tooling"
box install
box run-script setup
box server start
```

Keep the checkout-local `COMMANDBOX_HOME` and initial `BOXLANG_HOME` set in every terminal used for this demo. They isolate the draft TestBox CLI, server registry and pre-server tooling runtime. A new terminal needs the same exports after changing into the checkout.

`box install` reads the exact development Git commits and pinned modules in `box.json`. `box run-script setup` uses the official `boxlang cli` bridge to run the BoxLang setup: verifies critical framework/CLI source hashes and the worker-runtime checksum, links the local TestBox mapping, and prepares private worker/tooling homes. It invokes your **installed** `box` executable, not a repository-downloaded CommandBox binary.

Open **http://127.0.0.1:8642/** for comparison or **http://127.0.0.1:8642/tests/runner.parallel.bxm** for native RUN. In RUN choose Workers and Run All. The comparison page runs standard serial then real isolated workers and downloads measured JSON.

For a console server, use `box server start --console` in one terminal and run tests in another. Stop the owned server with:

```sh
box server stop
```

Setup can be repeated. Avoid running `box install` concurrently with active test runs. After dependency changes or reinstalling, rerun `box run-script setup` to verify and relink the prerelease framework.

## Genuine CommandBox CLI

```sh
box testbox run runner=serial outputFile=results/serial.json
box testbox run runner=parallel workers=2 interactive=false outputFile=results/parallel-2.json
box testbox run runner=parallel workers=4 interactive=false outputFile=results/parallel-4.json
box run-script verify:four
```

Omit `interactive=false` in a supported interactive terminal for redrawn worker rows. Permanent logs and the native timing table are verified. `box run-script smoke` runs serial/two/four-worker and local HTTP shard/merge checks. `box run-script audit` guards the BoxLang-authored source boundary.

Change `PARCEL_DELAY_MS` in `server.json` and restart for another workload; use `0` for fast correctness checks. Keep it identical for all comparisons/shards. Startup, compilation and cleanup can outweigh useful work; four workers need not beat two or serial.

## Local shard and merge rehearsal

Use a fresh report directory and shared identity:

```sh
box testbox run runner=serial shard=1/2 shardRunId=local-demo outputFile=results/shards/one.json
box testbox run runner=serial shard=2/2 shardRunId=local-demo outputFile=results/shards/two.json
box testbox merge directory=results/shards outputFile=results/combined.json
box run-script verify:combined
box run-script verify:merge
box run-script contracts
```

Missing, duplicate and mixed-run reports fail native merge. The contract runs a real failing fixture outside application discovery and confirms failure survives merge. Combined duration is the longest shard’s test duration, **not workflow wall time**. Retry with a new identity and directory; keep unrelated JSON out of merge inputs.

## BoxLang browser verification through CommandBox

```sh
box run-script browser:setup
box run-script browser:test
```

CommandBox installs the public, version-pinned `bx-playwright` module and runs its BoxLang browser installer. The browser suite is authored in BoxLang and exercises comparison, JSON download, desktop/mobile, native RUN at two workers, and Stop. Screenshots and receipts go under ignored `results/browser/`. The exact upstream tooltip exception `Please use show on visible elements` is recorded separately; unexpected errors fail verification.

Playwright internally manages its vendor Node driver. Node/npm are not user prerequisites and no authored tooling runs through Node. The module archive uses a direct immutable vendor S3 object version. Browser modules/caches stay out of worker JVM homes.

## Prerelease pins and genuine upstream limits

**Released TestBox 7.2.0 does not contain these draft APIs.** Package version labels do not establish source identity. The dependency declarations and integrity checks retain:

| Dependency | Identity |
| --- | --- |
| [TestBox PR217](https://github.com/Ortus-Solutions/TestBox/pull/217) | `a197c61faa9a5d7b104b32a95cd8c266c9270979` |
| [CLI PR28](https://github.com/Ortus-Solutions/testbox-cli/pull/28) | `4e06f5c155302f9cce434886703cc2310cff6890` |
| [Completion PR27](https://github.com/Ortus-Solutions/testbox-cli/pull/27) | Independent merged work; not included in the CLI pin |
| BoxLang core / servlet | `1.18.0+66` / `1.18.6+62` |
| CFML compatibility | `1.37.0` |
| CommandBox / BoxLang module | `6.3.5` / `1.22.0` |

The servlet and core have separate versions. ForgeBox’s engine catalog does not list the exact core build, so `server.json` uses the official pinned servlet archive URL with CommandBox’s supported engine installer. Its initial-install hook installs the pinned CFML compatibility module. TestBox/CommandBox contain third-party CFML internally; they are dependencies, not authored application code.

CommandBox’s BoxLang bridge chooses Java 21 from its own registry and may download it even if the host already has Java. No manual JAR command is needed. A macOS clean probe under `/tmp` hit a JDK archive permission error; use a normal project directory with appropriate write permissions and report the original CommandBox error rather than silently substituting a manual Java launch. Linux browser provisioning may need access to install Chromium system libraries.

Once a matching server is registered, the bridge automatically uses that server’s BoxLang JAR and home. Browser setup installs into the actual active runtime home, so later `box run-script browser:test` sees the module. The worker homes still copy only their separate compatibility-module directory. The bridge can emit upstream SLF4J binding warnings with the servlet classpath; browser verification records actual page errors separately.

Coverage recordings are not merged; `workers` and `shard` cannot be combined; scheduling stays at bundle level. The demo is BoxLang-only and makes no Adobe/Lucee or production scaling claim.

## Isolation, CI and presentation

`ProcessProvider.bx` starts one real BoxLang JVM per assigned batch, with private application state, runtime home and `java.io.tmpdir`. Each bundle owns UUID scratch files. Native `ProgressFile` callbacks supply events; genuine `runRaw().getMemento()` reports go to the coordinator for exact coverage verification. Cancellation signals all owned JVMs, uses one 30-second deadline, escalates if needed, confirms exit and removes scratch resources. Small diagnostic receipts remain in TestBox temporary storage.

[The workflow](.github/workflows/demo.yml) uses the official CommandBox setup Action, immutable Actions commits, Ubuntu 24.04 and read-only permissions. Every job uses `box install`, `box run-script setup`, and CommandBox-managed server/test commands. Four independent shard jobs upload reports even on failure; an always-running merge verifies the complete selection. No site deployment is configured.

[Presenter walkthrough](docs/presenter.md) · [Verification scope](docs/verification.md). The final handoff identifies the passing exact-commit CI run. Original demo code is MIT; fetched dependencies retain their own licenses.
