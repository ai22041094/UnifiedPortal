import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User, SafeUser } from "@shared/schema";
import type { Express } from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getSafeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

function createSessionStore() {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    try {
      const redisClient = createClient({
        url: redisUrl,
      });
      
      redisClient.on("error", (err) => {
        console.error("Redis connection error:", err);
      });
      
      redisClient.on("connect", () => {
        console.log("Connected to Redis for session storage");
      });

      redisClient.connect().catch((err) => {
        console.error("Failed to connect to Redis:", err);
      });

      return new RedisStore({
        client: redisClient,
        prefix: "pcvisor:sess:",
        ttl: 60 * 60 * 24 * 30,
      });
    } catch (error) {
      console.warn("Redis not available, falling back to memory store:", error);
      return undefined;
    }
  }
  
  console.log("REDIS_URL not set, using memory store for sessions");
  return undefined;
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }

  const sessionStore = createSessionStore();
  const trustProxy = process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production";

  if (trustProxy) {
    app.set("trust proxy", 1);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const isProxied = trustProxy;

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: "pcvisor.sid",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: isProduction || isProxied,
        sameSite: isProxied ? "none" : "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, getSafeUser(user));
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as SafeUser).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, getSafeUser(user));
    } catch (error) {
      done(error);
    }
  });
}

declare global {
  namespace Express {
    interface User extends SafeUser {}
  }
}
