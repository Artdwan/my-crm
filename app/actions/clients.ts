"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { verifySession } from "@/app/lib/dal";

export async function createClient(formData: FormData) {
  await verifySession();

  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  await prisma.client.create({
    data: {
      name,
      who: String(formData.get("who") || "").trim() || "клиент",
      grade: String(formData.get("grade") || "").trim() || "Класс не указан",
      subject: String(formData.get("subject") || ""),
      channel: String(formData.get("channel") || ""),
      phone: String(formData.get("phone") || "").trim() || null,
    },
  });

  revalidatePath("/clients");
}

export async function convertLeadToClient(leadId: number) {
  await verifySession();

  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });

  await prisma.client.upsert({
    where: { fromLeadId: leadId },
    update: {},
    create: {
      name: lead.name,
      who: lead.who,
      grade: lead.grade,
      subject: lead.subject,
      channel: lead.channel,
      fromLeadId: lead.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/clients");
}
