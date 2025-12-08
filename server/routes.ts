import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { hashPassword, getSafeUser } from "./auth";
import { insertUserSchema, insertRoleSchema, updateRoleSchema, updateUserSchema, externalProcessDetailsSchema, type SafeUser, type InsertProcessDetails } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user as SafeUser;
  
  if (user.username === "admin") {
    return next();
  }
  
  if (user.roleId) {
    const role = await storage.getRole(user.roleId);
    if (role?.name?.toLowerCase() === "admin") {
      return next();
    }
    
    const permissions = (role?.permissions as string[]) || [];
    if (permissions.includes("admin.user-master") || permissions.includes("admin.role-master")) {
      return next();
    }
  }
  
  return res.status(403).json({ message: "Access denied. Admin privileges required." });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint for Docker/K8s
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const { username, password, email, fullName, roleId } = result.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
        roleId,
        isActive: true,
        isSystem: false,
      });

      req.login(getSafeUser(user), (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          message: "Registration successful",
          user: getSafeUser(user)
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SafeUser | false, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          message: info?.message || "Invalid username or password"
        });
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          message: "Login successful",
          user
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/user", requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  app.get("/api/auth/permissions", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as SafeUser;
      
      if (user.username === "admin") {
        return res.json({ 
          permissions: ["*"], 
          isAdmin: true,
          roleName: "Admin"
        });
      }
      
      if (user.roleId) {
        const role = await storage.getRole(user.roleId);
        if (role) {
          const isAdmin = role.name?.toLowerCase() === "admin";
          return res.json({ 
            permissions: (role.permissions as string[]) || [],
            isAdmin,
            roleName: role.name
          });
        }
      }
      
      res.json({ permissions: [], isAdmin: false, roleName: null });
    } catch (error) {
      next(error);
    }
  });

  // Role routes
  app.get("/api/roles", requireAdmin, async (req, res, next) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/roles/:id", requireAdmin, async (req, res, next) => {
    try {
      const role = await storage.getRole(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/roles", requireAdmin, async (req, res, next) => {
    try {
      const result = insertRoleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const existingRole = await storage.getRoleByName(result.data.name);
      if (existingRole) {
        return res.status(400).json({ message: "Role name already exists" });
      }

      const role = await storage.createRole(result.data);
      res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/roles/:id", requireAdmin, async (req, res, next) => {
    try {
      const result = updateRoleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      if (result.data.name) {
        const existingRole = await storage.getRoleByName(result.data.name);
        if (existingRole && existingRole.id !== req.params.id) {
          return res.status(400).json({ message: "Role name already exists" });
        }
      }

      const role = await storage.updateRole(req.params.id, result.data);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/roles/:id", requireAdmin, async (req, res, next) => {
    try {
      const deleted = await storage.deleteRole(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // User management routes
  app.get("/api/users", requireAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(getSafeUser);
      res.json(safeUsers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(getSafeUser(user));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", requireAdmin, async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(result.data.password);
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
        isActive: result.data.isActive ?? true,
        isSystem: false,
      });
      res.status(201).json(getSafeUser(user));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const result = updateUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      if (result.data.username) {
        const existingUser = await storage.getUserByUsername(result.data.username);
        if (existingUser && existingUser.id !== req.params.id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      const user = await storage.updateUser(req.params.id, result.data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(getSafeUser(user));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      if (currentUser.id === req.params.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const userToDelete = await storage.getUser(req.params.id);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }

      if (userToDelete.isSystem) {
        return res.status(403).json({ message: "Cannot delete system user" });
      }

      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Password reset route
  app.patch("/api/users/:id/password", requireAdmin, async (req, res, next) => {
    try {
      const schema = z.object({
        password: z.string().min(6, "Password must be at least 6 characters"),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const hashedPassword = await hashPassword(result.data.password);
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Directly update the password using db
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, req.params.id));
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  });

  // ============================================
  // EPM API Key Management Routes
  // ============================================

  // Get all API keys
  app.get("/api/epm/api-keys", requireAdmin, async (req, res, next) => {
    try {
      const keys = await storage.getAllActiveApiKeys();
      const safeKeys = keys.map(key => ({
        id: key.id,
        name: key.name,
        lastFour: key.lastFour,
        createdByUserId: key.createdByUserId,
        isActive: key.isActive,
        lastUsedAt: key.lastUsedAt,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      }));
      res.json(safeKeys);
    } catch (error) {
      next(error);
    }
  });

  // Create new API key
  app.post("/api/epm/api-keys", requireAdmin, async (req, res, next) => {
    try {
      const schema = z.object({
        name: z.string().min(1, "Name is required").max(100),
        expiresAt: z.string().datetime().optional().nullable(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const rawKey = `pcv_${crypto.randomBytes(32).toString('hex')}`;
      const keyHash = await bcrypt.hash(rawKey, 10);
      const lastFour = rawKey.slice(-4);

      const currentUser = req.user as SafeUser;
      
      const apiKey = await storage.createApiKey({
        name: result.data.name,
        keyHash,
        lastFour,
        createdByUserId: currentUser.id,
        isActive: true,
        expiresAt: result.data.expiresAt ? new Date(result.data.expiresAt) : null,
      });

      res.status(201).json({
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey,
        lastFour: apiKey.lastFour,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
        message: "Save this key securely. It will not be shown again.",
      });
    } catch (error) {
      next(error);
    }
  });

  // Revoke API key
  app.delete("/api/epm/api-keys/:id", requireAdmin, async (req, res, next) => {
    try {
      const revoked = await storage.revokeApiKey(req.params.id);
      if (!revoked) {
        return res.status(404).json({ message: "API key not found" });
      }
      res.json({ message: "API key revoked successfully" });
    } catch (error) {
      next(error);
    }
  });

  // ============================================
  // External API Endpoints (API Key Protected)
  // ============================================

  // Middleware for API key authentication
  async function requireApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ message: "API key required. Include x-api-key header." });
    }

    try {
      const keys = await storage.getAllActiveApiKeys();
      
      for (const key of keys) {
        const isValid = await bcrypt.compare(apiKey, key.keyHash);
        if (isValid) {
          if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
            return res.status(401).json({ message: "API key has expired" });
          }
          
          await storage.updateApiKeyLastUsed(key.id);
          return next();
        }
      }

      return res.status(401).json({ message: "Invalid API key" });
    } catch (error) {
      next(error);
    }
  }

  // External Process Details Ingestion Endpoint
  app.post("/api/external/epm/process-details", requireApiKey, async (req, res, next) => {
    try {
      const result = externalProcessDetailsSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString(),
          errors: result.error.errors
        });
      }

      const data = result.data;
      
      const parseDate = (dateStr: string | null | undefined): Date | null => {
        if (!dateStr) return null;
        
        // Try standard Date parsing first
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
        
        // Fallback: Parse "DD Month YYYY HH:MM:SS" format (e.g., "16 July 2025 11:58:38")
        const parts = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)\s+(\d+):(\d+):(\d+)/);
        if (parts) {
          const [, day, month, year, hours, minutes, seconds] = parts;
          const monthMap: Record<string, number> = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
            'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
          };
          const monthNum = monthMap[month];
          if (monthNum !== undefined) {
            return new Date(parseInt(year), monthNum, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
          }
        }
        
        // Return null if parsing completely fails
        return null;
      };

      const processDetails: InsertProcessDetails = {
        taskGuid: data.taskguid,
        agentGuid: data.agentGuid || null,
        processId: data.ProcessId || null,
        processName: data.ProcessName || null,
        mainWindowTitle: data.MainWindowTitle || null,
        startTime: parseDate(data.StartTime),
        eventDt: parseDate(data.Eventdt),
        idleStatus: typeof data.IdleStatus === 'number' ? data.IdleStatus !== 0 : (data.IdleStatus ?? false),
        urlName: data.Urlname || null,
        urlDomain: data.UrlDomain || null,
        lapsedTime: data.TimeLapsed?.toString() || null,
        tag1: data.tag1 || null,
        tag2: data.Tag2 || null,
      };

      await storage.upsertProcessDetails(processDetails);

      res.status(201).json({ 
        message: "Process details ingested successfully",
        taskGuid: data.taskguid
      });
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
