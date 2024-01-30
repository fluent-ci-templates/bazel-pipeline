import { Directory, DirectoryID } from "../../deps.ts";
import { Client } from "../../sdk/client.gen.ts";

export const exclude = [
  "node_modules",
  "build",
  ".gradle",
  "app/build/",
  "vendor",
  "android/app/build/",
  "android/.gradle",
  ".devbox",
  ".fluentci",
];

export const getDirectory = async (
  client: Client,
  src: string | Directory | undefined = "."
) => {
  if (typeof src === "string") {
    try {
      const directory = client.loadDirectoryFromID(src as DirectoryID);
      await directory.id();
      return directory;
    } catch (_) {
      return client.host().directory(src);
    }
  }
  return src instanceof Directory ? src : client.host().directory(src);
};
