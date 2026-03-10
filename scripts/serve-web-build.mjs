import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const args = parseArgs(process.argv.slice(2));
const port = Number(args.port ?? 4173);
const envFile = args["env-file"] ?? "./apps/web/.dev.vars";
const { default: worker } = await import("../apps/web/build/server/index.js");
const env = await loadEnvFile(envFile);

const server = createServer(async (req, res) => {
  try {
    const body = await readRequestBody(req);
    const request = new Request(`http://127.0.0.1:${port}${req.url ?? "/"}`, {
      body: body.length > 0 ? body : undefined,
      duplex: body.length > 0 ? "half" : undefined,
      headers: req.headers,
      method: req.method,
    });

    const response = await worker.fetch(request, env, {
      passThroughOnException() {},
      waitUntil() {},
    });

    res.statusCode = response.status;

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        return;
      }

      res.setHeader(key, value);
    });

    const setCookies = response.headers.getSetCookie?.() ?? [];

    if (setCookies.length > 0) {
      res.setHeader("set-cookie", setCookies);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    res.statusCode = 500;
    res.end(error instanceof Error ? error.stack ?? error.message : String(error));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Built worker server listening on http://127.0.0.1:${port}`);
});

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const nextToken = argv[index + 1];

    if (!nextToken || nextToken.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = nextToken;
    index += 1;
  }

  return parsed;
}

async function loadEnvFile(filePath) {
  const text = await readFile(filePath, "utf8");
  const entries = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    entries[key] = stripQuotes(value);
  }

  return entries;
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

async function readRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}
