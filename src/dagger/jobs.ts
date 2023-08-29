import Client from "@dagger.io/dagger";

export enum Job {
  build = "build",
  test = "test",
}

const BAZEL_LINK =
  "https://github.com/bazelbuild/bazelisk/releases/download/v1.18.0/bazelisk-linux-amd64";
const exclude = [".fluentci", ".git", "target"];

export const build = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.build)
    .container()
    .from("openjdk:22-slim-bookworm")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "wget"])
    .withExec(["wget", "-O", "/usr/local/bin/bazelisk", BAZEL_LINK])
    .withExec(["chmod", "+x", "/usr/local/bin/bazelisk"])
    .withMountedCache("/root/.cache/bazel", client.cacheVolume("bazel-cache"))
    .withDirectory("/app", context, {
      exclude,
    })
    .withWorkdir("/app")
    .withExec(["bazelisk", "build", "//..."]);

  const result = await ctr.stdout();

  console.log(result);
};

export const test = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.test)
    .container()
    .from("openjdk:22-slim-bookworm")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "wget"])
    .withExec(["wget", "-O", "/usr/local/bin/bazelisk", BAZEL_LINK])
    .withExec(["chmod", "+x", "/usr/local/bin/bazelisk"])
    .withMountedCache("/root/.cache/bazel", client.cacheVolume("bazel-cache"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["bazelisk", "test", "//..."]);

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
