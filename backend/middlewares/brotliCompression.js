// middlewares/brotliCompression.js
const { createBrotliCompress, constants } = require("zlib");
const { PassThrough } = require("stream");

function brotliCompressionMiddleware(req, res, next) {
  // ─── Bypass para rota de download de anexo ───────────────────────────────
  if (
    req.method === "GET" &&
    req.originalUrl.match(
      /^\/api\/projects\/[^/]+\/tasks\/[^/]+\/attachments\/[^/]+$/
    )
  ) {
    return next(); // não aplica Brotli aqui
  }
  // ────────────────────────────────────────────────────────────────────────

  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (!/\bbr\b/.test(acceptEncoding)) {
    return next();
  }

  res.setHeader("Content-Encoding", "br");
  res.removeHeader("Content-Length");

  const brotli = createBrotliCompress({
    params: { [constants.BROTLI_PARAM_QUALITY]: 4 },
  });
  const stream = new PassThrough();
  stream.pipe(brotli).pipe(res);

  const originalWrite = res.write;
  const originalEnd = res.end;
  res.write = (chunk, enc, cb) => stream.write(chunk, enc, cb);
  res.end = (chunk, enc, cb) => stream.end(chunk, enc, cb);

  next();
}

module.exports = brotliCompressionMiddleware;
