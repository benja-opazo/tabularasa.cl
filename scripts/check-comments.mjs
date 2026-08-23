// CI guard for CLAUDE.md's comments policy: flags comment blocks long enough
// to be duplicating docs/decisions/*.md rather than pointing at it. Only
// scans site/assets/js and worker - CSS's numbered TOC in styles.css is a
// deliberate, documented exception (see CLAUDE.md).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MAX_LINES = 10;
const TARGET_DIRS = ["site/assets/js", "worker"];

function jsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".js"))
    .map((e) => join(dir, e.name));
}

function findLongComments(src) {
  const violations = [];

  const blockRe = /\/\*[\s\S]*?\*\//g;
  let m;
  while ((m = blockRe.exec(src))) {
    const lines = m[0].split("\n").length;
    if (lines > MAX_LINES) {
      const lineNo = src.slice(0, m.index).split("\n").length;
      violations.push({ line: lineNo, lines, kind: "/* */" });
    }
  }

  const srcLines = src.split("\n");
  let run = 0;
  let runStart = 0;
  for (let i = 0; i < srcLines.length; i++) {
    if (srcLines[i].trim().startsWith("//")) {
      if (run === 0) runStart = i;
      run++;
    } else {
      if (run > MAX_LINES) violations.push({ line: runStart + 1, lines: run, kind: "//" });
      run = 0;
    }
  }
  if (run > MAX_LINES) violations.push({ line: runStart + 1, lines: run, kind: "//" });

  return violations;
}

let failed = false;
for (const dir of TARGET_DIRS) {
  for (const file of jsFiles(dir)) {
    const src = readFileSync(file, "utf8");
    for (const v of findLongComments(src)) {
      failed = true;
      console.error(
        `${file}:${v.line}: ${v.kind} comment is ${v.lines} lines (max ${MAX_LINES}) - ` +
          `move the rationale into docs/decisions/*.md and leave a short pointer instead.`,
      );
    }
  }
}

if (failed) process.exit(1);
console.log("check-comments: OK");
