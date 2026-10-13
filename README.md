# TestBox Worker Lab

An original Parcel Dispatch application showing Eric Peterson’s parallel-worker work through **TestBox RUN, CommandBox CLI and GitHub Actions**. Eight bundles contain 32 real tests for quotes, express pricing, guards and manifest files. A configurable 300 ms pause per spec makes progress visible; this is a demonstration, not a production speedup benchmark.

All authored application and executable tooling code is **BoxLang**. The browser presentation uses HTML/CSS/JavaScript. There are no Python files, Python prerequisites, Bash wrapper scripts, npm package files or Node-authored verification scripts. The original four Python tools and three shell wrappers have been replaced by `scripts/Lab.bx` and `scripts/lab.bxs`; browser verification is `scripts/browser.bxs`. The worker provider is native `ProcessProvider.bx`.

## Bootstrap once

Prerequisites: **Java 21, Git and curl**, on macOS/Linux. If BoxLang is not installed, a BoxLang script cannot download its own runtime before it starts. This unavoidable first download is an official pinned JAR; the repository contains no bootstrap program in another scripting language.

```sh
git clone https://github.com/elpete/testbox-worker-lab.git
cd testbox-worker-lab
mkdir -p .bootstrap
curl --fail --location https://downloads.ortussolutions.com/ortussolutions/boxlang/1.18.0/boxlang-1.18.0.jar --output .bootstrap/boxlang.jar
```

Before executing it, compare its SHA-256 with `f9908fc0f2b699e8ed28c577b25bbf475f17dc14181bea1cf7f3672126f40379` (`shasum -a 256` on macOS or `sha256sum` on Linux). CI checks this automatically. All subsequent setup logic runs in BoxLang:

```sh
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs setup
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs start --console
```

Keep the console terminal open; use a second terminal for commands below. Open **http://127.0.0.1:8642/** for comparison or **http://127.0.0.1:8642/tests/runner.parallel.bxm** for native RUN. In RUN choose Workers, then Run All. The comparison runs a standard serial baseline followed by real workers and can download measured JSON.

For a conventional background server, omit `--console`. Stop only this project’s server:

```sh
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs stop
```

With BoxLang 1.18.0 already installed, `boxlang --bx-home .runtime/tooling scripts/lab.bxs ...` is equivalent. The pinned-JAR form avoids relying on a globally installed runtime version.

## Actual CommandBox CLI

The `cli` action forwards an argument array to the genuine pinned CommandBox executable in this checkout’s private home. It preserves failing exit codes and never installs draft modules into `~/.CommandBox`.

```sh
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs cli testbox run runner=serial outputFile=results/serial.json
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs cli testbox run runner=parallel workers=2 interactive=false outputFile=results/parallel-2.json
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs cli testbox run runner=parallel workers=4 interactive=false outputFile=results/parallel-4.json
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs verify-report results/parallel-4.json
```

Omit `interactive=false` in a supported interactive terminal for redrawn rows. The permanent log mode and native timing table are verified. A single short run does not establish a generalized speedup. Set `PARCEL_DELAY_MS` in `server.json`, restart, and keep the same value across comparisons; use `0` for fast correctness checks.

`lab.bxs smoke` runs all serial/two/four-worker and local HTTP-shard/merge checks with the launcher prefix. `lab.bxs audit` guards the authored BoxLang source boundary in CI.

## Local shard and merge rehearsal

Use a fresh report directory and shared run identity. CI uses the same API across four separate machines.

```sh
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs cli testbox run runner=serial shard=1/2 shardRunId=local-demo outputFile=results/shards/one.json
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs cli testbox run runner=serial shard=2/2 shardRunId=local-demo outputFile=results/shards/two.json
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs cli testbox merge directory=results/shards outputFile=results/combined.json
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs verify-report results/combined.json
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs verify-merge
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs contracts
```

Missing, duplicate and mixed-run reports fail native merge. The contract runs a real failing fixture outside application discovery and confirms failure survives merge. Combined duration is the longest shard’s test duration, **not workflow wall time**. Retry with a fresh identity and directory; keep unrelated JSON out of merge inputs.

## Native BoxLang browser QA

```sh
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs browser-setup
java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs browser
```

The content-pinned public `bx-playwright` module exposes Playwright’s Java browser API to BoxLang. Its private cache installs Chromium and the vendor Playwright driver; the driver internally uses Node, downloaded/managed by the module. Node/npm are not user prerequisites and no authored tooling runs through Node. Linux provisioning may request elevated access to install Chromium system libraries.

The module’s snapshot archive is pinned by S3 object version and SHA-256, so an updated snapshot cannot silently replace it. Browser modules/caches stay out of worker JVM homes. The BoxLang check exercises comparison, real JSON download, desktop/mobile, native RUN at two workers and Stop; screenshots and receipts go under ignored `results/browser/`. The exact upstream tooltip exception `Please use show on visible elements` is recorded separately; unexpected errors fail verification.

## Prerelease pins and isolation

**Released TestBox 7.2.0 does not contain these draft APIs.** Source package version labels are not proof of identity. `dependencies.json` pins:

| Dependency | Identity |
| --- | --- |
| [TestBox PR217](https://github.com/Ortus-Solutions/TestBox/pull/217) | `a197c61faa9a5d7b104b32a95cd8c266c9270979` |
| [CLI PR28](https://github.com/Ortus-Solutions/testbox-cli/pull/28) | `4e06f5c155302f9cce434886703cc2310cff6890` |
| [Completion PR27](https://github.com/Ortus-Solutions/testbox-cli/pull/27) | Independent merged work; not included in the CLI pin |
| BoxLang core / servlet | `1.18.0+66` / `1.18.6+62` |
| CFML compatibility module | `1.37.0` |
| CommandBox / BoxLang module | `6.3.5` / `1.22.0` |

Binary archives and nested TestBox modules are checksummed. TestBox/CommandBox contain third-party CFML internally; they are fetched into ignored dependency directories, not authored or vendored in this repository. No private application code or secrets are included.

`ProcessProvider.bx` starts one real BoxLang JVM per assigned batch, with private application state, runtime home and `java.io.tmpdir`. Bundles own UUID scratch directories. Native `ProgressFile` callbacks supply events; genuine `runRaw().getMemento()` results go to the coordinator, which checks exact bundle coverage. Cancellation signals all owned processes, waits against one 30-second deadline, escalates remaining owned JVMs, confirms exit and removes scratch resources. Small diagnostic receipts remain in TestBox temporary storage.

A database-backed application would also need isolated databases/services. This file-based provider is not a general environment manager. Coverage recordings are not merged; `workers` and `shard` cannot be combined; scheduling is at bundle level. This demo is BoxLang-only and makes no Adobe/Lucee compatibility claim.

## CI and presentation

[The workflow](.github/workflows/demo.yml) uses immutable Actions commits, Ubuntu 24.04, Temurin 21.0.10 and read-only permissions. Its only pre-BoxLang steps download/check the runtime JAR. BoxLang handles setup, readiness, CLI forwarding, results, negative merge contracts and browser QA. Four shard jobs upload reports even on failure; an always-running merge verifies the complete selection. No deployment is configured.

[Presenter walkthrough](docs/presenter.md) · [Verification scope](docs/verification.md). The latest exact-commit CI result is linked in the final handoff. Original demo code is MIT; fetched dependencies retain their own licenses.
