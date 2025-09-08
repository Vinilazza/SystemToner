// middleware/corsMiddleware.js
function corsMiddleware(req, res, next) {
  const allowed = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = req.headers.origin;
  if (!allowed.length || (origin && allowed.includes(origin))) {
    // Reflete a origem EXATA (nunca "*") quando for credenciais
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header("Vary", "Origin"); // caches corretos
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") return res.sendStatus(204); // preflight OK
  next();
}

module.exports = corsMiddleware;
