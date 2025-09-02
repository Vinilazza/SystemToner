const express = require("express");
const { body } = require("express-validator");
const loginLimiter = require("../middlewares/loginRateLimit");
const ctrl = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Nome é obrigatório"),
    body("email").isEmail().withMessage("E-mail inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Senha mínima de 6 caracteres"),
    body("role")
      .optional()
      .isIn(["admin", "tecnico", "usuario"])
      .withMessage("Role inválida"),
    body("phone").optional().isString(),
    body("department").optional().isString(),
    body("avatarUrl").optional().isString(),
  ],
  ctrl.register
);

router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("E-mail inválido"),
    body("password").notEmpty().withMessage("Senha é obrigatória"),
  ],
  ctrl.login
);

router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);

module.exports = router;
