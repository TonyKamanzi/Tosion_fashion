import express from "express";
import dotenv from "dotenv";
import { setDefaultResultOrder } from "node:dns";
import https from "node:https";
import connectDB from "./config/db.js";
import session from "express-session"
import authRoutes from "./routes/auth.routes.js"
import cors from "cors"

dotenv.config();

// prefer IPv4 for outbound requests: the local network announces IPv6 routes
// to Google that black-hole (ETIMEDOUT), breaking the OAuth token exchange.
// Pinning the global HTTPS agent forces every outbound call onto IPv4.
setDefaultResultOrder("ipv4first");
https.globalAgent.options.family = 4;


// middleware
const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}))

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
  },
}));

const PORT = process.env.PORT || 2000;

connectDB();


//routes
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});