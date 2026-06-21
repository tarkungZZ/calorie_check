const http = require("http");
const { execSync } = require("child_process");
const crypto = require("crypto");

const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || "calorie-check-deploy-secret";

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/deploy") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const sig = req.headers["x-hub-signature-256"];
      if (sig) {
        const hmac = crypto
          .createHmac("sha256", SECRET)
          .update(body)
          .digest("hex");
        if (sig !== `sha256=${hmac}`) {
          res.writeHead(403);
          return res.end("Invalid signature");
        }
      }

      try {
        const payload = JSON.parse(body);
        if (payload.ref === "refs/heads/main") {
          console.log(`[${new Date().toISOString()}] Deploy triggered by push to main`);
          res.writeHead(200);
          res.end("Deploying...");

          try {
            execSync("bash /var/www/calorie-check/deploy.sh", {
              stdio: "inherit",
              timeout: 600000,
            });
            console.log(`[${new Date().toISOString()}] Deploy completed`);
          } catch (err) {
            console.error(`[${new Date().toISOString()}] Deploy failed:`, err.message);
          }
        } else {
          res.writeHead(200);
          res.end("Not main branch, skipping");
        }
      } catch {
        res.writeHead(400);
        res.end("Invalid payload");
      }
    });
  } else {
    res.writeHead(200);
    res.end("Webhook server running");
  }
});

server.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
