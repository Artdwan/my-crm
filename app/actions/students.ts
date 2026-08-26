"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { verifySession } from "@/app/lib/dal";

function revalidateStudentViews() {
  revalidatePath("/students");
  revalidatePath("/clients");
  revalidatePath("/subscriptions");
}

export async function createStudent(formData: FormData) {
  await verifySession();

  const clientId = Number(formData.get("clientId"));
  const name = String(formData.get("name") || "").trim();
  if (!clientId || !name) return;

  await prisma.student.create({
    data: {
      clientId,
      name,
      grade: String(formData.get("grade") || "").trim() || "Класс не указан",
      ...parseKabinetLink(formData),
    },
  });

  revalidateStudentViews();
}

export async function updateStudent(id: number, formData: FormData) {
  await verifySession();

  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  try {
    await prisma.student.update({
      where: { id },
      data: {
        name,
        grade: String(formData.get("grade") || "").trim() || "Класс не указан",
        ...parseKabinetLink(formData),
      },
    });
  } catch (err) {
    // Another student already claims this Кабинет account.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return;
    }
    throw err;
  }

  revalidateStudentViews();
}

export async function deleteStudent(id: number) {
  await verifySession();

  await prisma.student.delete({ where: { id } });

  revalidateStudentViews();
}

function parseKabinetLink(formData: FormData) {
  const raw = String(formData.get("kabinetStudentId") || "").trim();
  return {
    kabinetStudentId: raw || null,
    kabinetSyncedAt: raw ? new Date() : null,
  };
}
