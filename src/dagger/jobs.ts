import Client from "@dagger.io/dagger";

export enum Job {
  build = "build",
  test = "test",
}

const BAZEL_VERSION = Deno.env.get("BAZEL_VERSION") || "6.3.2";

const exclude = [
  ".fluentci",
  ".git",
  "target",
  "bazel-bin",
  "bazel-example",
  "bazel-out",
  "bazel-testlogs",
];

export const build = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.build)
    .container()
    .from("ghcr.io/fluent-ci-templates/bazel:latest")
    .withMountedCache("/root/.cache/bazel", client.cacheVolume("bazel-cache"))
    .withEnvVariable("BAZEL_VERSION", BAZEL_VERSION)
    .withDirectory("/app", context, {
      exclude,
    })
    .withWorkdir("/app")
    .withExec(["bazelisk", "build", "//..."])
    .withExec(["ls", "-la"]);

  const result = await ctr.stdout();

  console.log(result);
};

export const test = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.test)
    .container()
    .from("ghcr.io/fluent-ci-templates/bazel:latest")
    .withMountedCache("/root/.cache/bazel", client.cacheVolume("bazel-cache"))
    .withEnvVariable("BAZEL_VERSION", BAZEL_VERSION)
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["bazelisk", "test", "//..."])
    .withExec(["ls", "-la"]);

  const result = await ctr.stdout();

  console.log(result);
};

export type JobExec = (
  client: Client,
  src?: string
) =>
  | Promise<void>
  | ((
      client: Client,
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<void>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.test]: "Run tests",
};
