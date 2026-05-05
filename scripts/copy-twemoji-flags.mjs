import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(rootDir, "node_modules", "@twemoji", "svg");
const targetRootDir = join(rootDir, "public", "twemoji");
const targetFlagsDir = join(targetRootDir, "flags");
const flagFileNamePattern =
  /^1f1(e[6-9a-f]|f[0-9a-f])-1f1(e[6-9a-f]|f[0-9a-f])\.svg$/;

await rm(targetFlagsDir, { force: true, recursive: true });
await mkdir(targetFlagsDir, { recursive: true });

const fileNames = await readdir(sourceDir);
let copiedCount = 0;

for (const fileName of fileNames) {
  if (!flagFileNamePattern.test(fileName)) {
    continue;
  }

  await cp(join(sourceDir, fileName), join(targetFlagsDir, fileName));
  copiedCount += 1;
}

await cp(join(sourceDir, "license"), join(targetRootDir, "LICENSE.txt"));

console.log(`Copied ${copiedCount} Twemoji flag SVG assets.`);
