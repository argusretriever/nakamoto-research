const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

http.createServer((request, response) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(request.url.split("?")[0]);
  } catch {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }
  const relativePath = urlPath.replace(/^[/\\]+/, "");
  let filePath = path.resolve(root, relativePath);
  if (urlPath.endsWith("/")) filePath = path.join(filePath, "index.html");

  if (!filePath.startsWith(root + path.sep) || relativePath.split(/[/\\]/).some(part => part.startsWith("."))) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    response.end(content);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`NAKAMOTO site running at http://127.0.0.1:${port}/`);
});
