# Verification scope

The local demo uses the development commits in `dependencies.json`. Setup verifies checksums and fails if tracked dependency source changes. Framework-reported semantic version strings are not proof that released TestBox supports these APIs.

Observed locally on macOS / Java 21 / BoxLang 1.18.0+66:

- Original parcel workload: 32 passing assertions across exactly eight bundles; no failures, errors or skips.
- Real two- and four-worker CLI runs: 32 passes, exact selected bundle coverage and confirmed owned-process cleanup.
- Two actual HTTP CLI shards: 16 passes each. Native `testbox merge` combined all 32 passes; missing, duplicate and mixed-run reports were each rejected with a failing exit code.
- Comparison page: standard serial plus four-worker execution returned 32/32 twice. Desktop screenshot and 390×844 mobile screenshot captured; no mobile horizontal overflow.
- Clean-directory rehearsal: new Git clones and private runtime homes, checksum-verified archives, matching core/servlet, and 32/32 on two real workers.
- Failure contract: a real deliberately failed assertion remained failed after native shard merge.
- Browser end-to-end suite passed: comparison, real JSON download, desktop/mobile, native RUN, cancellation, no unexpected errors; the exact known upstream tooltip exception is retained in the receipt.
- Native RUN: discovery found eight bundles/32 specs; Run All at two workers finished with two retained completed rows and 32 passes. One upstream tooltip console/page-error message (`Please use show on visible elements`) was seen after successful completion and is recorded separately from unexpected application errors.

Raw reports/screenshots are produced under ignored `results/`; hosted CI uploads its own evidence. The two/four-worker tests are original application execution, not a synthetic provider. Timings are demonstrations with artificial pauses and JVM compilation; they do not establish a production speedup.

Hosted CI status is available in the repository Actions tab. Do not infer a hosted pass from this workflow being present; verify the run’s `head_sha` equals the repository commit before presenting it. This page records only completed local observations; the final handoff identifies the verified hosted run or its blocker.

Unverified or outside scope: Adobe/Lucee worker compatibility, production databases/services, interactive terminal animation appearance, a statistically controlled performance benchmark, public site deployment. No deployment is configured.
