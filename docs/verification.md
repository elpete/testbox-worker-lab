# Verification scope

Cache verification requires exact input keys computed before any installer changes the lock file, a fresh-directory restore with no server/configuration state or results, source/checksum rejection for corrupted cached inputs, native CLI serial/two/four execution and merge rejection safeguards, and a summary running without TestBox/compatibility dependencies. Hosted cold/warm comparisons must use the same final commit, actual restore hit/miss records and equivalent test/report artifacts. Local rehearsal does not establish a hosted cache hit or a performance gain; the final handoff records the actual runs and timing observations.

The long demo uses 10000 ms of deliberate waiting per test; quick browser/CLI correctness uses 300 ms. Both execute the same eight bundles and 32 real tests. Current verification includes long serial/four-worker lifecycle measurements, four concurrent local HTTP shards plus native merge, long native RUN at four workers, and separate long hosted serial/worker/shard jobs. Receipts distinguish runner, HTTP, CommandBox/server lifecycle and full hosted job/path boundaries. Final exact-commit results and actual timings are recorded in the handoff and generated **timing-comparison** artifact, not inferred from theoretical wait budgets.

The current workflow requires installed CommandBox. `box install` owns dependency installation; `box run-script setup` invokes the BoxLang helper through the official bridge; `box server start/stop` own the server lifecycle. No manual runtime-JAR download or launch is part of setup or CI. No Python or authored shell/Node tooling is required.

The CommandBox correction was rehearsed from a clean checkout-local home on macOS, with CommandBox 6.3.5:

- Clean `box install` and repeated `box run-script setup` using a checkout-local home.
- Pinned development source identity: Git dependency specifications and integrity hashes for the installed framework/CLI API files; the worker runtime checksum.
- Actual CommandBox-managed server startup, readiness and shutdown.
- Serial, two and four workers: 32/32 and exactly eight bundles.
- Two real local HTTP shards merged to 32/32; missing/duplicate/mixed-run rejection and real failure preservation.
- Native RUN/browser comparison at desktop/mobile, successful Stop and no unexpected errors, driven by BoxLang through CommandBox.
- Exact-commit hosted CI: worker/browser job, separate long serial/four-worker comparison jobs, four independent shards, validated merge and timestamp-based summary; inspect actual artifacts.

Local installation, repeated setup, freshly recreated server provisioning, source audit, CLI 32/32 runs at serial/two/four workers, two-shard merge and rejection contracts passed. Native browser checks passed comparison/JSON download, desktop/mobile, RUN 32/32 on two workers and cancellation. The server was stopped through CommandBox. CI is verified separately in the final handoff against the published commit.

The first hosted CommandBox run caught a ForgeBox HTTP 408 while an upstream floating nested range selected globber 3.2.0 before the root 3.1.5 pin was installed. The committed CommandBox lock file now fixes that nested selection as well. Installation still requires access to the public package services; genuine missing shard reports correctly prevent merge success.

The final handoff records completed checks and the exact run. Earlier Java/JAR-based commits are historical and do not establish this CommandBox workflow. Reports/screenshots remain under ignored `results/` and in CI artifacts. The exact known Bootstrap tooltip exception is recorded separately. No production service, public deployment, Adobe/Lucee compatibility or controlled performance benchmark is claimed.
