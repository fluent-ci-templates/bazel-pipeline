import {
  test,
  build,
} from "https://pkg.fluentci.io/bazel_pipeline@v0.5.0/mod.ts";

await test();
await build();
