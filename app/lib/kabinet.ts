import "server-only";

/**
 * Read-only client for «Кабинет ученика» (Artdwan/kabinet).
 *
 * Кабинет is the source of truth for teaching — grades, homework, lessons,
 * attendance. my-crm only links a Student to a Кабинет account and shows a
 * few facts, so everything here is optional: when Кабинет is unconfigured or
 * unreachable, callers get null and the CRM carries on without it.
 *
 * Shapes mirror `GET /api/teacher/roster` in kabinet's
 * server/src/routes/teacher.ts.
 */

export type KabinetStudent = {
  id: string;
  name: string;
  grade: number;
  avg: number;
  goal: number;
  done: number;
  total: number;
  overdue: number;
  risk: "ok" | "attention" | "risk";
  weak: string;
  lastActive: string | null;
  groupIds: string[];
  groupNames: string[];
};

const TIMEOUT_MS = 4000;

export function kabinetBaseUrl(): string | null {
  return process.env.KABINET_API_URL?.replace(/\/$/, "") || null;
}

export function isKabinetConfigured(): boolean {
  return Boolean(kabinetBaseUrl() && process.env.KABINET_TOKEN);
}

/**
 * Origin of Кабинет's SPA. The API is mounted under /api on the same host,
 * so the app itself sits one level up.
 */
export function kabinetAppUrl(): string | null {
  const base = kabinetBaseUrl();
  return base ? base.replace(/\/api$/, "") : null;
}

/**
 * Кабинет's own SPA route for a student profile, so a linked student can be
 * opened where the teaching data actually lives.
 */
export function kabinetStudentUrl(kabinetStudentId: string): string | null {
  const origin = kabinetAppUrl();
  return origin ? `${origin}/teacher/students/${kabinetStudentId}` : null;
}

export async function fetchRoster(): Promise<KabinetStudent[] | null> {
  const base = kabinetBaseUrl();
  const token = process.env.KABINET_TOKEN;
  if (!base || !token) return null;

  try {
    const res = await fetch(`${base}/teacher/roster`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as KabinetStudent[]) : null;
  } catch {
    // Unreachable, timed out, or bad JSON — the CRM must not break over it.
    return null;
  }
}
