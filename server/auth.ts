import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User, SafeUser } from "@shared/schema";
import type { Express } from "express";
import session from "express-session";

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

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
