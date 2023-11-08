import Client, { connect } from "../../deps.ts";

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

export const build = async (src = ".", version?: string) => {
  await connect(async (client: Client) => {
    const BAZEL_VERSION = Deno.env.get("BAZEL_VERSION") || version || "6.3.2";
    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.build)
      .container()
      .from("ghcr.io/fluentci-io/bazel:latest")
      .withMountedCache("/root/.cache/bazel", client.cacheVolume("bazel-cache"))
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

    await ctr.directory("/app/output").export("output");
  });
  return "Done";
};

export const test = async (src = ".", version?: string) => {
  await connect(async (client: Client) => {
    const BAZEL_VERSION = Deno.env.get("BAZEL_VERSION") || version || "6.3.2";
    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.test)
      .container()
      .from("ghcr.io/fluentci-io/bazel:latest")
      .withMountedCache("/root/.cache/bazel", client.cacheVolume("bazel-cache"))
      .withEnvVariable("BAZEL_VERSION", BAZEL_VERSION)
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["bazelisk", "test", "//..."])
      .withExec(["ls", "-la"]);

    const result = await ctr.stdout();

    console.log(result);
  });
  return "Done";
};

export type JobExec = (
  src?: string,
  version?: string
) =>
  | Promise<string>
  | ((
      src?: string,
      version?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<string>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.test]: "Run tests",
};

export const pipelineName = "bazel_pipeline";
