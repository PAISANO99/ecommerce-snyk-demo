import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { User } from "@prisma/client";

export type Role = "CLIENT" | "ADMIN";

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: Role = "CLIENT"
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });
}

export async function validatePassword(
  candidatePassword: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, storedHash);
}
