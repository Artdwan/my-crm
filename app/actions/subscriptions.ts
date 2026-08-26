"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { verifySession } from "@/app/lib/dal";

export async function createSubscription(formData: FormData) {
  await verifySession();

  const studentId = Number(formData.get("studentId"));
  const period = String(formData.get("periodStart") || "");
  const lessonsCount = Number(formData.get("lessonsCount"));
  const pricePerLesson = String(formData.get("pricePerLesson") || "").trim();
  const discountPercent =
    String(formData.get("discountPercent") || "").trim() || "0";
  const subject = String(formData.get("subject") || "").trim();

  if (!studentId || !period || !lessonsCount || !pricePerLesson || !subject) {
    return;
  }

  try {
    await prisma.subscription.create({
      data: {
        studentId,
        subject,
        periodStart: new Date(`${period}-01`),
        lessonsCount,
        pricePerLesson,
        discountPercent,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return;
    }
    throw err;
  }

  revalidatePath("/subscriptions");
  revalidatePath("/clients");
  revalidatePath("/students");
}
