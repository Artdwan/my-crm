"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/app/lib/prisma";
import { verifyPassword } from "@/app/lib/password";
import { createSession, deleteSession } from "@/app/lib/session";

const LoginSchema = z.object({
  username: z.string().trim().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Введите логин и пароль" };
  }

  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Неверный логин или пароль" };
  }

  await createSession(user.id, user.username, user.role);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
