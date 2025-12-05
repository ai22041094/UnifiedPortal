import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).pick({
  username: true,
  password: true,
});

export const selectUserSchema = createSelectSchema(users).omit({
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, 'password'>;
