"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { verifySession } from "@/app/lib/dal";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

function isAcceptableReceipt(file: File): boolean {
  if (file.size === 0 || file.size > MAX_RECEIPT_BYTES) return false;
  return file.type.startsWith("image/") || file.type === "application/pdf";
}

export async function createPayment(formData: FormData) {
  await verifySession();

  const subscriptionId = Number(formData.get("subscriptionId"));
  const amount = String(formData.get("amount") || "").trim();
  const paidAt = String(formData.get("paidAt") || "");

  if (!subscriptionId || !amount || !paidAt) return;

  const receipt = formData.get("receipt");
  const hasReceipt = receipt instanceof File && isAcceptableReceipt(receipt);

  await prisma.payment.create({
    data: {
      subscriptionId,
      amount,
      paidAt: new Date(paidAt),
      note: String(formData.get("note") || "").trim() || null,
      ...(hasReceipt
        ? {
            receiptName: receipt.name,
            receiptType: receipt.type,
            receiptData: Buffer.from(await receipt.arrayBuffer()),
          }
        : {}),
    },
  });

  revalidatePath("/subscriptions");
  revalidatePath("/clients");
}

export async function deletePayment(id: number) {
  await verifySession();

  await prisma.payment.delete({ where: { id } });

  revalidatePath("/subscriptions");
  revalidatePath("/clients");
}
