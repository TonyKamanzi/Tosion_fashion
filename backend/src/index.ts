import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import session from "express-session"
import authRoutes from "./routes/auth.routes.js"
import cors from "cors"

dotenv.config();


// middleware
const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
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