import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { loadEnvFile } from "node:process";

import User from "./models/User.js";
import { hashPassword, verifyPassword } from "./utils/password.js";
import { createAuthToken } from "./utils/auth.js";
import { requireAuth } from "./middleware/requireAuth.js";
import Group from "./models/Group.js";
import Expense from "./models/Expense.js";
import { splitAmountEqually } from "./utils/splitExpense.js";
import { calculateBalances } from "./utils/calculateBalances.js";
import { calculateSettlements } from "./utils/calculateSettlements.js";

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

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    message: "Logged out",
  });
});

app.post("/api/groups", requireAuth, async (req, res) => {
  try {
    const { name, currency } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof currency !== "string"
    ) {
      return res.status(400).json({
        message: "Name and currency are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedCurrency = currency.trim().toUpperCase();

    if (!normalizedName || !normalizedCurrency) {
      return res.status(400).json({
        message: "Name and currency are required",
      });
    }

    const userId = res.locals.userId;

    const group = await Group.create({
      name: normalizedName,
      currency: normalizedCurrency,
      createdBy: userId,
      members: [userId],
    });

    return res.status(201).json({
      id: group._id,
      name: group.name,
      currency: group.currency,
      createdBy: group.createdBy,
      members: group.members,
      createdAt: group.createdAt,
    });
  } catch (error) {
    console.error("Failed to create group:", error);

    return res.status(500).json({
      message: "Failed to create group",
    });
  }
});

app.get("/api/groups", requireAuth, async (_req, res) => {
  try {
    const userId = res.locals.userId;

    const groups = await Group.find({
      members: userId,
    }).select(
      "name currency createdBy members createdAt updatedAt",
    );

    return res.status(200).json(groups);
  } catch (error) {
    console.error("Failed to fetch groups:", error);

    return res.status(500).json({
      message: "Failed to fetch groups",
    });
  }
});

app.get("/api/groups/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = res.locals.userId;

    const group = await Group.findOne({
      _id: id,
      members: userId,
    }).select(
      "name currency createdBy members createdAt updatedAt",
    );

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    return res.status(200).json(group);
  } catch (error) {
    console.error("Failed to fetch group:", error);

    return res.status(500).json({
      message: "Failed to fetch group",
    });
  }
});

app.post(
  "/api/groups/:id/members",
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body ?? {};
      const userId = res.locals.userId;

      if (typeof email !== "string") {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const group = await Group.findOne({
        _id: id,
        createdBy: userId,
      });

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      const member = await User.findOne({
        email: normalizedEmail,
      });

      if (!member) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const isAlreadyMember = group.members.some((memberId) =>
        memberId.equals(member._id),
      );

      if (isAlreadyMember) {
        return res.status(409).json({
          message: "User is already a member",
        });
      }

      group.members.push(member._id);

      await group.save();

      return res.status(200).json({
        id: group._id,
        name: group.name,
        currency: group.currency,
        createdBy: group.createdBy,
        members: group.members,
        updatedAt: group.updatedAt,
      });
    } catch (error) {
      console.error("Failed to add group member:", error);

      return res.status(500).json({
        message: "Failed to add group member",
      });
    }
  },
);

app.delete(
  "/api/groups/:id/members/:memberId",
  requireAuth,
  async (req, res) => {
    try {
      const { id, memberId } = req.params;
      const userId = res.locals.userId;

            if (
        typeof id !== "string" ||
        typeof memberId !== "string"
      ) {
        return res.status(400).json({
          message: "Invalid group or member ID",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(memberId)
      ) {
        return res.status(400).json({
          message: "Invalid group or member ID",
        });
      }

      const group = await Group.findOne({
        _id: id,
        createdBy: userId,
      });

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      if (group.createdBy.equals(memberId)) {
        return res.status(400).json({
          message: "Group creator cannot be removed",
        });
      }

      const memberExists = group.members.some((id) =>
        id.equals(memberId),
      );

      if (!memberExists) {
        return res.status(404).json({
          message: "Member not found in group",
        });
      }

      group.members = group.members.filter(
        (id) => !id.equals(memberId),
      );

      await group.save();

      return res.status(200).json({
        id: group._id,
        name: group.name,
        members: group.members,
        updatedAt: group.updatedAt,
      });
    } catch (error) {
      console.error("Failed to remove group member:", error);

      return res.status(500).json({
        message: "Failed to remove group member",
      });
    }
  },
);


app.post(
  "/api/groups/:id/expenses",
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { description, amountCents, paidBy } =
        req.body ?? {};

      const userId = res.locals.userId;

      if (typeof id !== "string") {
        return res.status(400).json({
          message: "Invalid group ID",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid group ID",
        });
      }

      if (
        typeof description !== "string" ||
        typeof amountCents !== "number" ||
        typeof paidBy !== "string"
      ) {
        return res.status(400).json({
          message:
            "Description, amountCents and paidBy are required",
        });
      }

      const normalizedDescription = description.trim();

      if (!normalizedDescription) {
        return res.status(400).json({
          message: "Description is required",
        });
      }

      if (
        !Number.isInteger(amountCents) ||
        amountCents <= 0
      ) {
        return res.status(400).json({
          message:
            "amountCents must be a positive integer",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(paidBy)) {
        return res.status(400).json({
          message: "Invalid paidBy user ID",
        });
      }

      const group = await Group.findOne({
        _id: id,
        members: userId,
      });

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      const payerIsMember = group.members.some(
        (memberId) => memberId.equals(paidBy),
      );

      if (!payerIsMember) {
        return res.status(400).json({
          message: "Payer must be a group member",
        });
      }

      const memberIds = group.members.map((memberId) =>
        memberId.toString(),
      );

      const splits = splitAmountEqually(
        amountCents,
        memberIds,
      );

      const expense = await Expense.create({
        group: group._id,
        description: normalizedDescription,
        amountCents,
        paidBy,
        splits,
        createdBy: userId,
      });

      return res.status(201).json(expense);
    } catch (error) {
      console.error("Failed to create expense:", error);

      return res.status(500).json({
        message: "Failed to create expense",
      });
    }
  },
);

app.get(
  "/api/groups/:id/expenses",
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = res.locals.userId;

      if (typeof id !== "string") {
        return res.status(400).json({
          message: "Invalid group ID",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid group ID",
        });
      }

      const group = await Group.findOne({
        _id: id,
        members: userId,
      });

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      const expenses = await Expense.find({
        group: id,
      })
        .select(
          "description amountCents paidBy splits createdBy createdAt updatedAt",
        )
        .sort({ createdAt: -1 });

      return res.status(200).json(expenses);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);

      return res.status(500).json({
        message: "Failed to fetch expenses",
      });
    }
  },
);

app.get(
  "/api/groups/:id/balances",
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = res.locals.userId;

      if (typeof id !== "string") {
        return res.status(400).json({
          message: "Invalid group ID",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid group ID",
        });
      }

      const group = await Group.findOne({
        _id: id,
        members: userId,
      });

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      const expenses = await Expense.find({
        group: id,
      });

      const balanceExpenses = expenses.map((expense) => {
        return {
          amountCents: expense.amountCents,

          paidBy: expense.paidBy.toString(),

          splits: expense.splits.map((split) => {
            return {
              user: split.user.toString(),
              amountCents: split.amountCents,
            };
          }),
        };
      });

      const balances = calculateBalances(
        balanceExpenses,
      );

      return res.status(200).json(balances);
    } catch (error) {
      console.error(
        "Failed to calculate balances:",
        error,
      );

      return res.status(500).json({
        message: "Failed to calculate balances",
      });
    }
  },
);

app.get(
  "/api/groups/:id/settlements",
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = res.locals.userId;

      if (typeof id !== "string") {
        return res.status(400).json({
          message: "Invalid group ID",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid group ID",
        });
      }

      const group = await Group.findOne({
        _id: id,
        members: userId,
      });

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      const expenses = await Expense.find({
        group: id,
      });

      const balanceExpenses = expenses.map((expense) => {
        return {
          amountCents: expense.amountCents,

          paidBy: expense.paidBy.toString(),

          splits: expense.splits.map((split) => {
            return {
              user: split.user.toString(),
              amountCents: split.amountCents,
            };
          }),
        };
      });

      const balances = calculateBalances(
        balanceExpenses,
      );

      const settlements = calculateSettlements(
        balances,
      );

      return res.status(200).json(settlements);
    } catch (error) {
      console.error(
        "Failed to calculate settlements:",
        error,
      );

      return res.status(500).json({
        message: "Failed to calculate settlements",
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