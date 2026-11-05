const fs = require("fs");
const cp = require("child_process");

const files = cp.execSync('git ls-files "*.html"', { encoding: "utf8" })
  .trim().split(/\r?\n/).filter(Boolean);
const articleTypes = new Set(["Article", "NewsArticle", "BlogPosting"]);
const image = "https://nakamatoresearch.com/assets/nakamoto-hero.png";
const organization = {
  "@type": "Organization",
  name: "NAKAMOTO",
  url: "https://nakamatoresearch.com/",
  logo: {
    "@type": "ImageObject",
    url: "https://nakamatoresearch.com/assets/bitcoin-logo-bw.svg"
  }
};
let pagesChanged = 0;
let articlesChanged = 0;

function getGitDates(file) {
  const dates = cp.execFileSync("git", ["log", "--follow", "--format=%cs", "--", file], { encoding: "utf8" })
    .trim().split(/\r?\n/).filter(Boolean);
  return dates.length ? { published: dates.at(-1), modified: dates[0] } : {};
}

function enrich(value, file) {
  let changed = false;
  let gitDates;
  const walk = (node) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (node["@graph"]) walk(node["@graph"]);
    if (!articleTypes.has(node["@type"])) return;
    let articleChanged = false;
    if (!node.image) { node.image = image; articleChanged = true; }
    if (!node.author) { node.author = { "@type": "Organization", name: "NAKAMOTO", url: "https://nakamatoresearch.com/" }; articleChanged = true; }
    if (!node.publisher) { node.publisher = organization; articleChanged = true; }
    if (!node.datePublished) {
      gitDates ||= getGitDates(file);
      if (gitDates.published) { node.datePublished = gitDates.published; articleChanged = true; }
    }
    if (!node.dateModified) {
      gitDates ||= getGitDates(file);
      const modified = gitDates.modified || node.datePublished;
      if (modified) { node.dateModified = modified; articleChanged = true; }
    }
    if (articleChanged) {
      articlesChanged += 1;
      changed = true;
    }
  };
  walk(value);
  return changed;
}

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  let pageChanged = false;
  html = html.replace(/(<script[^>]+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (full, open, json, close) => {
    let data;
    try { data = JSON.parse(json); } catch { return full; }
    if (!enrich(data, file)) return full;
    pageChanged = true;
    return `${open}${JSON.stringify(data)}${close}`;
  });
  if (pageChanged) {
    fs.writeFileSync(file, html);
    pagesChanged += 1;
  }
}

console.log(JSON.stringify({ pagesChanged, articlesChanged }));
