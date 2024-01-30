import {
  test,
  build,
} from "https://pkg.fluentci.io/bazel_pipeline@v0.5.1/mod.ts";

await test();
await build();
