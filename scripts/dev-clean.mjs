import { rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { stopStaleDevServers } from "./stop-stale-dev.mjs";

stopStaleDevServers();

rmSync(".next", { recursive: true, force: true });
console.log("Removed .next — starting next dev…\n");

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
