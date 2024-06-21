import { desc, eq } from "drizzle-orm";
import express from "express";

import { db } from "@/db/drizzle";
import { users } from "@/db/drizzle/schema";
import { orderByMiddleware } from "@/middlewares";

export const usersRouter = express.Router();

// Create a new user
usersRouter.post("/", async (req, res) => {
  const { username, email, passwordHash } = req.body;
  try {
    const newUser = await db
      .insert(users)
      .values({ username, email, passwordHash })
      .returning();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single user by ID
usersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const intId = parseInt(id, 10);

  try {
    const user = await db.select().from(users).where(eq(users.id, intId));
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by ID
usersRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const intId = parseInt(id, 10);
  const { username, email, passwordHash } = req.body;
  try {
    const updatedUser = await db
      .update(users)
      .set({ username, email, passwordHash })
      .where(eq(users.id, intId))
      .returning();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
usersRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const intId = parseInt(id, 10);
  try {
    await db.delete(users).where(eq(users.id, intId));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
usersRouter.get("/", orderByMiddleware, async (_req, res) => {
  const { orderByColumn, orderByDirection } = res.locals;

  const orderByCb =
    orderByDirection === "desc"
      ? desc(users[orderByColumn])
      : users[orderByColumn];

  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(orderByCb);

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});