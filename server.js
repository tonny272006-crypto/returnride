const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  // Pilot Signup Mock API Endpoint
  if (req.method === "POST" && req.url === "/api/pilot-signup") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        console.log("-> Pilot signup received:", data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success", message: "Registered for early access" }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "error", message: "Invalid JSON" }));
      }
    });
    return;
  }

  // Static File Serving
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/" || reqPath === "") {
    reqPath = "/index.html";
  }

  const safePath = path.normalize(path.join(ROOT, reqPath));
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ReturnRide landing page running locally at:`);
  console.log(`> Local:   http://localhost:${PORT}`);
  console.log(`> Network: http://127.0.0.1:${PORT}`);
});
