// Regenerates site/assets/img/og-image.png from the live showcase demo -
// see .claude/skills/update-og-image/SKILL.md for when/why to run this.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const capturePage = path.join(here, "capture.html");
const outputPath = path.join(
  here,
  "..",
  "..",
  "site",
  "assets",
  "img",
  "og-image.png",
);

const chromiumBin = process.env.CHROMIUM_BIN || "chromium";

execFileSync(
  chromiumBin,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--screenshot=${outputPath}`,
    "--window-size=1200,630",
    "--virtual-time-budget=3000",
    "--hide-scrollbars",
    `file://${capturePage}`,
  ],
  { stdio: "inherit" },
);

console.log("Wrote " + outputPath);
