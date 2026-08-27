import express from "express";
import dotenv from "dotenv";
import { setDefaultResultOrder } from "node:dns";
import https from "node:https";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import arrivalRoutes from "./routes/arrival.routes.js";
import editorialRoutes from "./routes/editorial.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import productRoutes from "./routes/product.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import promoRoutes from "./routes/promo.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import PromoCode from "./models/promo.model.js";

dotenv.config();

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

const PORT = Number(process.env.PORT) || 2000;

const MONGO_URI = process.env.MONGO_URI;

const SESSION_SECRET = process.env.SESSION_SECRET;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not defined");
}

// =====================================================
// NETWORK CONFIGURATION
// =====================================================

// Prefer IPv4 for outbound requests.
// This helps prevent IPv6 connection problems with Google OAuth.
setDefaultResultOrder("ipv4first");
https.globalAgent.options.family = 4;

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      FRONTEND_URL,
    ],
    credentials: true,
  }),
);

// =====================================================
// SESSION
// =====================================================

app.use(
  session({
    name: "sessionId",

    secret: SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 60 * 60 * 24, // 1 day
    }),

    cookie: {
      httpOnly: true,

      // Render uses HTTPS in production
      secure: process.env.NODE_ENV === "production",

      // Important for frontend/backend on different domains
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",

      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// =====================================================
// ROUTES
// =====================================================

app.use("/auth", authRoutes);

app.use("/hero", heroRoutes);

app.use("/categories", categoryRoutes);

app.use("/arrivals", arrivalRoutes);

app.use("/editorial", editorialRoutes);

app.use("/newsletter", newsletterRoutes);

app.use("/products", productRoutes);

app.use("/reviews", reviewRoutes);

app.use("/promos", promoRoutes);

app.use("/cart", cartRoutes);

app.use("/orders", orderRoutes);

app.use("/admin", adminRoutes);

app.use("/notifications", notificationRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Tosion Fashion API is running",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);

    res.status(500).json({
      message: "Internal server error",
    });
  },
);

// =====================================================
// DATABASE + SERVER
// =====================================================

const startServer = async () => {
  try {
    await connectDB();

    // Seed welcome promo code
    await PromoCode.findOneAndUpdate(
      { code: "WELCOME10" },
      {
        code: "WELCOME10",
        type: "percent",
        value: 10,
        minOrder: 0,
        maxUses: 0,
        enabled: true,
      },
      {
        upsert: true,
        new: true,
      },
    );

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
      console.log("MongoDB connected");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();