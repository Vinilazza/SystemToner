const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const roles = ["admin", "tecnico", "usuario"];

const preferencesSchema = new mongoose.Schema(
  {
    language: { type: String, default: "pt-BR" },
    timezone: { type: String, default: "America/Sao_Paulo" },
    theme: { type: String, default: "system" }, // light|dark|system
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: roles, default: "usuario", index: true },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },

    // auditoria
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    passwordChangedAt: { type: Date },

    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false;
  const changedTs = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIat < changedTs;
};

// DTOs para "respostas otimizadas"
userSchema.methods.toCompact = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatarUrl: this.avatarUrl,
    isActive: this.isActive,
    // o essencial para hidratar o app
  };
};

userSchema.methods.toProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    department: this.department,
    avatarUrl: this.avatarUrl,
    isActive: this.isActive,
    preferences: this.preferences,
    lastLoginAt: this.lastLoginAt,
    lastLoginIp: this.lastLoginIp,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);
module.exports.roles = roles;
