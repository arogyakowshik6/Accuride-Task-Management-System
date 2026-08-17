import bcrypt from "bcryptjs";
import {
  hygraphCreateUser,
  hygraphGetUserByEmail,
  hygraphGetUserById,
} from "./hygraphUsers";
import { User } from "@/types";

{/*
 Users live in Hygraph now, not a local file keeps accounts intact
 across deploys on platforms with an ephemeral filesystem.
 Passwords are hashed here before anything reaches Hygraph; only the hash is ever stored.

*/}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return hygraphGetUserByEmail(email);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return hygraphGetUserById(id);
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return hygraphCreateUser(name, email, passwordHash);
}

export async function verifyPassword(
  user: User,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
