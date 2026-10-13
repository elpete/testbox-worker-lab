# Five-minute demo with Eric and Luis

Prepare in a normal checkout with installed CommandBox 6.3.5+. Set the isolated `COMMANDBOX_HOME` from the README, then `box install`, `box run-script setup`, and `box server start`. Keep a passing Actions run open. Use the same home in your second terminal.

1. **Luis introduces the workload.** Eight parcel bundles, 32 real tests and deliberate pauses. No linear-speedup promise.
2. **Eric shows RUN.** Open `/tests/runner.parallel.bxm`, choose two Workers and Run All. Point to preparation, discovery, interleaved specs and retained final rows.
3. **Luis compares.** The homepage runs standard serial and four real worker JVMs. Both must show 32/32. Discuss startup and compilation cost; download real JSON.
4. **Eric uses CommandBox.** Run `box testbox run runner=parallel workers=4 interactive=false`. Highlight native bundle progress and timing table. There is no Java/JAR wrapper command; the server was started by `box server start`.
5. **Luis finishes in CI.** Show four independent shards, the merge job and combined artifact. Explain run/attempt/SHA identity and why missing, duplicate or mixed-run reports cannot pass.
6. **Optional Stop.** In RUN start two workers, stop during startup and wait for confirmed cleanup. Cancellation means incomplete execution.

Afterward: `box server stop`. Setup and verification are BoxLang package scripts invoked through CommandBox. The runtime/JVM processes remain implementation details of CommandBox and the worker provider.
