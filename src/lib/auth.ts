import jwt from "jsonwebtoken";
import { parse } from "cookie";
import type { AstroGlobal } from "astro";

const JWT_SECRET = import.meta.env.JWT_SECRET || "fallback-dev-secret";
const COOKIE_NAME = "ml_token";

interface JwtPayload {
  userId: string;
  email: string;
  nama: string;
}

/**
 * Generate JWT token setelah login/register berhasil.
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify JWT token dari cookie.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Ambil user session dari cookie request.
 * Digunakan di setiap halaman yang membutuhkan autentikasi.
 */
export function getSession(request: Request): JwtPayload | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Buat Set-Cookie header untuk login.
 */
export function createSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; ${
    import.meta.env.PROD ? "Secure;" : ""
  }`;
}

/**
 * Buat Set-Cookie header untuk logout (expire cookie).
 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;`;
}

/**
 * Middleware helper — redirect ke login jika belum auth.
 */
export function requireAuth(request: Request): JwtPayload {
  const session = getSession(request);
  if (!session) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }
  return session;
}
