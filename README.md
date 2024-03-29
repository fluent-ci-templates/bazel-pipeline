# Bazel Pipeline

[![fluentci pipeline](https://img.shields.io/badge/dynamic/json?label=pkg.fluentci.io&labelColor=%23000&color=%23460cf1&url=https%3A%2F%2Fapi.fluentci.io%2Fv1%2Fpipeline%2Fbazel_pipeline&query=%24.version)](https://pkg.fluentci.io/bazel_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.34)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/bazel-pipeline)](https://codecov.io/gh/fluent-ci-templates/bazel-pipeline)

A ready-to-use Pipeline for [Bazel](https://bazel.build/) projects.

## 🚀 Usage

Run the following command in your project :

```bash
fluentci run bazel_pipeline
```

Or, if you want to use it as a template :

```bash
fluentci init -t bazel
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
fluentci run .
```

## Dagger Module

Use as a [Dagger](https://dagger.io) Module:

```bash
dagger mod install github.com/fluent-ci-templates/bazel-pipeline@mod
```

## Environment variables

| Variable            | Description                                      |
| ------------------- | ------------------------------------------------ |
| `USE_BAZEL_VERSION` | The version of Bazel to use. Defaults to `6.3.2` |

## Jobs

| Job       | Description   |
| --------- | ------------- |
| build     | Build project |
| test      | Run tests     |

```typescript
build(
  src: Directory | string,
  version?: string
): Promise<Directory | string>

test(
  src: Directory | string,
  version?: string
): Promise<string>
```

## Programmatic usage

You can also use this pipeline programmatically :

```ts
import { test, build } from "https://pkg.fluentci.io/bazel_pipeline@v0.5.1/mod.ts";

await test(".");
await build(".");
```
