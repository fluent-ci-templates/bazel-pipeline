import { Directory, dag } from "../../deps.ts";
import { getDirectory } from "./lib.ts";

export enum Job {
  build = "build",
  test = "test",
}

export const exclude = [
  ".fluentci",
  ".git",
  "target",
  "bazel-bin",
  "bazel-example",
  "bazel-out",
  "bazel-testlogs",
];

/**
 * @function
 * @description Build the project
 * @param {string} src source directory
 * @param {string} version bazel version to use
 * @returns {Promise<string>}
 */
export async function build(
  src: Directory | string,
  version?: string
): Promise<Directory | string> {
  const BAZEL_VERSION = Deno.env.get("BAZEL_VERSION") || version || "6.3.2";
  const context = await getDirectory(dag, src);
  const ctr = dag
    .pipeline(Job.build)
    .container()
    .from("ghcr.io/fluentci-io/bazel:latest")
    .withMountedCache("/root/.cache/bazel", dag.cacheVolume("bazel-cache"))
    .withEnvVariable("BAZEL_VERSION", BAZEL_VERSION)
    .withDirectory("/app", context, {
      exclude,
    })
    .withWorkdir("/app")
    .withExec(["bazelisk", "build", "//..."])
    .withExec(["ls", "-la"])
    .withExec(["sh", "-c", "mkdir -p output && cp -r bazel-bin/* output"]);

  const result = await ctr.stdout();

  console.log(result);

  const output = ctr.directory("/app/output");
  await output.export("output");
  const id = await output.id();
  return id;
}

/**
 * @function
 * @description Run tests
 * @param {string} src source directory
 * @param {string} version bazel version to use
 * @returns {Promise<string>}
 */
export async function test(
  src: Directory | string,
  version?: string
): Promise<string> {
  const BAZEL_VERSION = Deno.env.get("BAZEL_VERSION") || version || "6.3.2";
  const context = await getDirectory(dag, src);
  const ctr = dag
    .pipeline(Job.test)
    .container()
    .from("ghcr.io/fluentci-io/bazel:latest")
    .withMountedCache("/root/.cache/bazel", dag.cacheVolume("bazel-cache"))
    .withEnvVariable("BAZEL_VERSION", BAZEL_VERSION)
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["bazelisk", "test", "//..."])
    .withExec(["ls", "-la"]);

  const result = await ctr.stdout();
  return result;
}

export type JobExec = (
  src: Directory | string,
  version?: string
) => Promise<Directory | string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.test]: "Run tests",
};
