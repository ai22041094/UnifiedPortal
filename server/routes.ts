import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { hashPassword, getSafeUser } from "./auth";
import { insertUserSchema, insertRoleSchema, updateRoleSchema, updateUserSchema, externalProcessDetailsSchema, changePasswordSchema, updateOrganizationSettingsSchema, updateNotificationSettingsSchema, insertPushSubscriptionSchema, insertNotificationSchema, updateSecuritySettingsSchema, updateSystemConfigSchema, mfaSetupSchema, mfaVerifySchema, mfaLoginVerifySchema, type SafeUser, type InsertProcessDetails } from "@shared/schema";
import webPush from "web-push";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { authenticator } from "otplib";
import QRCode from "qrcode";

async function validatePasswordPolicy(password: string): Promise<{ valid: boolean; errors: string[] }> {
  const settings = await storage.getSecuritySettings();
  const errors: string[] = [];
  
  const minLength = parseInt(settings?.minPasswordLength || "8", 10);
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (settings?.requireUppercase !== false && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (settings?.requireLowercase !== false && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (settings?.requireNumbers !== false && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (settings?.requireSpecialChars !== false && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return { valid: errors.length === 0, errors };
}

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

      // Validate password against security policy
      const passwordValidation = await validatePasswordPolicy(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.errors.join(". ") });
      }

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

  app.post("/api/auth/login", async (req, res, next) => {
    const { username } = req.body;
    
    passport.authenticate("local", async (err: any, user: SafeUser | false, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        // Track failed login attempts for password failures
        if (username) {
          const existingUser = await storage.getUserByUsername(username);
          if (existingUser && info?.message !== "Account is temporarily locked") {
            const securitySettings = await storage.getSecuritySettings();
            const maxAttempts = parseInt(securitySettings?.maxLoginAttempts || "5", 10);
            const lockoutMinutes = parseInt(securitySettings?.lockoutDurationMinutes || "30", 10);
            
            const failedAttempts = await storage.incrementFailedLoginAttempts(existingUser.id);
            
            if (failedAttempts >= maxAttempts) {
              const lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
              await storage.lockUserAccount(existingUser.id, lockUntil);
              return res.status(401).json({
                message: `Account locked due to too many failed attempts. Try again in ${lockoutMinutes} minutes.`
              });
            }
          }
        }
        
        return res.status(401).json({
          message: info?.message || "Invalid username or password"
        });
      }

      // Check if user has MFA enabled and verified
      const fullUser = await storage.getUser(user.id);
      if (fullUser && fullUser.mfaEnabled && fullUser.mfaVerified) {
        // MFA is required - don't create session yet
        return res.json({
          requiresMfa: true,
          userId: user.id
        });
      }

      // Reset failed login attempts on successful login
      await storage.resetFailedLoginAttempts(user.id);

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

  // MFA Routes
  app.post("/api/auth/mfa/setup", requireAuth, async (req, res, next) => {
    try {
      const result = mfaSetupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const currentUser = req.user as SafeUser;
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(result.data.password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Generate TOTP secret
      const secret = authenticator.generateSecret();
      const otpauthUrl = authenticator.keyuri(user.username, "pcvisor", secret);

      // Generate QR code as data URL
      const qrCode = await QRCode.toDataURL(otpauthUrl);

      // Store the secret (but keep mfaVerified false until verified)
      await storage.updateUserMfa(user.id, {
        mfaSecret: secret,
        mfaVerified: false
      });

      res.json({
        secret,
        qrCode,
        otpauthUrl
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/mfa/verify-setup", requireAuth, async (req, res, next) => {
    try {
      const result = mfaVerifySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const currentUser = req.user as SafeUser;
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.mfaSecret) {
        return res.status(400).json({ message: "MFA setup not initiated. Please start MFA setup first." });
      }

      // Verify the TOTP code
      const isValid = authenticator.verify({
        token: result.data.code,
        secret: user.mfaSecret
      });

      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Enable MFA
      await storage.updateUserMfa(user.id, {
        mfaEnabled: true,
        mfaVerified: true
      });

      // Create audit log entry
      await storage.createAuditLog({
        userId: user.id,
        username: user.username,
        action: "MFA Enabled",
        category: "security",
        resourceType: "user",
        resourceId: user.id,
        resourceName: user.username,
        details: "Two-factor authentication enabled",
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success"
      });

      res.json({ message: "MFA enabled successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/mfa/disable", requireAuth, async (req, res, next) => {
    try {
      const result = mfaSetupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const currentUser = req.user as SafeUser;
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(result.data.password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Disable MFA
      await storage.updateUserMfa(user.id, {
        mfaEnabled: false,
        mfaSecret: null,
        mfaVerified: false
      });

      // Create audit log entry
      await storage.createAuditLog({
        userId: user.id,
        username: user.username,
        action: "MFA Disabled",
        category: "security",
        resourceType: "user",
        resourceId: user.id,
        resourceName: user.username,
        details: "Two-factor authentication disabled",
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success"
      });

      res.json({ message: "MFA disabled successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/mfa/verify", async (req, res, next) => {
    try {
      const result = mfaLoginVerifySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      const { userId, code } = result.data;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.mfaSecret || !user.mfaEnabled) {
        return res.status(400).json({ message: "MFA is not enabled for this user" });
      }

      // Verify the TOTP code
      const isValid = authenticator.verify({
        token: code,
        secret: user.mfaSecret
      });

      if (!isValid) {
        // Increment failed attempts
        const securitySettings = await storage.getSecuritySettings();
        const maxAttempts = parseInt(securitySettings?.maxLoginAttempts || "5", 10);
        const lockoutMinutes = parseInt(securitySettings?.lockoutDurationMinutes || "30", 10);
        
        const attempts = await storage.incrementFailedLoginAttempts(userId);
        if (attempts >= maxAttempts) {
          const lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
          await storage.lockUserAccount(userId, lockUntil);
          return res.status(401).json({ message: `Account locked due to too many failed attempts. Try again in ${lockoutMinutes} minutes.` });
        }
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Reset failed login attempts
      await storage.resetFailedLoginAttempts(userId);

      const safeUser = getSafeUser(user);

      // Create session and log user in
      req.login(safeUser, (err) => {
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
            user: safeUser,
            token
          });
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/auth/mfa/status", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        enabled: user.mfaEnabled || false,
        verified: user.mfaVerified || false
      });
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

      // Validate new password against security policy
      const passwordValidation = await validatePasswordPolicy(result.data.newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.errors.join(". ") });
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
        password: z.string().min(1, "Password is required"),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString()
        });
      }

      // Validate password against security policy
      const passwordValidation = await validatePasswordPolicy(result.data.password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.errors.join(". ") });
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
  // USER NOTIFICATIONS ROUTES (In-App Notifications)
  // ============================================

  app.get("/api/user/notifications", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await storage.getNotificationsByUserId(currentUser.id, limit);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user/notifications/unread-count", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const count = await storage.getUnreadNotificationCount(currentUser.id);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/user/notifications/:id/read", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const notification = await storage.markNotificationAsRead(req.params.id, currentUser.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/user/notifications/mark-all-read", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const count = await storage.markAllNotificationsAsRead(currentUser.id);
      res.json({ message: `Marked ${count} notifications as read`, count });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/user/notifications/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const deleted = await storage.deleteNotification(req.params.id, currentUser.id);
      if (!deleted) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Admin route to create notifications for users
  app.post("/api/admin/notifications", requireAdmin, async (req, res, next) => {
    try {
      const result = insertNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      const notification = await storage.createNotification(result.data);
      res.status(201).json(notification);
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

  // ============================================
  // SECURITY SETTINGS ROUTES
  // ============================================

  app.get("/api/security", requireAdmin, async (req, res, next) => {
    try {
      const settings = await storage.getSecuritySettings();
      res.json(settings || {
        minPasswordLength: "8",
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiryDays: "90",
        passwordHistoryCount: "5",
        maxLoginAttempts: "5",
        lockoutDurationMinutes: "30",
        sessionTimeoutMinutes: "60",
        mfaEnabled: false,
        mfaMethod: "email",
        ipWhitelistEnabled: false,
        ipWhitelist: null,
        auditLogRetentionDays: "365",
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/security", requireAdmin, async (req, res, next) => {
    try {
      const result = updateSecuritySettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      const currentUser = req.user as SafeUser;
      const settings = await storage.updateSecuritySettings(result.data, currentUser.id);
      
      // Log the security settings update
      await storage.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "update_security_settings",
        category: "security",
        resourceType: "security_settings",
        details: "Security settings were updated",
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success",
      });
      
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  // ============================================
  // AUDIT LOGS ROUTES
  // ============================================

  app.get("/api/audit-logs", requireAdmin, async (req, res, next) => {
    try {
      const { category, action, userId, startDate, endDate, search, limit, offset } = req.query;
      
      const filters: {
        category?: string;
        action?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        search?: string;
        limit?: number;
        offset?: number;
      } = {};
      
      if (category && typeof category === "string") filters.category = category;
      if (action && typeof action === "string") filters.action = action;
      if (userId && typeof userId === "string") filters.userId = userId;
      if (startDate && typeof startDate === "string") filters.startDate = new Date(startDate);
      if (endDate && typeof endDate === "string") filters.endDate = new Date(endDate);
      if (search && typeof search === "string") filters.search = search;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);
      
      const result = await storage.getAuditLogs(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/audit-logs/categories", requireAdmin, async (_req, res) => {
    res.json({
      categories: [
        { id: "auth", name: "Authentication" },
        { id: "user", name: "User Management" },
        { id: "role", name: "Role Management" },
        { id: "settings", name: "Settings" },
        { id: "security", name: "Security" },
        { id: "system", name: "System" },
        { id: "data", name: "Data Operations" },
      ]
    });
  });

  app.post("/api/audit-logs/cleanup", requireAdmin, async (req, res, next) => {
    try {
      const { beforeDate } = req.body;
      if (!beforeDate) {
        return res.status(400).json({ message: "beforeDate is required" });
      }
      
      const currentUser = req.user as SafeUser;
      const deletedCount = await storage.deleteOldAuditLogs(new Date(beforeDate));
      
      // Log the cleanup action
      await storage.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "cleanup_audit_logs",
        category: "security",
        resourceType: "audit_logs",
        details: `Deleted ${deletedCount} audit log entries before ${beforeDate}`,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success",
      });
      
      res.json({ message: `Deleted ${deletedCount} audit log entries`, deletedCount });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/audit-logs/stats", requireAdmin, async (_req, res, next) => {
    try {
      const stats = await storage.getAuditLogStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // ============================================
  // SYSTEM CONFIGURATION ROUTES
  // ============================================

  app.get("/api/system-config", requireAdmin, async (_req, res, next) => {
    try {
      const config = await storage.getSystemConfig();
      res.json(config || {
        applicationName: "PCVisor",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm:ss",
        language: "en",
        maintenanceMode: false,
        maxFileUploadSize: "10",
        allowedFileTypes: "pdf,doc,docx,xls,xlsx,png,jpg,jpeg",
        dataRetentionDays: "365",
        enableApiAccess: true,
        apiRateLimit: "1000",
        enableWebhooks: false,
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/system-config", requireAdmin, async (req, res, next) => {
    try {
      const result = updateSystemConfigSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }
      
      const currentUser = req.user as SafeUser;
      const config = await storage.updateSystemConfig(result.data, currentUser.id);
      
      await storage.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "update_system_config",
        category: "system",
        resourceType: "system_config",
        details: "System configuration was updated",
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success",
      });
      
      res.json(config);
    } catch (error) {
      next(error);
    }
  });

  // ============================================
  // DATABASE MANAGEMENT ROUTES
  // ============================================

  // Database Backups
  app.get("/api/db/backups", requireAdmin, async (_req, res, next) => {
    try {
      const backups = await storage.getAllDatabaseBackups();
      res.json(backups);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/db/backups", requireAdmin, async (req, res, next) => {
    try {
      const currentUser = req.user as SafeUser;
      const { createBackup } = await import("./services/backupService");
      
      const result = await createBackup(currentUser.id);
      
      if (result.success) {
        res.json({ message: "Backup created successfully", ...result });
      } else {
        res.status(500).json({ message: "Backup failed", error: result.error });
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/db/backups/:id/download", requireAdmin, async (req, res, next) => {
    try {
      const backup = await storage.getDatabaseBackup(req.params.id);
      if (!backup) {
        return res.status(404).json({ message: "Backup not found" });
      }

      if (!backup.filePath) {
        return res.status(404).json({ message: "Backup file not available" });
      }

      const { getBackupFileContent } = await import("./services/backupService");
      const content = await getBackupFileContent(backup.filePath);
      
      if (!content) {
        return res.status(404).json({ message: "Backup file not found on disk" });
      }

      const filename = backup.filePath.split("/").pop() || "backup.sql";
      res.setHeader("Content-Type", "application/sql");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/db/backups/:id", requireAdmin, async (req, res, next) => {
    try {
      const backup = await storage.getDatabaseBackup(req.params.id);
      if (!backup) {
        return res.status(404).json({ message: "Backup not found" });
      }

      if (backup.filePath) {
        const { deleteBackupFile } = await import("./services/backupService");
        await deleteBackupFile(backup.filePath);
      }

      await storage.deleteDatabaseBackup(req.params.id);
      
      const currentUser = req.user as SafeUser;
      await storage.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "delete_backup",
        category: "system",
        resourceType: "backup",
        resourceId: req.params.id,
        details: `Deleted backup: ${backup.name}`,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success",
      });

      res.json({ message: "Backup deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Backup Schedules
  app.get("/api/db/schedules", requireAdmin, async (_req, res, next) => {
    try {
      const schedules = await storage.getAllBackupSchedules();
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/db/schedules", requireAdmin, async (req, res, next) => {
    try {
      const { insertBackupScheduleSchema } = await import("@shared/schema");
      const result = insertBackupScheduleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }

      const currentUser = req.user as SafeUser;
      const { calculateNextRun, scheduleBackupJob } = await import("./services/backupService");
      
      const schedule = await storage.createBackupSchedule({
        ...result.data,
        createdByUserId: currentUser.id,
      });

      await storage.updateBackupSchedule(schedule.id, {
        nextRunAt: calculateNextRun(schedule.cronExpression),
      });

      const updatedSchedule = await storage.getBackupSchedule(schedule.id);
      if (updatedSchedule) {
        scheduleBackupJob(updatedSchedule);
      }

      await storage.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "create_backup_schedule",
        category: "system",
        resourceType: "backup_schedule",
        resourceId: schedule.id,
        resourceName: schedule.name,
        details: `Created backup schedule: ${schedule.name}`,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success",
      });

      res.json(updatedSchedule);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/db/schedules/:id", requireAdmin, async (req, res, next) => {
    try {
      const { updateBackupScheduleSchema } = await import("@shared/schema");
      const result = updateBackupScheduleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }

      const { calculateNextRun, scheduleBackupJob, cancelScheduledJob } = await import("./services/backupService");
      
      const existingSchedule = await storage.getBackupSchedule(req.params.id);
      if (!existingSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      cancelScheduledJob(req.params.id);

      const updateData: any = { ...result.data };
      if (result.data.cronExpression) {
        updateData.nextRunAt = calculateNextRun(result.data.cronExpression);
      }

      const schedule = await storage.updateBackupSchedule(req.params.id, updateData);
      
      if (schedule && schedule.isActive) {
        scheduleBackupJob(schedule);
      }

      const currentUser = req.user as SafeUser;
      await storage.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "update_backup_schedule",
        category: "system",
        resourceType: "backup_schedule",
        resourceId: req.params.id,
        details: `Updated backup schedule: ${schedule?.name}`,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success",
      });

      res.json(schedule);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/db/schedules/:id", requireAdmin, async (req, res, next) => {
    try {
      const schedule = await storage.getBackupSchedule(req.params.id);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      const { cancelScheduledJob } = await import("./services/backupService");
      cancelScheduledJob(req.params.id);

      await storage.deleteBackupSchedule(req.params.id);

      const currentUser = req.user as SafeUser;
      await storage.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "delete_backup_schedule",
        category: "system",
        resourceType: "backup_schedule",
        resourceId: req.params.id,
        resourceName: schedule.name,
        details: `Deleted backup schedule: ${schedule.name}`,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success",
      });

      res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Query Execution
  app.get("/api/db/query-logs", requireAdmin, async (_req, res, next) => {
    try {
      const logs = await storage.getQueryExecutionLogs();
      res.json(logs);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/db/query", requireAdmin, async (req, res, next) => {
    try {
      const { query, confirmDelete } = req.body;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query is required" });
      }

      const trimmedQuery = query.trim().toUpperCase();
      let queryType: "SELECT" | "INSERT" | "UPDATE" | "DELETE" = "SELECT";
      
      if (trimmedQuery.startsWith("INSERT")) {
        queryType = "INSERT";
      } else if (trimmedQuery.startsWith("UPDATE")) {
        queryType = "UPDATE";
      } else if (trimmedQuery.startsWith("DELETE")) {
        queryType = "DELETE";
        if (confirmDelete !== "delete") {
          return res.status(400).json({ 
            message: "DELETE queries require confirmation. Please type 'delete' to confirm.",
            requiresConfirmation: true,
            queryType: "DELETE"
          });
        }
      } else if (trimmedQuery.startsWith("SELECT")) {
        queryType = "SELECT";
      } else if (trimmedQuery.startsWith("DROP") || trimmedQuery.startsWith("TRUNCATE") || trimmedQuery.startsWith("ALTER")) {
        return res.status(403).json({ message: "DROP, TRUNCATE, and ALTER statements are not allowed" });
      }

      const currentUser = req.user as SafeUser;
      const startTime = Date.now();

      try {
        const { db } = await import("./db");
        const { sql } = await import("drizzle-orm");
        
        const result = await db.execute(sql.raw(query));
        const executionTime = `${Date.now() - startTime}ms`;
        const rowsAffected = Array.isArray(result) ? result.length.toString() : "0";

        await storage.createQueryExecutionLog({
          query,
          queryType,
          status: "success",
          rowsAffected,
          executionTime,
          executedByUserId: currentUser.id,
          executedByUsername: currentUser.username,
        });

        await storage.createAuditLog({
          userId: currentUser.id,
          username: currentUser.username,
          action: "execute_query",
          category: "data",
          resourceType: "database",
          details: `Executed ${queryType} query. Rows affected: ${rowsAffected}`,
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null,
          status: "success",
        });

        res.json({
          success: true,
          result: Array.isArray(result) ? result : [],
          rowsAffected,
          executionTime,
          queryType,
        });
      } catch (queryError: any) {
        const executionTime = `${Date.now() - startTime}ms`;
        
        await storage.createQueryExecutionLog({
          query,
          queryType,
          status: "failed",
          executionTime,
          errorMessage: queryError.message,
          executedByUserId: currentUser.id,
          executedByUsername: currentUser.username,
        });

        await storage.createAuditLog({
          userId: currentUser.id,
          username: currentUser.username,
          action: "execute_query",
          category: "data",
          resourceType: "database",
          details: `Query failed: ${queryError.message}`,
          ipAddress: req.ip || null,
          userAgent: req.headers["user-agent"] || null,
          status: "failure",
        });

        res.status(400).json({
          success: false,
          error: queryError.message,
          queryType,
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // Database Settings
  app.get("/api/db/settings", requireAdmin, async (_req, res, next) => {
    try {
      const settings = await storage.getDatabaseSettings();
      res.json(settings || {
        timezone: "UTC",
        backupRetentionDays: "30",
        maxQueryExecutionTime: "30",
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/db/settings", requireAdmin, async (req, res, next) => {
    try {
      const { updateDatabaseSettingsSchema } = await import("@shared/schema");
      const result = updateDatabaseSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).toString() });
      }

      const currentUser = req.user as SafeUser;
      const settings = await storage.updateDatabaseSettings(result.data, currentUser.id);

      await storage.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "update_database_settings",
        category: "system",
        resourceType: "database_settings",
        details: "Database settings were updated",
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        status: "success",
      });

      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  // Get list of available timezones
  app.get("/api/db/timezones", requireAdmin, async (_req, res) => {
    const timezones = [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Toronto",
      "America/Vancouver",
      "America/Sao_Paulo",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Moscow",
      "Asia/Dubai",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Hong_Kong",
      "Australia/Sydney",
      "Australia/Melbourne",
      "Pacific/Auckland",
    ];
    res.json(timezones);
  });

  // System Monitoring Routes
  app.get("/api/admin/system/metrics", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const cpus = os.cpus();
      const cpuCount = cpus.length;
      
      let totalIdle = 0;
      let totalTick = 0;
      for (const cpu of cpus) {
        for (const type in cpu.times) {
          totalTick += cpu.times[type as keyof typeof cpu.times];
        }
        totalIdle += cpu.times.idle;
      }
      const cpuUsage = Math.round((1 - totalIdle / totalTick) * 100);
      
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);
      
      let diskInfo = { total: 0, used: 0, free: 0, percent: 0 };
      try {
        const stats = fs.statfsSync('/');
        diskInfo.total = stats.blocks * stats.bsize;
        diskInfo.free = stats.bfree * stats.bsize;
        diskInfo.used = diskInfo.total - diskInfo.free;
        diskInfo.percent = Math.round((diskInfo.used / diskInfo.total) * 100);
      } catch {
        diskInfo = { total: 0, used: 0, free: 0, percent: 0 };
      }
      
      const uptimeSeconds = os.uptime();
      const processMemory = process.memoryUsage();
      
      res.json({
        cpu: {
          usage: cpuUsage,
          cores: cpuCount,
          model: cpus[0]?.model || "Unknown"
        },
        memory: {
          total: totalMemory,
          used: usedMemory,
          free: freeMemory,
          percent: memoryUsagePercent
        },
        disk: diskInfo,
        uptime: uptimeSeconds,
        process: {
          heapUsed: processMemory.heapUsed,
          heapTotal: processMemory.heapTotal,
          rss: processMemory.rss,
          external: processMemory.external
        },
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch
        },
        system: {
          hostname: os.hostname(),
          platform: os.platform(),
          arch: os.arch(),
          release: os.release()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/system/health", requireAuth, requireAdmin, async (_req, res, next) => {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const memoryUsagePercent = Math.round(((totalMemory - freeMemory) / totalMemory) * 100);
      
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      for (const cpu of cpus) {
        for (const type in cpu.times) {
          totalTick += cpu.times[type as keyof typeof cpu.times];
        }
        totalIdle += cpu.times.idle;
      }
      const cpuUsage = Math.round((1 - totalIdle / totalTick) * 100);
      
      let status: "healthy" | "warning" | "critical" = "healthy";
      const issues: string[] = [];
      
      if (memoryUsagePercent > 90) {
        status = "critical";
        issues.push("Memory usage is critically high");
      } else if (memoryUsagePercent > 75) {
        status = status === "critical" ? "critical" : "warning";
        issues.push("Memory usage is high");
      }
      
      if (cpuUsage > 90) {
        status = "critical";
        issues.push("CPU usage is critically high");
      } else if (cpuUsage > 75) {
        status = status === "critical" ? "critical" : "warning";
        issues.push("CPU usage is high");
      }
      
      res.json({
        status,
        issues,
        checks: {
          memory: memoryUsagePercent <= 90 ? "ok" : "warning",
          cpu: cpuUsage <= 90 ? "ok" : "warning",
          uptime: os.uptime() > 60 ? "ok" : "starting"
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
