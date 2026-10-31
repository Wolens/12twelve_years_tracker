import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectKey = path.basename(projectRoot);

/** Закрывает другие `next dev` для этого каталога (частая причина битой .next). */
export function stopStaleDevServers() {
  if (process.platform === "win32") {
    const filter = `*${projectKey}*`;
    const ps = [
      "Get-CimInstance Win32_Process -Filter \"name = 'node.exe'\" |",
      `Where-Object { $_.CommandLine -like '${filter}' -and ($_.CommandLine -like '*next*dev*' -or $_.CommandLine -like '*dev-clean*') } |`,
      "ForEach-Object {",
      "  Write-Host ('Stopping stale dev PID ' + $_.ProcessId);",
      "  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue",
      "}",
    ].join(" ");
    spawnSync("powershell", ["-NoProfile", "-Command", ps], { stdio: "inherit" });
    return;
  }

  spawnSync(
    "sh",
    [
      "-c",
      `pkill -f "${projectKey}.*next dev" 2>/dev/null || pkill -f "${projectKey}.*dev-clean" 2>/dev/null || true`,
    ],
    { stdio: "inherit" }
  );
}
