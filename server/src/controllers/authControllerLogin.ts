import { Request, Response } from "express";
import { findUserByEmail, validatePassword } from "../services/userService";
import { generateToken } from "../config/jwt";

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_PASSWORD_HASH = "$2b$10$svxwV3HOdQ0M/0lU8qN1OupgX2Y0W4tWQ0jY0H0N0tO3mM4c54Y1a";

export function isValidEmail(email: string): boolean {
  return emailPattern.test(email);
}

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "El correo es obligatorio." });
  }
  if (!password) {
    return res.status(400).json({ error: "La contraseña es obligatoria." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "El correo no tiene un formato válido." });
  }

  try {
    const user = await findUserByEmail(email.toLowerCase().trim());
    const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
    const isValid = await validatePassword(password, passwordHash);

    if (!user || !isValid) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    // Generar JWT
    const token = generateToken({
      id: user.id.toString(),
      email: user.email,
      role: user.role as 'CLIENT' | 'ADMIN',
    });

    return res.status(200).json({
      message: "Inicio de sesión exitoso.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    console.error("[login] Unexpected error:", err);
    return res.status(500).json({ error: "Error interno del servidor. Intenta más tarde." });
  }
}
