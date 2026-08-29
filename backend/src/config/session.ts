import dotenv from "dotenv";

dotenv.config();

// Production is any non-local deployment. Gating cookie security on NODE_ENV
// alone proved fragile (Render sets it, but local/hosted setups differ), so we
// allow an explicit SESSION_SECURE=true override as well.
export const IS_PRODUCTION =
  process.env.NODE_ENV === "production" ||
  process.env.SESSION_SECURE === "true";

export const SESSION_COOKIE_NAME = "sessionId";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? "none" : "lax",
} as const;