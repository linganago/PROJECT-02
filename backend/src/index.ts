import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";

import "./config/passport.config";
import passport from "passport";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.route";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import { passportAuthenticateJWT } from "./config/passport.config";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie-session
app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

/* -------------------------------------------
   🔥 UPDATED CORS CONFIG (FULL FIX)
------------------------------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  // Your main Vercel domain
  "https://team-sync1.vercel.app",

  // Your current preview deployment domain
  "https://team-sync1-linganagoudas-projects-8a784c04.vercel.app",
];

// CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server requests or mobile apps (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ CORS BLOCKED ORIGIN:", origin);
      return callback(new Error("CORS not allowed for this origin"));
    },
    credentials: true,
  })
);

// Preflight request support
app.options("*", cors());

/* -------------------------------------------
   ROUTES
------------------------------------------- */

// Public
app.get("/", (req, res) => {
  return res.status(HTTPSTATUS.OK).json({
    status: "ok",
    message: "Backend running successfully",
  });
});

// Protected routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJWT, userRoutes);
app.use(`${BASE_PATH}/workspace`, passportAuthenticateJWT, workspaceRoutes);
app.use(`${BASE_PATH}/member`, passportAuthenticateJWT, memberRoutes);
app.use(`${BASE_PATH}/project`, passportAuthenticateJWT, projectRoutes);
app.use(`${BASE_PATH}/task`, passportAuthenticateJWT, taskRoutes);

// Error handler
app.use(errorHandler);

// Start Server
app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
