# Worker Lab

Keep this repository self-contained. Use `scripts/box`, never install prerelease modules into a global CommandBox home. Source framework/CLI pins live in `dependencies.json`; verify both Git commit and unchanged tracked source. Do not replace the development API with released TestBox 7.2.0.

The workload is eight real bundles and 32 assertions. Preserve precise reporting: configured workflows, local tests, browser runs and exact-commit hosted CI are separate evidence. Do not simulate provider events or fabricate timing measurements. Use the native Runner/Coordinator/ProgressFile/shard APIs.

The provider owns only its child JVMs, homes and scratch workspaces. Preserve idempotent cleanup and the single shutdown deadline. No external databases, paid services, private application code, credentials or secrets belong here. Public site deployment requires explicit approval.
