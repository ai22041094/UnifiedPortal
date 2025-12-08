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

// Notifications table for in-app notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull().default("info"),
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications, {
  userId: z.string(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["ticket", "asset", "license", "user", "info", "warning", "error"]).default("info"),
  isRead: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
});

export const updateNotificationSchema = insertNotificationSchema.partial().pick({ isRead: true });

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Security Settings table
export const securitySettings = pgTable("security_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  minPasswordLength: text("min_password_length").default("8"),
  requireUppercase: boolean("require_uppercase").default(true),
  requireLowercase: boolean("require_lowercase").default(true),
  requireNumbers: boolean("require_numbers").default(true),
  requireSpecialChars: boolean("require_special_chars").default(true),
  passwordExpiryDays: text("password_expiry_days").default("90"),
  passwordHistoryCount: text("password_history_count").default("5"),
  maxLoginAttempts: text("max_login_attempts").default("5"),
  lockoutDurationMinutes: text("lockout_duration_minutes").default("30"),
  sessionTimeoutMinutes: text("session_timeout_minutes").default("60"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaMethod: varchar("mfa_method", { length: 50 }).default("email"),
  ipWhitelistEnabled: boolean("ip_whitelist_enabled").default(false),
  ipWhitelist: text("ip_whitelist"),
  auditLogRetentionDays: text("audit_log_retention_days").default("365"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedByUserId: varchar("updated_by_user_id").references(() => users.id),
});

export const insertSecuritySettingsSchema = createInsertSchema(securitySettings, {
  minPasswordLength: z.string().default("8"),
  requireUppercase: z.boolean().default(true),
  requireLowercase: z.boolean().default(true),
  requireNumbers: z.boolean().default(true),
  requireSpecialChars: z.boolean().default(true),
  passwordExpiryDays: z.string().default("90"),
  passwordHistoryCount: z.string().default("5"),
  maxLoginAttempts: z.string().default("5"),
  lockoutDurationMinutes: z.string().default("30"),
  sessionTimeoutMinutes: z.string().default("60"),
  mfaEnabled: z.boolean().default(false),
  mfaMethod: z.enum(["email", "totp", "sms"]).default("email"),
  ipWhitelistEnabled: z.boolean().default(false),
  ipWhitelist: z.string().optional().nullable(),
  auditLogRetentionDays: z.string().default("365"),
}).omit({
  id: true,
  updatedAt: true,
  updatedByUserId: true,
});

export const updateSecuritySettingsSchema = insertSecuritySettingsSchema.partial();

export type InsertSecuritySettings = z.infer<typeof insertSecuritySettingsSchema>;
export type UpdateSecuritySettings = z.infer<typeof updateSecuritySettingsSchema>;
export type SecuritySettings = typeof securitySettings.$inferSelect;

// Audit Logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::varchar`),
  userId: varchar("user_id").references(() => users.id),
  username: text("username"),
  action: varchar("action", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }),
  resourceId: varchar("resource_id", { length: 100 }),
  resourceName: text("resource_name"),
  details: text("details"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  status: varchar("status", { length: 20 }).default("success"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs, {
  userId: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  action: z.string().min(1).max(100),
  category: z.enum(["auth", "user", "role", "settings", "security", "system", "data"]),
  resourceType: z.string().max(100).optional().nullable(),
  resourceId: z.string().max(100).optional().nullable(),
  resourceName: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
  ipAddress: z.string().max(45).optional().nullable(),
  userAgent: z.string().optional().nullable(),
  status: z.enum(["success", "failure", "warning"]).default("success"),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
