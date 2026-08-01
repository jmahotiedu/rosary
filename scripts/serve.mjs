import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const readArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = readArg("--host", "127.0.0.1");
const port = Number.parseInt(readArg("--port", "4173"), 10);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const basePath = "/rosary";

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
]);

function localAddresses() {
  const addresses = [];
  for (const interfaces of Object.values(networkInterfaces())) {
    for (const entry of interfaces ?? []) {
      if (entry.family === "IPv4" && !entry.internal) addresses.push(entry.address);
    }
  }
  return addresses;
}

async function resolveFile(requestUrl) {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  if (url.pathname === "/") return { redirect: `${basePath}/` };
  if (url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`)) return null;

  const relative = decodeURIComponent(url.pathname.slice(basePath.length)).replace(/^\/+/, "");
  let candidate = path.resolve(root, relative || "index.html");
  if (!candidate.startsWith(root)) return null;

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) candidate = path.join(candidate, "index.html");
    await access(candidate);
    return { file: candidate };
  } catch {
    return { file: path.join(root, "index.html") };
  }
}

const server = createServer(async (request, response) => {
  try {
    const resolved = await resolveFile(request.url ?? "/");
    if (!resolved) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    if (resolved.redirect) {
      response.writeHead(302, { Location: resolved.redirect });
      response.end();
      return;
    }

    const extension = path.extname(resolved.file).toLowerCase();
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": mimeTypes.get(extension) ?? "application/octet-stream",
    });
    createReadStream(resolved.file).pipe(response);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Server error");
  }
});

server.listen(port, host, () => {
  console.log("Rosary preview is running:");
  console.log(`  Local:   http://localhost:${port}${basePath}/`);
  for (const address of localAddresses()) {
    console.log(`  Network: http://${address}:${port}${basePath}/`);
  }
  console.log("Press Ctrl+C to stop.");
});
