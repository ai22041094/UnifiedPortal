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
  phone: text("phone"),
  department: text("department"),
  designation: text("designation"),
  profilePhoto: text("profile_photo"),
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
  phone: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  profilePhoto: z.string().optional().nullable(),
  roleId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isSystem: z.boolean().optional().default(false),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = insertUserSchema.partial().omit({ password: true, isSystem: true });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ChangePassword = z.infer<typeof changePasswordSchema>;

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

// Organization Settings table
export const organizationSettings = pgTable("organization_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  organizationName: text("organization_name").notNull().default("pcvisor"),
  tagline: text("tagline"),
  website: text("website"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  postalCode: text("postal_code"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#0066FF"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#6366F1"),
  footerText: text("footer_text"),
  copyrightText: text("copyright_text"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedByUserId: varchar("updated_by_user_id").references(() => users.id),
});

export const insertOrganizationSettingsSchema = createInsertSchema(organizationSettings, {
  organizationName: z.string().min(1, "Organization name is required").max(100),
  tagline: z.string().max(200).optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional().nullable(),
  footerText: z.string().max(500).optional().nullable(),
  copyrightText: z.string().max(200).optional().nullable(),
}).omit({
  id: true,
  updatedAt: true,
  updatedByUserId: true,
});

export const updateOrganizationSettingsSchema = insertOrganizationSettingsSchema.partial();

export type InsertOrganizationSettings = z.infer<typeof insertOrganizationSettingsSchema>;
export type UpdateOrganizationSettings = z.infer<typeof updateOrganizationSettingsSchema>;
export type OrganizationSettings = typeof organizationSettings.$inferSelect;

// Notification Settings table
export const notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(true),
  smtpHost: text("smtp_host"),
  smtpPort: text("smtp_port").default("587"),
  smtpUsername: text("smtp_username"),
  smtpPassword: text("smtp_password"),
  smtpFromEmail: text("smtp_from_email"),
  smtpFromName: text("smtp_from_name"),
  smtpSecure: boolean("smtp_secure").default(true),
  inAppNotificationsEnabled: boolean("in_app_notifications_enabled").default(true),
  pushNotificationsEnabled: boolean("push_notifications_enabled").default(false),
  notifyOnUserCreated: boolean("notify_on_user_created").default(true),
  notifyOnUserDeleted: boolean("notify_on_user_deleted").default(true),
  notifyOnPasswordChange: boolean("notify_on_password_change").default(true),
  notifyOnLoginFailure: boolean("notify_on_login_failure").default(false),
  notifyOnRoleChange: boolean("notify_on_role_change").default(true),
  adminEmailRecipients: text("admin_email_recipients"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedByUserId: varchar("updated_by_user_id").references(() => users.id),
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings, {
  emailNotificationsEnabled: z.boolean().default(true),
  smtpHost: z.string().max(255).optional().nullable(),
  smtpPort: z.string().max(10).default("587").optional().nullable(),
  smtpUsername: z.string().max(255).optional().nullable(),
  smtpPassword: z.string().max(255).optional().nullable(),
  smtpFromEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  smtpFromName: z.string().max(100).optional().nullable(),
  smtpSecure: z.boolean().default(true),
  inAppNotificationsEnabled: z.boolean().default(true),
  pushNotificationsEnabled: z.boolean().default(false),
  notifyOnUserCreated: z.boolean().default(true),
  notifyOnUserDeleted: z.boolean().default(true),
  notifyOnPasswordChange: z.boolean().default(true),
  notifyOnLoginFailure: z.boolean().default(false),
  notifyOnRoleChange: z.boolean().default(true),
  adminEmailRecipients: z.string().max(1000).optional().nullable(),
}).omit({
  id: true,
  updatedAt: true,
  updatedByUserId: true,
});

export const updateNotificationSettingsSchema = insertNotificationSettingsSchema.partial();

export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type UpdateNotificationSettings = z.infer<typeof updateNotificationSettingsSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;

// Push Subscriptions table for web push notifications
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions, {
  userId: z.string(),
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string(),
  userAgent: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
