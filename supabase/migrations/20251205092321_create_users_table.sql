/*
  # Create users table for authentication

  1. New Tables
    - `users`
      - `id` (varchar, primary key, auto-generated UUID)
      - `username` (text, unique, not null) - User's login username
      - `password` (text, not null) - Hashed password for authentication
      - `created_at` (timestamptz) - Timestamp when user was created
  
  2. Indexes
    - Index on `username` for fast lookup during authentication
  
  3. Security
    - No RLS policies needed as this is server-side authentication only
    - Password hashing handled by application layer (bcrypt)
*/

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
