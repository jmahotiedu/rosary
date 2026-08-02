import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const outputDirectory = "dist";
const temporaryDirectory = ".build";
const compiler = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "node_modules",
  "typescript",
  "bin",
  "tsc",
);

await rm(outputDirectory, { recursive: true, force: true });
await rm(temporaryDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

execFileSync(
  process.execPath,
  [
    compiler,
    "--outDir",
    temporaryDirectory,
    "--noEmit",
    "false",
    "--module",
    "ESNext",
    "--target",
    "ES2022",
    "--moduleResolution",
    "Bundler",
    "--skipLibCheck",
  ],
  { stdio: "inherit" },
);

async function addJavaScriptExtensions(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await addJavaScriptExtensions(entryPath);
      continue;
    }
    if (!entryPath.endsWith(".js")) continue;

    let source = await readFile(entryPath, "utf8");
    source = source.replace(
      /(from\s+["'])(\.{1,2}\/[^"']+?)(["'])/g,
      (match, prefix, importPath, suffix) =>
        importPath.endsWith(".js") ? match : `${prefix}${importPath}.js${suffix}`,
    );
    await writeFile(entryPath, source);
  }
}

await addJavaScriptExtensions(temporaryDirectory);
await cp(temporaryDirectory, outputDirectory, { recursive: true });
await rm(temporaryDirectory, { recursive: true, force: true });
await cp("public", outputDirectory, { recursive: true });
await cp("src/styles", `${outputDirectory}/styles`, { recursive: true });
await writeFile(`${outputDirectory}/.nojekyll`, "");

let html = await readFile("src/index.html", "utf8");
html = html.replace('src="/main.ts"', 'src="/rosary/main.js"');
await writeFile(`${outputDirectory}/index.html`, html);

console.log("Built dist/ for https://jmahotiedu.github.io/rosary/");
