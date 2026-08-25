import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { loadEnvFile } from "node:process";

import User from "./models/User.js";
import { hashPassword, verifyPassword } from "./utils/password.js";
import { createAuthToken } from "./utils/auth.js";
import { requireAuth } from "./middleware/requireAuth.js";

loadEnvFile();

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = 3000;

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/api/users", async (_req, res) => {
  try {
    const users = await User.find().select(
      "name email createdAt updatedAt",
    );

    return res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);

    return res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Failed to register user:", error);

    return res.status(500).json({
      message: "Failed to register user",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordIsValid = await verifyPassword(
      password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = await createAuthToken(
      user._id.toString(),
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Failed to login:", error);

    return res.status(500).json({
      message: "Failed to login",
    });
  }
});

app.get(
  "/api/auth/me",
  requireAuth,
  async (_req, res) => {
    try {
      const user = await User.findById(
        res.locals.userId,
      ).select("name email createdAt");

      if (!user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      return res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error(
        "Failed to fetch current user:",
        error,
      );

      return res.status(500).json({
        message: "Failed to fetch current user",
      });
    }
  },
);

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    await mongoose.connect(mongoUri);

    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error(
      "Failed to connect to MongoDB:",
      error,
    );

    process.exit(1);
  }
}

startServer();