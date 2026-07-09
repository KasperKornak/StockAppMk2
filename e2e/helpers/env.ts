import fs from "node:fs";
import path from "node:path";

let loaded = false;

/** Playwright's test process doesn't get .env.local for free like `next dev` does. */
export function loadEnv(): void {
  if (loaded) return;
  loaded = true;

  const envPath = path.resolve(__dirname, "../../.env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}
