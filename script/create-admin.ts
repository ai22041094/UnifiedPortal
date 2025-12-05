import { config } from "dotenv";
config();

import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

async function createAdmin() {
  const username = "admin";
  const password = "P@ssw0rd@123";

  try {
    const existingUser = await storage.getUserByUsername(username);
    
    if (existingUser) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      username,
      password: hashedPassword,
    });

    console.log("Admin user created successfully!");
    console.log("Username:", username);
    console.log("Password:", password);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
