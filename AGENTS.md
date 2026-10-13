# Worker Lab

Keep this repository self-contained. All authored application and executable tooling must be BoxLang. Do not add Python, authored shell wrappers, or Node tooling. HTML/CSS/JavaScript browser presentation and declarative configuration are allowed. Require installed CommandBox 6.3.5+ and use `box install`, `box run-script setup`, `box server start/stop`, and `box testbox run` with a checkout-local COMMANDBOX_HOME. Do not reintroduce manual Java/JAR setup or launcher instructions. Never install prerelease modules into the user's usual CommandBox home. Pins live in box.json and dependencies.json; verify installed API file integrity and worker-runtime checksum. Do not replace the development API with released TestBox 7.2.0.

The workload is eight real bundles and 32 assertions. Preserve precise reporting: configured workflows, local tests, browser runs and exact-commit hosted CI are separate evidence. Do not simulate provider events or fabricate timing measurements. Use the native Runner/Coordinator/ProgressFile/shard APIs.

The provider owns only its child JVMs, homes and scratch workspaces. Preserve idempotent cleanup and the single shutdown deadline. No external databases, paid services, private application code, credentials or secrets belong here. Public site deployment requires explicit approval.
