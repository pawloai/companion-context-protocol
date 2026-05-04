import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const localForbiddenTermsPath = path.join(
  repoRoot,
  "tests/vendor-neutrality/forbidden-terms.json"
);

const defaultForbiddenTerms = [
  {
    term: ["paw", "lo"].join(""),
    reason: "vendor org / domain"
  },
  {
    term: ["paws", "os"].join(""),
    reason: "legacy product name"
  },
  {
    term: ["yeunge", "-", "paw", "lo"].join(""),
    reason: "personal fork host"
  }
];

const normalizeForbiddenTerm = (entry, index) => {
  if (typeof entry === "string" && entry.length > 0) {
    return {
      term: entry,
      reason: "local forbidden term"
    };
  }

  if (
    entry &&
    typeof entry === "object" &&
    typeof entry.term === "string" &&
    entry.term.length > 0
  ) {
    return {
      term: entry.term,
      reason: typeof entry.reason === "string" ? entry.reason : "local forbidden term"
    };
  }

  throw new Error(`Invalid local forbidden term entry at index ${index}`);
};

const loadLocalForbiddenTerms = () => {
  if (!fs.existsSync(localForbiddenTermsPath)) {
    return [];
  }

  const localTerms = JSON.parse(fs.readFileSync(localForbiddenTermsPath, "utf8"));
  if (!Array.isArray(localTerms)) {
    throw new Error("Local forbidden terms file must contain a JSON array");
  }

  return localTerms.map(normalizeForbiddenTerm);
};

const forbiddenTerms = [
  ...defaultForbiddenTerms,
  ...loadLocalForbiddenTerms()
];

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  cwd: repoRoot
})
  .toString("utf8")
  .split("\0")
  .filter(Boolean);

let failed = false;

for (const relativePath of trackedFiles) {
  const absolutePath = path.join(repoRoot, relativePath);
  const content = fs.readFileSync(absolutePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const { term, reason } of forbiddenTerms) {
    const matchIndex = content.toLowerCase().indexOf(term);
    if (matchIndex === -1) {
      continue;
    }

    failed = true;
    const lineNumber = content.slice(0, matchIndex).split(/\r?\n/).length;
    const line = lines[lineNumber - 1];
    console.error(`not ok - vendor-specific string found in ${relativePath}:${lineNumber}`);
    console.error(`  reason: ${reason}`);
    console.error(`  ${line}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("ok - vendor-neutral tracked files");
