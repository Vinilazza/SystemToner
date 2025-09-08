// /routes/tonerRoutes.js
const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const ctrl = require("../controllers/tonerController");
const router = express.Router();

router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.get("/:id/history", ctrl.history);
router.post("/", requireRole("admin", "tecnico"), ctrl.create);
router.put("/:id", requireRole("admin", "tecnico"), ctrl.update);
router.patch("/:id/toggle", requireRole("admin", "tecnico"), ctrl.toggleActive);

module.exports = router;
