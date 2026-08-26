import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, type SessionPayload } from "./session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  if (!session?.userId) {
    redirect("/login");
  }

  return session;
});
