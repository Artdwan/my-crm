"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { verifySession } from "@/app/lib/dal";
import { STAGES, stageIndex } from "@/app/lib/stages";

export async function createLead(formData: FormData) {
  await verifySession();

  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await prisma.lead.create({
    data: {
      name,
      who: "новое обращение",
      grade: String(formData.get("grade") || "").trim() || "Класс не указан",
      subject: String(formData.get("subject") || ""),
      channel: String(formData.get("channel") || ""),
      status: "NEW",
      sub: "Новый диалог",
    },
  });

  revalidatePath("/");
}

export async function moveLead(id: number, direction: 1 | -1) {
  await verifySession();

  const lead = await prisma.lead.findUniqueOrThrow({ where: { id } });
  const idx = stageIndex(lead.status);
  const nextIdx = Math.max(0, Math.min(STAGES.length - 1, idx + direction));

  await prisma.lead.update({
    where: { id },
    data: { status: STAGES[nextIdx].key },
  });

  revalidatePath("/");
}

export async function setLeadStatus(id: number, status: LeadStatus) {
  await verifySession();

  await prisma.lead.update({ where: { id }, data: { status } });

  revalidatePath("/");
}
