// middlewares/corsMiddleware.js
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  // Liste explicitamente os domínios do seu front:
  const allowed = [
    "https://tonersfull.vlsystem.com.br",
    "http://localhost:5173", // para dev local, se precisar
    process.env.CLIENT_URL, // opcional via env
  ].filter(Boolean);

  // Se for um origin permitido, reflita-o e habilite credenciais.
  if (origin && allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  // Para caches/CDN não misturarem respostas por origem:
  res.header("Vary", "Origin");

  // Métodos e cabeçalhos aceitos
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Responde o preflight imediatamente
  if (req.method === "OPTIONS") {
    // 204 é o status padrão para preflight sem body
    return res.status(204).end();
  }

  next();
}

module.exports = corsMiddleware;
