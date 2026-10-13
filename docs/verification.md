# Verification scope

The current workflow requires installed CommandBox. `box install` owns dependency installation; `box run-script setup` invokes the BoxLang helper through the official bridge; `box server start/stop` own the server lifecycle. No manual runtime-JAR download or launch is part of setup or CI. No Python or authored shell/Node tooling is required.

The CommandBox correction was rehearsed from a clean checkout-local home on macOS, with CommandBox 6.3.5:

- Clean `box install` and repeated `box run-script setup` using a checkout-local home.
- Pinned development source identity: Git dependency specifications and integrity hashes for the installed framework/CLI API files; the worker runtime checksum.
- Actual CommandBox-managed server startup, readiness and shutdown.
- Serial, two and four workers: 32/32 and exactly eight bundles.
- Two real local HTTP shards merged to 32/32; missing/duplicate/mixed-run rejection and real failure preservation.
- Native RUN/browser comparison at desktop/mobile, successful Stop and no unexpected errors, driven by BoxLang through CommandBox.
- Exact-commit hosted CI: worker/browser job, four independent shards and validated merge; inspect actual artifacts.

Local installation, repeated setup, freshly recreated server provisioning, source audit, CLI 32/32 runs at serial/two/four workers, two-shard merge and rejection contracts passed. Native browser checks passed comparison/JSON download, desktop/mobile, RUN 32/32 on two workers and cancellation. The server was stopped through CommandBox. CI is verified separately in the final handoff against the published commit.

The final handoff records completed checks and the exact run. Earlier Java/JAR-based commits are historical and do not establish this CommandBox workflow. Reports/screenshots remain under ignored `results/` and in CI artifacts. The exact known Bootstrap tooltip exception is recorded separately. No production service, public deployment, Adobe/Lucee compatibility or controlled performance benchmark is claimed.
