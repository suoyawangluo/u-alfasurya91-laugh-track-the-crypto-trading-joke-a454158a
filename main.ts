// Laugh Track: The Crypto Trading Joke Contest — make.fun entry.
// Program writes one crypto-trading joke (one line, 1-200 characters) to
// /output/entry.txt. The joke is my own work: a trader who keeps "buying the
// dip" until the only support level left is his credit card.
//
// Structure: the joke is built from two named parts — SETUP (the habit every
// trader recognises) and PUNCH (the turn: the "support level" is not on the
// chart at all) — assembled by buildEntry(). The gate lives in
// validateEntry(), which returns a GateReport, and verifyWritten() reads the
// file back and returns its sha256 so the run proves what it wrote.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SETUP = "I bought the dip so many times my wallet now has its own support level:";
const PUNCH = "my credit card.";

function buildEntry(): string {
  return `${SETUP} ${PUNCH}`;
}

type GateReport = { ok: boolean; reason: string; chars: number };

function validateEntry(text: string): GateReport {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    return { ok: false, reason: `length ${chars} outside 1-200`, chars };
  }
  if (text.trim().length === 0) {
    return { ok: false, reason: "blank", chars };
  }
  if (text.includes("\n")) {
    return { ok: false, reason: "not a single line", chars };
  }
  return { ok: true, reason: "ok", chars };
}

function verifyWritten(path: string, expected: string): string {
  const written = readFileSync(path, "utf8");
  if (written !== expected) throw new Error("read-back mismatch");
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const entry = buildEntry();
  const report = validateEntry(entry);
  if (!report.ok) throw new Error(`gate fails: ${report.reason}`);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, entry, "utf8");
  const sha = verifyWritten(outPath, entry);
  console.log(
    `gate passes: ${report.chars} characters, 1 line, sha256 ${sha}`
  );
  console.log(`wrote ${outPath}`);
  console.log(`verified: ${JSON.stringify(entry)}`);
}

main();
