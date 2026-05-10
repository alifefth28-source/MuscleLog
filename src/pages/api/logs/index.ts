import type { APIRoute } from "astro";
import { requireAuth } from "@/lib/auth";
import { addWorkoutLog, getSessionLogs, deleteLog } from "@/lib/db";
import { addLogSchema } from "@/lib/validators";

/** GET /api/logs?sessionId=xxx — Ambil semua log di sesi tertentu */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    requireAuth(request);
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "sessionId diperlukan" }),
        { status: 400 }
      );
    }
    const logs = await getSessionLogs(sessionId);
    return new Response(JSON.stringify({ logs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

/** POST /api/logs — Tambah log set baru */
export const POST: APIRoute = async ({ request }) => {
  try {
    const user = requireAuth(request);
    const body = await request.json();

    const parsed = addLogSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0].message }),
        { status: 400 }
      );
    }

    const log = await addWorkoutLog({
      ...parsed.data,
      userId: user.userId,
    });

    return new Response(JSON.stringify({ log }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

/** DELETE /api/logs?logId=xxx — Hapus log tertentu */
export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    requireAuth(request);
    const logId = url.searchParams.get("logId");
    if (!logId) {
      return new Response(
        JSON.stringify({ error: "logId diperlukan" }),
        { status: 400 }
      );
    }
    await deleteLog(logId);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
