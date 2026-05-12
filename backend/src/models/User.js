import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    /** Set for email/password users; omitted for Google-only until they set a password. */
    passwordHash: { type: String, select: false },
    /** Google "sub" from ID token; sparse so email/password users need not have it. */
    googleId: { type: String, sparse: true, unique: true, index: true },
  },
  { timestamps: true }
);

userSchema.pre("validate", function validateAuthMethod(next) {
  if (!this.passwordHash && !this.googleId) {
    this.invalidate("auth", "User must have a password or Google account");
  }
  next();
});

export const User = mongoose.model("User", userSchema);

