# Five-minute demo with Eric and Luis

Prepare with the README’s pinned-JAR bootstrap, then run `lab.bxs setup` and `lab.bxs start --console`. Keep a second terminal and the latest passing Actions run open. The launcher prefix for every command is `java -jar .bootstrap/boxlang.jar --bx-home .runtime/tooling scripts/lab.bxs`.

1. **Luis introduces the workload.** Eight parcel bundles, 32 real tests, deliberate pauses to make progress visible. No linear-speedup promise.
2. **Eric shows RUN.** Open `/tests/runner.parallel.bxm`, choose two Workers, Run All. Point to preparation, discovery, interleaved specs and retained final rows. A targeted bundle uses one worker.
3. **Luis compares.** The homepage runs standard serial and four real worker JVMs. Both must show 32/32. Discuss startup and compilation costs; download actual JSON.
4. **Eric uses the CLI.** Run `lab.bxs cli testbox run runner=parallel workers=4 interactive=false` with the launcher prefix. Highlight native bundle progress and timing table. The BoxLang wrapper invokes actual CommandBox in a private home.
5. **Luis finishes in CI.** Show four independent shard jobs, the merge job and combined artifact. Explain the shared run/attempt/SHA identity and why missing, duplicate or mixed-run reports cannot pass.
6. **Optional Stop.** Start two workers in RUN, stop during startup and wait for confirmed cleanup. Cancellation means incomplete execution.

Afterward run `lab.bxs stop` with the launcher prefix. All authored setup, lifecycle, verification, provider and browser code is BoxLang. Only the official runtime’s first download happens before BoxLang can execute; vendor Playwright internally manages its driver runtime.
