import { config } from "dotenv";
config();

async function createUser() {
  const { storage } = await import("../server/storage");
  const { hashPassword } = await import("../server/auth");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    console.error("Make sure .env file exists with DATABASE_URL defined");
    process.exit(1);
  }

  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error("Usage: npx tsx script/create-user.ts <username> <password>");
    process.exit(1);
  }

  try {
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      console.log(`User '${username}' already exists.`);
      process.exit(0);
    }

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      username,
      password: hashedPassword,
    });

    console.log(`User created successfully:`);
    console.log(`  Username: ${user.username}`);
    console.log(`  ID: ${user.id}`);
  } catch (error) {
    console.error("Failed to create user:", error);
    process.exit(1);
  }
}

createUser();
