import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken } from "../services/token.service.js";
import { DEFAULT_CATEGORIES } from "../config/defaultCategories.js";

function getClient() {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new AppError("Google sign-in is not configured on the server", 503);
  return new OAuth2Client(id);
}

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential || typeof credential !== "string") {
    throw new AppError("Missing Google credential", 400);
  }

  let payload;
  try {
    const ticket = await getClient().verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError("Invalid or expired Google sign-in", 401);
  }

  const googleId = payload.sub;
  const email = payload.email?.toLowerCase()?.trim();
  const name = (payload.name || payload.given_name || "User").slice(0, 80);
  if (!email) throw new AppError("Google account has no email", 400);

  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      if (user.googleId && user.googleId !== googleId) {
        throw new AppError("This email is linked to a different Google account", 403);
      }
      user.googleId = googleId;
      if (name && (!user.name || user.name === "User")) user.name = name;
      await user.save();
    } else {
      user = await User.create({ name, email, googleId });
      await Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, user: user._id })));
    }
  }

  const token = signAccessToken(user._id);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});
