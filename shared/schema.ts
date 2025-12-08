import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Roles table
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Users table with role reference
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  roleId: varchar("role_id").references(() => roles.id),
  isActive: boolean("is_active").default(true),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Role schemas
export const insertRoleSchema = createInsertSchema(roles, {
  name: z.string().min(2, "Role name must be at least 2 characters").max(50),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRoleSchema = insertRoleSchema.partial();

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// User schemas
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address").optional().nullable(),
  fullName: z.string().optional().nullable(),
  roleId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isSystem: z.boolean().optional().default(false),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = insertUserSchema.partial().omit({ password: true, isSystem: true });

export const selectUserSchema = createSelectSchema(users).omit({
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, 'password'>;

// EPM Module - Process Details table
export const pcvProcessDetails = pgTable("pcv_process_details", {
  id: serial("id"),
  taskGuid: varchar("task_guid", { length: 50 }).primaryKey().notNull(),
  agentGuid: numeric("agent_guid", { precision: 26 }),
  processId: varchar("process_id", { length: 100 }),
  processName: varchar("process_name", { length: 500 }),
  mainWindowTitle: varchar("main_window_title", { length: 500 }),
  startTime: timestamp("start_time", { withTimezone: true }),
  eventDt: timestamp("event_dt", { withTimezone: true }),
  idleStatus: boolean("idle_status"),
  urlName: varchar("url_name", { length: 1000 }),
  urlVisitCount: varchar("url_visit_count", { length: 25 }),
  urlDomain: varchar("url_domain", { length: 200 }),
  lapsedTime: varchar("lapsed_time", { length: 25 }),
  tag1: varchar("tag1", { length: 100 }),
  tag2: varchar("tag2", { length: 100 }),
});

// Process Details schemas
export const insertProcessDetailsSchema = createInsertSchema(pcvProcessDetails, {
  taskGuid: z.string().max(50),
  agentGuid: z.string().optional().nullable(),
  processId: z.string().max(100).optional().nullable(),
  processName: z.string().max(500).optional().nullable(),
  mainWindowTitle: z.string().max(500).optional().nullable(),
  urlName: z.string().max(1000).optional().nullable(),
  urlVisitCount: z.string().max(25).optional().nullable(),
  urlDomain: z.string().max(200).optional().nullable(),
  lapsedTime: z.string().max(25).optional().nullable(),
  tag1: z.string().max(100).optional().nullable(),
  tag2: z.string().max(100).optional().nullable(),
  idleStatus: z.boolean().optional().nullable(),
}).omit({
  id: true,
});

export const updateProcessDetailsSchema = insertProcessDetailsSchema.partial().omit({ taskGuid: true });

export type InsertProcessDetails = z.infer<typeof insertProcessDetailsSchema>;
export type UpdateProcessDetails = z.infer<typeof updateProcessDetailsSchema>;
export type ProcessDetails = typeof pcvProcessDetails.$inferSelect;

// API Keys table for external integrations
export const epmApiKeys = pgTable("epm_api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  lastFour: varchar("last_four", { length: 4 }).notNull(),
  createdByUserId: varchar("created_by_user_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertApiKeySchema = createInsertSchema(epmApiKeys, {
  name: z.string().min(1, "Name is required").max(100),
  keyHash: z.string(),
  lastFour: z.string().length(4),
  createdByUserId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.date().optional().nullable(),
}).omit({
  id: true,
  lastUsedAt: true,
  createdAt: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof epmApiKeys.$inferSelect;

// External payload schema for process details ingestion (maps external field names to internal)
export const externalProcessDetailsSchema = z.object({
  taskguid: z.string().max(50),
  agentGuid: z.string().optional().nullable(),
  ProcessId: z.string().max(100).optional().nullable(),
  ProcessName: z.string().max(500).optional().nullable(),
  MainWindowTitle: z.string().max(500).optional().nullable(),
  StartTime: z.string().optional().nullable(),
  Eventdt: z.string().optional().nullable(),
  IdleStatus: z.union([z.number(), z.boolean()]).optional().nullable(),
  Urlname: z.string().max(1000).optional().nullable(),
  UrlDomain: z.string().max(200).optional().nullable(),
  TimeLapsed: z.union([z.number(), z.string()]).optional().nullable(),
  tag1: z.string().max(100).optional().nullable(),
  Tag2: z.string().max(100).optional().nullable(),
});

export type ExternalProcessDetails = z.infer<typeof externalProcessDetailsSchema>;
