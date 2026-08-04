import { Request, Response } from "express";
import { createUser, findUserByEmail } from "../services/userService";
import { Prisma } from "@prisma/client";
import { isValidEmail } from "./authControllerLogin";
import { generateToken } from "../config/jwt";

const PASSWORD_MIN_LENGTH = 8;

export async function register(req: Request, res: Response): Promise<Response> {
  const { name, email, password } = req.body;

  // Required fields
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "El nombre completo es obligatorio." });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "El correo es obligatorio." });
  }
  if (!password) {
    return res.status(400).json({ error: "La contraseña es obligatoria." });
  }

  // Email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "El correo no tiene un formato válido." });
  }

  // Password minimum length
  if (password.length < PASSWORD_MIN_LENGTH) {
    return res
      .status(400)
      .json({ error: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.` });
  }

  try {
    // Duplicate email check
    const existing = await findUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({
        error: "No se pudo completar el registro. Verifica los datos e intenta de nuevo o inicia sesión.",
      });
    }

    // Always create as CLIENT role. ADMIN accounts must be created through a separate management process.
    const user = await createUser(name.trim(), email.toLowerCase().trim(), password, "CLIENT");

    // Generar JWT
    const token = generateToken({
      id: user.id.toString(),
      email: user.email,
      role: user.role as 'CLIENT' | 'ADMIN',
    });

    return res.status(201).json({
      message: "¡Registro exitoso! Ahora puedes iniciar sesión.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    // Prisma unique constraint fallback (race condition safety)
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(400).json({
        error: "No se pudo completar el registro. Verifica los datos e intenta de nuevo o inicia sesión.",
      });
    }
    console.error("[register] Unexpected error:", err);
    return res.status(500).json({ error: "Error interno del servidor. Intenta más tarde." });
  }
}
