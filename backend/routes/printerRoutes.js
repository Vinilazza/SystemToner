// /routes/printerRoutes.js
const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const ctrl = require("../controllers/printerController");
const router = express.Router();

router.use(requireAuth);

// CRUD de impressoras (admin/tecnico podem criar/editar; usuários só listam)
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", requireRole("admin", "tecnico"), ctrl.create);
router.put("/:id", requireRole("admin", "tecnico"), ctrl.update);
router.patch("/:id/toggle", requireRole("admin", "tecnico"), ctrl.toggleActive);

module.exports = router;
