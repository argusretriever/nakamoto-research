const fs = require("fs");
const cp = require("child_process");

const files = cp.execSync('git ls-files "*.html"', { encoding: "utf8" })
  .trim().split(/\r?\n/).filter(Boolean);
let changed = 0;

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (!/["']@type["']\s*:\s*["'](?:Article|NewsArticle|BlogPosting)["']/i.test(html)) continue;
  const depth = file.split("/").length - 1;
  const prefix = "../".repeat(depth);
  let additions = "";
  if (!/assets\/share-tools\.css/i.test(html)) additions += `\n    <link rel="stylesheet" href="${prefix}assets/share-tools.css">`;
  if (!/assets\/share-tools\.js/i.test(html)) additions += `\n    <script defer src="${prefix}assets/share-tools.js"></script>`;
  if (!additions) continue;
  html = html.replace(/<\/head>/i, `${additions}\n  </head>`);
  fs.writeFileSync(file, html);
  changed += 1;
}

console.log(JSON.stringify({ articlePagesUpdated: changed }));
