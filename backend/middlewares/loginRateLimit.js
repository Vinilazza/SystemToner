const rateLimit = require("express-rate-limit");

// Limita tentativas de login por IP
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 10, // 10 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Muitas tentativas. Tente novamente em alguns minutos.",
  },
});

module.exports = loginLimiter;
