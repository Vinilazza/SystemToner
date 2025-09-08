// /routes/userRoutes.js
const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const userCtrl = require("../controllers/userController");

const router = express.Router();

// **Optimized for app bootstrap**
router.get("/me/compact", requireAuth, userCtrl.getMeCompact);

// **Perfil detalhado do próprio usuário**
router.get("/me/profile", requireAuth, userCtrl.getMeProfile);

// **Admin: listagem e gestão de usuários**
router.get("/", requireAuth, requireRole("admin"), userCtrl.listUsers);
router.get("/:id", requireAuth, requireRole("admin"), userCtrl.getUserById);
router.put("/:id", requireAuth, requireRole("admin"), userCtrl.updateUser);
router.patch(
  "/:id/toggle",
  requireAuth,
  requireRole("admin"),
  userCtrl.toggleUser
);

// (opcional) perfil detalhado de qualquer user — somente admin
router.get(
  "/:userId/profile",
  requireAuth,
  requireRole("admin"),
  userCtrl.getUserProfileById
);

module.exports = router;
