// routes/index.js
const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/printers", require("./printerRoutes"));
router.use("/toners", require("./tonerRoutes"));
router.use("/stock", require("./stockRoutes"));
module.exports = router;
