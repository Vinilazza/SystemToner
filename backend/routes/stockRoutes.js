// /routes/stockRoutes.js
const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const ctrl = require("../controllers/stockController");
const router = express.Router();

router.use(requireAuth);

// Apenas técnico/admin podem movimentar; todos podem consultar histórico
router.get("/", ctrl.listMovements);
router.post("/", requireRole("admin", "tecnico"), ctrl.createMovement);

module.exports = router;
