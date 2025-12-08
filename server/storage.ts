import { 
  type User, 
  type InsertUser, 
  type UpdateUser,
  type Role, 
  type InsertRole,
  type ApiKey,
  type InsertApiKey,
  type InsertProcessDetails,
  users, 
  roles,
  epmApiKeys,
  pcvProcessDetails
} from "@shared/schema";
import { eq, and, isNull, gt } from "drizzle-orm";
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
}

export const storage = new PostgresStorage();
