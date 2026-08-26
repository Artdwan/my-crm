"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { verifySession } from "@/app/lib/dal";

function readStage(formData: FormData): LeadStatus | null {
  const raw = String(formData.get("stage") || "");
  return raw ? (raw as LeadStatus) : null;
}

export async function createTemplate(formData: FormData) {
  await verifySession();

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title || !body) return;

  await prisma.template.create({
    data: { title, body, stage: readStage(formData) },
  });

  revalidatePath("/templates");
  revalidatePath("/");
}

export async function updateTemplate(id: number, formData: FormData) {
  await verifySession();

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!title || !body) return;

  await prisma.template.update({
    where: { id },
    data: { title, body, stage: readStage(formData) },
  });

  revalidatePath("/templates");
  revalidatePath("/");
}

export async function deleteTemplate(id: number) {
  await verifySession();

  await prisma.template.delete({ where: { id } });

  revalidatePath("/templates");
  revalidatePath("/");
}
