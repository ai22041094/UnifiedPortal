import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { hashPassword, getSafeUser } from "./auth";
import { insertUserSchema, insertRoleSchema, updateRoleSchema, updateUserSchema, externalProcessDetailsSchema, changePasswordSchema, updateOrganizationSettingsSchema, updateNotificationSettingsSchema, insertPushSubscriptionSchema, type SafeUser, type InsertProcessDetails } from "@shared/schema";
import webPush from "web-push";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "client", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PNG, JPEG, GIF, SVG, and ICO are allowed."));
    }
  },
});

const authTokens = new Map<string, { userId: string; expiresAt: Date }>();

function generateAuthToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function cleanupExpiredTokens() {
  const now = new Date();
  const entries = Array.from(authTokens.entries());
  for (const [token, data] of entries) {
    if (data.expiresAt < now) {
      authTokens.delete(token);
    }
  }
}

setInterval(cleanupExpiredTokens, 60000);

async function restoreUserFromToken(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const tokenData = authTokens.get(token);
    
    if (tokenData && tokenData.expiresAt > new Date()) {
      const user = await storage.getUser(tokenData.userId);
      if (user) {
        req.user = getSafeUser(user);
        return next();
      }
    }
  }
  
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() && !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() && !req.user) {
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
  app.use(restoreUserFromToken);

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
        
        const token = generateAuthToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        authTokens.set(token, { userId: user.id, expiresAt });
        
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
          }
          return res.json({
            message: "Login successful",
            user,
            token
          });
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

  // Profile routes - for the currently logged in user
  app.get("/api/profile", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(getSafeUser(user));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/profile", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const result = updateUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      // Users cannot change their own username
      const { username, roleId, isActive, ...allowedUpdates } = result.data;

      const user = await storage.updateUser(currentUser.id, allowedUpdates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(getSafeUser(user));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/profile/password", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      
      const result = changePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      // Get the full user with password
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(result.data.currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(result.data.newPassword);
      
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, currentUser.id));
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/profile/photo", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      
      const schema = z.object({
        profilePhoto: z.string(),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const user = await storage.updateUser(currentUser.id, { profilePhoto: result.data.profilePhoto });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(getSafeUser(user));
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

  // Get all ingested process details
  app.get("/api/epm/process-details", requireAdmin, async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const processDetails = await storage.getAllProcessDetails(limit);
      const formattedDetails = processDetails.map(pd => ({
        id: pd.id,
        taskGuid: pd.taskGuid,
        agentGuid: pd.agentGuid,
        processId: pd.processId,
        processName: pd.processName,
        mainWindowTitle: pd.mainWindowTitle,
        startTime: pd.startTime,
        eventDt: pd.eventDt,
        idleStatus: pd.idleStatus,
        urlName: pd.urlName,
        urlVisitCount: pd.urlVisitCount,
        urlDomain: pd.urlDomain,
        lapsedTime: pd.lapsedTime,
        tag1: pd.tag1,
        tag2: pd.tag2,
      }));
      res.json(formattedDetails);
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

  // ============================================
  // Organization Settings Routes
  // ============================================

  // Public endpoint for organization branding (used by login page)
  app.get("/api/organization/public", async (req, res, next) => {
    try {
      const settings = await storage.getOrganizationSettings();
      if (settings) {
        // Return only public-safe fields for branding
        res.json({
          organizationName: settings.organizationName,
          tagline: settings.tagline,
          logoUrl: settings.logoUrl,
          faviconUrl: settings.faviconUrl,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          footerText: settings.footerText,
          copyrightText: settings.copyrightText,
        });
      } else {
        res.json({
          organizationName: "pcvisor",
          tagline: "Unified Access Control & Enterprise Management",
          logoUrl: null,
          faviconUrl: null,
          primaryColor: "#0066FF",
          secondaryColor: "#6366F1",
          footerText: null,
          copyrightText: null,
        });
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/organization", requireAuth, async (req, res, next) => {
    try {
      const settings = await storage.getOrganizationSettings();
      res.json(settings || {});
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/organization", requireAdmin, async (req, res, next) => {
    try {
      const result = updateOrganizationSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const currentUser = req.user as SafeUser;
      const settings = await storage.updateOrganizationSettings(result.data, currentUser.id);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/organization/upload", requireAdmin, upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileType = req.body.type;
      if (!fileType || !["logo", "favicon"].includes(fileType)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Invalid file type. Must be 'logo' or 'favicon'" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const currentUser = req.user as SafeUser;

      const updateData = fileType === "logo" 
        ? { logoUrl: fileUrl }
        : { faviconUrl: fileUrl };

      const settings = await storage.updateOrganizationSettings(updateData, currentUser.id);

      res.json({ 
        message: "File uploaded successfully",
        url: fileUrl,
        settings
      });
    } catch (error) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error("Failed to delete uploaded file:", e);
        }
      }
      next(error);
    }
  });

  app.delete("/api/organization/upload", requireAdmin, async (req, res, next) => {
    try {
      const { type } = req.body;
      if (!type || !["logo", "favicon"].includes(type)) {
        return res.status(400).json({ message: "Invalid type. Must be 'logo' or 'favicon'" });
      }

      const settings = await storage.getOrganizationSettings();
      if (settings) {
        const urlToDelete = type === "logo" ? settings.logoUrl : settings.faviconUrl;
        if (urlToDelete && urlToDelete.startsWith("/uploads/")) {
          const filePath = path.join(uploadDir, path.basename(urlToDelete));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      const currentUser = req.user as SafeUser;
      const updateData = type === "logo" 
        ? { logoUrl: null }
        : { faviconUrl: null };

      const updatedSettings = await storage.updateOrganizationSettings(updateData, currentUser.id);

      res.json({ 
        message: "File deleted successfully",
        settings: updatedSettings
      });
    } catch (error) {
      next(error);
    }
  });

  // ============================================
  // NOTIFICATION SETTINGS ROUTES
  // ============================================

  app.get("/api/notifications", requireAdmin, async (req, res, next) => {
    try {
      const settings = await storage.getNotificationSettings();
      res.json(settings || {});
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/notifications", requireAdmin, async (req, res, next) => {
    try {
      const result = updateNotificationSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const currentUser = req.user as SafeUser;
      const settings = await storage.updateNotificationSettings(result.data, currentUser.id);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/notifications/test-email", requireAdmin, async (req, res, next) => {
    try {
      const settings = await storage.getNotificationSettings();
      if (!settings || !settings.emailNotificationsEnabled) {
        return res.status(400).json({ message: "Email notifications are not enabled" });
      }
      if (!settings.smtpHost || !settings.smtpFromEmail) {
        return res.status(400).json({ message: "SMTP configuration is incomplete" });
      }
      res.json({ message: "Test email functionality will be implemented with email service integration" });
    } catch (error) {
      next(error);
    }
  });

  // ============================================
  // PUSH NOTIFICATION ROUTES
  // ============================================

  // Configure web-push with VAPID keys
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@pcvisor.com";

  if (vapidPublicKey && vapidPrivateKey) {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    console.log("Web Push configured with VAPID keys");
  } else {
    console.warn("VAPID keys not configured - push notifications will not work");
  }

  // Get VAPID public key for client
  app.get("/api/push/vapid-public-key", requireAuth, (req, res) => {
    if (!vapidPublicKey) {
      return res.status(500).json({ message: "Push notifications not configured" });
    }
    res.json({ publicKey: vapidPublicKey });
  });

  // Get VAPID configuration status (admin only)
  app.get("/api/push/vapid-status", requireAdmin, (req, res) => {
    const isConfigured = !!(vapidPublicKey && vapidPrivateKey);
    res.json({
      configured: isConfigured,
      publicKey: vapidPublicKey || null,
      subject: vapidSubject,
      hasPrivateKey: !!vapidPrivateKey,
    });
  });

  // Generate new VAPID keys (admin only) - returns keys for manual configuration
  app.post("/api/push/generate-vapid-keys", requireAdmin, (req, res) => {
    try {
      const keys = webPush.generateVAPIDKeys();
      res.json({
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        instructions: "Add these keys as environment variables: VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY. The server will need to be restarted after adding the keys.",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate VAPID keys" });
    }
  });

  // Subscribe to push notifications
  app.post("/api/push/subscribe", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const { subscription } = req.body;
      
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({ message: "Invalid subscription data" });
      }

      const pushSubscription = await storage.createPushSubscription({
        userId: currentUser.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: req.headers["user-agent"] || null,
        isActive: true,
      });

      // Send a welcome notification
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          JSON.stringify({
            title: "Notifications Enabled",
            body: "You will now receive push notifications from pcvisor.",
            icon: "/icon-192.png",
            badge: "/badge-72.png",
          })
        );
      } catch (pushError) {
        console.error("Failed to send welcome notification:", pushError);
      }

      res.status(201).json({ message: "Subscription saved", id: pushSubscription.id });
    } catch (error) {
      next(error);
    }
  });

  // Unsubscribe from push notifications
  app.post("/api/push/unsubscribe", requireAuth, async (req, res, next) => {
    try {
      const { endpoint } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint is required" });
      }

      await storage.deletePushSubscription(endpoint);
      res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Get user's push subscriptions
  app.get("/api/push/subscriptions", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const subscriptions = await storage.getPushSubscriptionsByUserId(currentUser.id);
      res.json(subscriptions.map(s => ({
        id: s.id,
        endpoint: s.endpoint,
        createdAt: s.createdAt,
        userAgent: s.userAgent,
      })));
    } catch (error) {
      next(error);
    }
  });

  // Send test push notification (admin only)
  app.post("/api/push/test", requireAdmin, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const subscriptions = await storage.getPushSubscriptionsByUserId(currentUser.id);

      if (subscriptions.length === 0) {
        return res.status(400).json({ message: "No push subscriptions found for your account" });
      }

      const payload = JSON.stringify({
        title: "Test Notification",
        body: "This is a test push notification from pcvisor.",
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        timestamp: Date.now(),
      });

      const results = await Promise.allSettled(
        subscriptions.map(sub =>
          webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          )
        )
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      res.json({
        message: `Sent ${successful} notification(s), ${failed} failed`,
        successful,
        failed,
      });
    } catch (error) {
      next(error);
    }
  });

  // Send push notification to all subscribers (admin only)
  app.post("/api/push/broadcast", requireAdmin, async (req, res, next) => {
    try {
      const { title, body, url } = req.body;

      if (!title || !body) {
        return res.status(400).json({ message: "Title and body are required" });
      }

      const subscriptions = await storage.getAllActivePushSubscriptions();

      if (subscriptions.length === 0) {
        return res.status(400).json({ message: "No active push subscriptions" });
      }

      const payload = JSON.stringify({
        title,
        body,
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        url: url || "/portal",
        timestamp: Date.now(),
      });

      const results = await Promise.allSettled(
        subscriptions.map(sub =>
          webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          ).catch(async (error: any) => {
            // Remove invalid subscriptions
            if (error.statusCode === 410 || error.statusCode === 404) {
              await storage.deletePushSubscription(sub.endpoint);
            }
            throw error;
          })
        )
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      res.json({
        message: `Broadcast sent to ${successful} subscriber(s), ${failed} failed`,
        successful,
        failed,
        total: subscriptions.length,
      });
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
