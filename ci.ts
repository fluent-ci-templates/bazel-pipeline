import {
  test,
  build,
} from "https://pkg.fluentci.io/bazel_pipeline@v0.3.1/mod.ts";

await test();
await build();
