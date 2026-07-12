import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const nextConfig: NextConfig = {
  // Pin file-tracing to THIS project. A parent lockfile (dev-home artifact) otherwise makes Next
  // infer /home/mdlog as the workspace root — this silences that warning and keeps a
  // standalone/traced production bundle scoped to the app.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
