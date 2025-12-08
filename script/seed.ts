import { config } from "dotenv";
config();

import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  const adminUsername = "admin";
  const adminPassword = "P@ssw0rd@123";

  try {
    const existingUser = await storage.getUserByUsername(adminUsername);
    
    if (existingUser) {
      if (!existingUser.isSystem) {
        await db
          .update(users)
          .set({ isSystem: true, updatedAt: new Date() })
          .where(eq(users.id, existingUser.id));
        console.log("Admin user updated to system user!");
      } else {
        console.log("Admin system user already exists!");
      }
      process.exit(0);
    }

    const hashedPassword = await hashPassword(adminPassword);
    
    await db.insert(users).values({
      username: adminUsername,
      password: hashedPassword,
      fullName: "System Administrator",
      isActive: true,
      isSystem: true,
    });

    console.log("Admin system user created successfully!");
    console.log("Username:", adminUsername);
    console.log("Password:", adminPassword);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seed();
