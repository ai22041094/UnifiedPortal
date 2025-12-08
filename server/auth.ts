import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User, SafeUser } from "@shared/schema";
import type { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

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
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    console.log("Using PostgreSQL for session storage");
    const PgSession = connectPgSimple(session);
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
    
    return new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    });
  }
  
  console.log("DATABASE_URL not set, sessions will not persist");
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
