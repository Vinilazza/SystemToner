// middleware/corsMiddleware.js

function corsMiddleware(req, res, next) {
  // Permite todas as origens; para restringir, substitua "*" por um domínio específico
  res.header("Access-Control-Allow-Origin", "*");

  // Permite os métodos HTTP desejados
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Permite os cabeçalhos que seu aplicativo precisa receber (pode personalizar conforme necessário)
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Se for uma requisição do tipo OPTIONS (pré-voo), envia resposta imediatamente
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  // Caso contrário, passa a execução para o próximo middleware ou rota
  next();
}

module.exports = corsMiddleware;
