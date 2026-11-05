const http = require("http");
const { URL } = require("url");

const target = new URL(process.env.TARGET_URL);
const user = process.env.PUBLIC_GATEWAY_USER;
const password = process.env.PUBLIC_GATEWAY_PASSWORD;
const toolName = process.env.TOOL_NAME || "Marketing tool";

if (!user || !password) {
  throw new Error("PUBLIC_GATEWAY_USER and PUBLIC_GATEWAY_PASSWORD must be set.");
}

function unauthorized(res) {
  res.writeHead(401, {
    "WWW-Authenticate": `Basic realm="${toolName}"`,
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end("Login required.");
}

function isAuthorized(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  return decoded === `${user}:${password}`;
}

function proxyRequest(req, res) {
  if (!isAuthorized(req)) return unauthorized(res);

  const headers = { ...req.headers };
  delete headers.authorization;
  headers.host = target.host;
  headers["x-forwarded-host"] = req.headers.host;
  headers["x-forwarded-proto"] = "https";

  const request = http.request(
    {
      hostname: target.hostname,
      port: target.port || 80,
      method: req.method,
      path: req.url,
      headers,
    },
    (upstream) => {
      res.writeHead(upstream.statusCode || 502, upstream.headers);
      upstream.pipe(res);
    }
  );

  request.on("error", (error) => {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Gateway error for ${toolName}: ${error.message}`);
  });

  req.pipe(request);
}

const server = http.createServer(proxyRequest);

server.on("upgrade", (req, socket, head) => {
  if (!isAuthorized(req)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n");
    socket.destroy();
    return;
  }

  const headers = { ...req.headers };
  delete headers.authorization;
  headers.host = target.host;

  const upstream = http.request({
    hostname: target.hostname,
    port: target.port || 80,
    path: req.url,
    method: req.method,
    headers,
  });

  upstream.on("upgrade", (upstreamRes, upstreamSocket, upstreamHead) => {
    socket.write(
      `HTTP/1.1 ${upstreamRes.statusCode} ${upstreamRes.statusMessage}\r\n` +
        Object.entries(upstreamRes.headers)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\r\n") +
        "\r\n\r\n"
    );
    if (upstreamHead.length) socket.write(upstreamHead);
    if (head.length) upstreamSocket.write(head);
    upstreamSocket.pipe(socket);
    socket.pipe(upstreamSocket);
  });

  upstream.on("error", () => socket.destroy());
  upstream.end();
});

server.listen(8080, "0.0.0.0", () => {
  console.log(`${toolName} public gateway listening on 8080`);
});
