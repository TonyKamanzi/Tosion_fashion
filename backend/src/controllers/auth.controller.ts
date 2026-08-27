import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { googleClient } from "../config/google.js";

// Session-safe user shape (never includes password)
type SafeUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

// Convert database user to safe session/user response
const toSafeUser = (user: {
  _id: { toString(): string };
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}): SafeUser => ({
  _id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
});

// ==========================
// SIGNUP
// ==========================

export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json(toSafeUser(user));
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Failed to create account",
    });
  }
};

// ==========================
// LOGIN
// ==========================

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // User doesn't exist OR has no password (Google-only account)
    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Existing session system
    req.session.user = toSafeUser(user);

    res.status(200).json(toSafeUser(user));
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// ==========================
// LOGOUT
// ==========================

export const logout = async (req: Request, res: Response) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to logout",
        });
      }

      res.clearCookie("connect.sid");

      res.status(200).json({
        message: "Logged out successfully",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      message: "Logout failed",
    });
  }
};

// ==========================
// GET CURRENT USER
// ==========================

export const getUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    res.status(200).json(req.session.user);
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to get user",
    });
  }
};

// ==========================
// GOOGLE LOGIN
// ==========================

export const googleLogin = (req: Request, res: Response) => {
  const authorizationUrl = googleClient.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "profile", "email"],
  });

  res.redirect(authorizationUrl);
};

// ==========================
// GOOGLE CALLBACK
// ==========================


export const googleCallback = async (
  req: Request,
  res: Response
) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        message: "Google authorization code is missing",
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
      return res.status(400).json({
        message: "Google ID token is missing",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google identity",
      });
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase().trim();

    if (!googleId || !email) {
      return res.status(400).json({
        message: "Google account information is incomplete",
      });
    }

    let user = await User.findOne({ googleId });

    // Google account isn't connected yet
    if (!user) {
      user = await User.findOne({ email });

      // Existing email/password account
      if (user) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // Brand new Google user
    if (!user) {
      const firstName =
        payload.given_name ||
        payload.name?.split(" ")[0] ||
        "User";

      const lastName =
        payload.family_name ||
        payload.name?.split(" ").slice(1).join(" ") ||
        "";

      user = await User.create({
        firstName,
        lastName,
        email,
        googleId,
        role: "user",
      });
    }

    // Create session
    req.session.user = toSafeUser(user);

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured");
    }

    const redirectTo =
      user.role === "admin" ? "/admin" : "/";

    return res.redirect(`${frontendUrl}${redirectTo}`);

  } catch (error) {
    console.error("Google authentication error:", error);

    return res.status(500).json({
      message: "Google authentication failed",
      error: error instanceof Error ? error.message : error,
    });
  }
};