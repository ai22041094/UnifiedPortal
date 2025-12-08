import { 
  type User, 
  type InsertUser, 
  type UpdateUser,
  type Role, 
  type InsertRole,
  type ApiKey,
  type InsertApiKey,
  type InsertProcessDetails,
  type ProcessDetails,
  type OrganizationSettings,
  type UpdateOrganizationSettings,
  type NotificationSettings,
  type UpdateNotificationSettings,
  type PushSubscription,
  type InsertPushSubscription,
  type Notification,
  type InsertNotification,
  type SecuritySettings,
  type UpdateSecuritySettings,
  type AuditLog,
  type InsertAuditLog,
  users, 
  roles,
  epmApiKeys,
  pcvProcessDetails,
  organizationSettings,
  notificationSettings,
  pushSubscriptions,
  notifications,
  securitySettings,
  auditLogs
} from "@shared/schema";
import { eq, and, isNull, gt, desc, gte, lte, or, ilike } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Role methods
  getRole(id: string): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, data: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;
  
  // API Key methods
  getApiKey(id: string): Promise<ApiKey | undefined>;
  getActiveApiKeyByHash(keyHash: string): Promise<ApiKey | undefined>;
  getAllActiveApiKeys(): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  revokeApiKey(id: string): Promise<boolean>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  
  // Process Details methods
  createProcessDetails(data: InsertProcessDetails): Promise<void>;
  upsertProcessDetails(data: InsertProcessDetails): Promise<void>;
  getAllProcessDetails(limit?: number): Promise<ProcessDetails[]>;
  
  // Organization Settings methods
  getOrganizationSettings(): Promise<OrganizationSettings | undefined>;
  updateOrganizationSettings(data: UpdateOrganizationSettings, updatedByUserId: string): Promise<OrganizationSettings>;
  
  // Notification Settings methods
  getNotificationSettings(): Promise<NotificationSettings | undefined>;
  updateNotificationSettings(data: UpdateNotificationSettings, updatedByUserId: string): Promise<NotificationSettings>;
  
  // Push Subscription methods
  getPushSubscription(endpoint: string): Promise<PushSubscription | undefined>;
  getPushSubscriptionsByUserId(userId: string): Promise<PushSubscription[]>;
  getAllActivePushSubscriptions(): Promise<PushSubscription[]>;
  createPushSubscription(data: InsertPushSubscription): Promise<PushSubscription>;
  deletePushSubscription(endpoint: string): Promise<boolean>;
  deletePushSubscriptionsByUserId(userId: string): Promise<boolean>;
  
  // Notification methods
  getNotificationsByUserId(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<number>;
  deleteNotification(id: string, userId: string): Promise<boolean>;
  
  // Security Settings methods
  getSecuritySettings(): Promise<SecuritySettings | undefined>;
  updateSecuritySettings(data: UpdateSecuritySettings, updatedByUserId: string): Promise<SecuritySettings>;
  
  // Audit Log methods
  getAuditLogs(filters?: {
    category?: string;
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }>;
  createAuditLog(data: InsertAuditLog): Promise<AuditLog>;
  deleteOldAuditLogs(beforeDate: Date): Promise<number>;
}

export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Role methods
  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return role;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return db.select().from(roles);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(insertRole).returning();
    return role;
  }

  async updateRole(id: string, data: Partial<InsertRole>): Promise<Role | undefined> {
    const [role] = await db
      .update(roles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return role;
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id)).returning();
    return result.length > 0;
  }

  // API Key methods
  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(epmApiKeys).where(eq(epmApiKeys.id, id)).limit(1);
    return key;
  }

  async getActiveApiKeyByHash(keyHash: string): Promise<ApiKey | undefined> {
    const [key] = await db
      .select()
      .from(epmApiKeys)
      .where(
        and(
          eq(epmApiKeys.keyHash, keyHash),
          eq(epmApiKeys.isActive, true)
        )
      )
      .limit(1);
    return key;
  }

  async getAllActiveApiKeys(): Promise<ApiKey[]> {
    return db
      .select()
      .from(epmApiKeys)
      .where(eq(epmApiKeys.isActive, true));
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [key] = await db.insert(epmApiKeys).values(apiKey).returning();
    return key;
  }

  async revokeApiKey(id: string): Promise<boolean> {
    const result = await db
      .update(epmApiKeys)
      .set({ isActive: false })
      .where(eq(epmApiKeys.id, id))
      .returning();
    return result.length > 0;
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db
      .update(epmApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(epmApiKeys.id, id));
  }

  // Process Details methods
  async createProcessDetails(data: InsertProcessDetails): Promise<void> {
    await db.insert(pcvProcessDetails).values(data);
  }

  async upsertProcessDetails(data: InsertProcessDetails): Promise<void> {
    await db
      .insert(pcvProcessDetails)
      .values(data)
      .onConflictDoUpdate({
        target: pcvProcessDetails.taskGuid,
        set: {
          agentGuid: data.agentGuid,
          processId: data.processId,
          processName: data.processName,
          mainWindowTitle: data.mainWindowTitle,
          startTime: data.startTime,
          eventDt: data.eventDt,
          idleStatus: data.idleStatus,
          urlName: data.urlName,
          urlDomain: data.urlDomain,
          lapsedTime: data.lapsedTime,
          tag1: data.tag1,
          tag2: data.tag2,
        },
      });
  }

  async getAllProcessDetails(limit: number = 100): Promise<ProcessDetails[]> {
    return db
      .select()
      .from(pcvProcessDetails)
      .orderBy(desc(pcvProcessDetails.eventDt))
      .limit(limit);
  }

  // Organization Settings methods
  async getOrganizationSettings(): Promise<OrganizationSettings | undefined> {
    const [settings] = await db.select().from(organizationSettings).limit(1);
    return settings;
  }

  async updateOrganizationSettings(data: UpdateOrganizationSettings, updatedByUserId: string): Promise<OrganizationSettings> {
    const existing = await this.getOrganizationSettings();
    
    if (existing) {
      const [updated] = await db
        .update(organizationSettings)
        .set({ ...data, updatedAt: new Date(), updatedByUserId })
        .where(eq(organizationSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(organizationSettings)
        .values({ ...data, updatedByUserId } as any)
        .returning();
      return created;
    }
  }

  // Notification Settings methods
  async getNotificationSettings(): Promise<NotificationSettings | undefined> {
    const [settings] = await db.select().from(notificationSettings).limit(1);
    return settings;
  }

  async updateNotificationSettings(data: UpdateNotificationSettings, updatedByUserId: string): Promise<NotificationSettings> {
    const existing = await this.getNotificationSettings();
    
    if (existing) {
      const [updated] = await db
        .update(notificationSettings)
        .set({ ...data, updatedAt: new Date(), updatedByUserId })
        .where(eq(notificationSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(notificationSettings)
        .values({ ...data, updatedByUserId } as any)
        .returning();
      return created;
    }
  }

  // Push Subscription methods
  async getPushSubscription(endpoint: string): Promise<PushSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);
    return subscription;
  }

  async getPushSubscriptionsByUserId(userId: string): Promise<PushSubscription[]> {
    return db
      .select()
      .from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.isActive, true)));
  }

  async getAllActivePushSubscriptions(): Promise<PushSubscription[]> {
    return db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.isActive, true));
  }

  async createPushSubscription(data: InsertPushSubscription): Promise<PushSubscription> {
    const existing = await this.getPushSubscription(data.endpoint);
    if (existing) {
      const [updated] = await db
        .update(pushSubscriptions)
        .set({ ...data, updatedAt: new Date(), isActive: true })
        .where(eq(pushSubscriptions.endpoint, data.endpoint))
        .returning();
      return updated;
    }
    const [subscription] = await db.insert(pushSubscriptions).values(data).returning();
    return subscription;
  }

  async deletePushSubscription(endpoint: string): Promise<boolean> {
    const result = await db
      .update(pushSubscriptions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .returning();
    return result.length > 0;
  }

  async deletePushSubscriptionsByUserId(userId: string): Promise<boolean> {
    const result = await db
      .update(pushSubscriptions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pushSubscriptions.userId, userId))
      .returning();
    return result.length > 0;
  }

  // Notification methods
  async getNotificationsByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .returning();
    return result.length;
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Security Settings methods
  async getSecuritySettings(): Promise<SecuritySettings | undefined> {
    const [settings] = await db.select().from(securitySettings).limit(1);
    return settings;
  }

  async updateSecuritySettings(data: UpdateSecuritySettings, updatedByUserId: string): Promise<SecuritySettings> {
    const existing = await this.getSecuritySettings();
    
    if (existing) {
      const [updated] = await db
        .update(securitySettings)
        .set({ ...data, updatedAt: new Date(), updatedByUserId })
        .where(eq(securitySettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(securitySettings)
        .values({ ...data, updatedByUserId } as any)
        .returning();
      return created;
    }
  }

  // Audit Log methods
  async getAuditLogs(filters?: {
    category?: string;
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(auditLogs.category, filters.category));
    }
    if (filters?.action) {
      conditions.push(ilike(auditLogs.action, `%${filters.action}%`));
    }
    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters?.startDate) {
      conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(auditLogs.createdAt, filters.endDate));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(auditLogs.action, `%${filters.search}%`),
          ilike(auditLogs.username, `%${filters.search}%`),
          ilike(auditLogs.resourceName, `%${filters.search}%`),
          ilike(auditLogs.details, `%${filters.search}%`)
        )
      );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const totalResult = await db
      .select()
      .from(auditLogs)
      .where(whereClause);
    
    const logs = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);
    
    return { logs, total: totalResult.length };
  }

  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }

  async deleteOldAuditLogs(beforeDate: Date): Promise<number> {
    const result = await db
      .delete(auditLogs)
      .where(lte(auditLogs.createdAt, beforeDate))
      .returning();
    return result.length;
  }
}

export const storage = new PostgresStorage();
