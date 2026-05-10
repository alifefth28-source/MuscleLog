import type { APIRoute } from "astro";
import { adminAuth } from "@/lib/firebase-admin";
import { createUser, getUserByEmail } from "@/lib/db";
import { generateToken, createSessionCookie } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/register
 */
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json();
    const action = url.searchParams.get("action");

    // === REGISTER ===
    if (action === "register") {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: parsed.error.errors[0].message }),
          { status: 400 }
        );
      }

      const { nama, email, password } = parsed.data;

      // Cek apakah email sudah terdaftar
      const existing = await getUserByEmail(email);
      if (existing) {
        return new Response(
          JSON.stringify({ error: "Email sudah terdaftar" }),
          { status: 409 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Buat user di Firebase Auth
      const firebaseUser = await adminAuth.createUser({
        email,
        password,
        displayName: nama,
      });

      // Simpan profile di Firestore
      const user = await createUser({
        id: firebaseUser.uid,
        nama,
        email,
      });

      // Generate JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
        nama: user.nama,
      });

      return new Response(
        JSON.stringify({ success: true, user: { id: user.id, nama: user.nama } }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": createSessionCookie(token),
          },
        }
      );
    }

    // === LOGIN ===
    if (action === "login") {
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: parsed.error.errors[0].message }),
          { status: 400 }
        );
      }

      const { email, password } = parsed.data;

      // Verifikasi password melalui Firebase Auth REST API
      try {
        const firebaseApiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
        const signInRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              returnSecureToken: true,
            }),
          }
        );

        if (!signInRes.ok) {
          return new Response(
            JSON.stringify({ error: "Email atau password salah" }),
            { status: 401 }
          );
        }

        const signInData = await signInRes.json();
        const uid = signInData.localId;

        // Ambil data user dari Firestore
        const user = await getUserByEmail(email);
        if (!user) {
          return new Response(
            JSON.stringify({ error: "User tidak ditemukan di database" }),
            { status: 401 }
          );
        }

        const token = generateToken({
          userId: user.id,
          email: user.email,
          nama: user.nama,
        });

        return new Response(
          JSON.stringify({ success: true, user: { id: user.id, nama: user.nama } }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": createSessionCookie(token),
            },
          }
        );
      } catch (signInError: any) {
        return new Response(
          JSON.stringify({ error: "Email atau password salah" }),
          { status: 401 }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Action tidak valid. Gunakan ?action=register atau ?action=login" }),
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Auth error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan server" }),
      { status: 500 }
    );
  }
};
