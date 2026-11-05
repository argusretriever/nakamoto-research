#!/usr/bin/env node

const { execSync } = require("node:child_process");

const deployMarkers = ["[deploy]", "[netlify-deploy]"];
const forceValue = String(process.env.NETLIFY_FORCE_DEPLOY || "").toLowerCase();
const forced = ["1", "true", "yes"].includes(forceValue);

function getCommitMessage() {
  if (process.env.COMMIT_MESSAGE) return process.env.COMMIT_MESSAGE;

  try {
    return execSync("git log -1 --pretty=%B", { encoding: "utf8" });
  } catch {
    return "";
  }
}

const commitMessage = getCommitMessage().toLowerCase();
const hasDeployMarker = deployMarkers.some((marker) => commitMessage.includes(marker));

if (forced || hasDeployMarker) {
  console.log("Netlify deploy gate: deploy allowed.");
  process.exit(1);
}

console.log("Netlify deploy gate: deploy skipped. Add [deploy] to the commit message or set NETLIFY_FORCE_DEPLOY=true to publish.");
process.exit(0);
