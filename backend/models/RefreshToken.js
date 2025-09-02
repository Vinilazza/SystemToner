const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
