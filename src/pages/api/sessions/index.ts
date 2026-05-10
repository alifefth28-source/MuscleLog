import type { APIRoute } from "astro";
import { requireAuth } from "@/lib/auth";
import { createSession, getUserSessions, closeSession, getSessionById } from "@/lib/db";
import { createSessionSchema, closeSessionSchema } from "@/lib/validators";

/** GET /api/sessions — Ambil semua sesi user */
export const GET: APIRoute = async ({ request }) => {
  try {
    const user = requireAuth(request);
    const sessions = await getUserSessions(user.userId);
    return new Response(JSON.stringify({ sessions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

/** POST /api/sessions — Buat sesi baru atau tutup sesi */
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const action = url.searchParams.get("action");

    // === CLOSE SESSION ===
    if (action === "close") {
      const parsed = closeSessionSchema.safeParse(body);
      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: parsed.error.errors[0].message }),
          { status: 400 }
        );
      }
      await closeSession(parsed.data.sessionId, parsed.data.durasiMenit);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // === CREATE SESSION ===
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400 }
      );
    }

    const session = await createSession({
      userId: user.userId,
      namaSesi: parsed.data.namaSesi,
      catatan: parsed.data.catatan,
    });

    return new Response(JSON.stringify({ session }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
