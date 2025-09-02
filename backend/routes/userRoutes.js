const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const userCtrl = require("../controllers/userController");

const router = express.Router();

// **Optimized for app bootstrap**
router.get("/me/compact", requireAuth, userCtrl.getMeCompact);

// **Perfil detalhado**
router.get("/me/profile", requireAuth, userCtrl.getMeProfile);

// (opcional) perfil de qualquer user — somente admin
router.get(
  "/:userId/profile",
  requireAuth,
  requireRole("admin"),
  userCtrl.getUserProfileById
);

module.exports = router;
