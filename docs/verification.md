# Verification scope

Use development Git commits and archive checksums in `dependencies.json`, not the framework’s semantic version label. The executable tools are BoxLang. No Python prerequisite, npm install or authored shell/Node tooling is required.

The correction was validated locally from a clean source checkout with new private runtime/dependency directories and Python executables disabled in PATH. Native BoxLang setup, repeat setup, serial/two/four-worker execution, HTTP shards, merge safeguards and failure preservation passed. Native browser verification also ran from this checkout. The final handoff supplies the exact hosted run and any remaining blockers.

Checks required for the correction:

- BoxLang setup and repeat setup: exact upstream source and checksums, unchanged tracked dependency source.
- Original workload: 32/32 and exactly eight bundles in serial, two-worker and four-worker CLI modes.
- BoxLang provider: private JVMs and scratch resources; confirmed cleanup.
- Two real local HTTP shards, native merge to 32/32, rejection of missing/duplicate/mixed-run reports.
- A real assertion failure remains failed after merge.
- BoxLang browser suite: real comparison and JSON download, desktop/mobile, native RUN at two workers, successful Stop and no unexpected errors.
- Hosted CI on the final pushed commit: four independent shard jobs, worker/browser job and validated merge; inspect downloaded native reports, not just job status.

Screenshots/reports are under ignored `results/`; CI publishes its own artifacts. The known upstream tooltip exception `Please use show on visible elements` is recorded separately. Browser automation uses the content-pinned public bx-playwright module and its internally managed vendor driver; all authored verification is BoxLang.

The final handoff records completed checks and the exact CI run. Earlier commits used Python tooling and are historical; they are not evidence for the BoxLang-only correction. Outside scope: Adobe/Lucee worker compatibility, interactive terminal animation appearance, production services, a controlled performance benchmark or public site deployment.
