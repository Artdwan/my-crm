import { prisma } from "@/app/lib/prisma";
import SubscriptionsBoard from "./subscriptions-board";

export default async function SubscriptionsPage() {
  const [rows, studentRows] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { periodStart: "desc" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
            client: { select: { id: true, name: true } },
          },
        },
        // Metadata only — never select receiptData here, or every page load
        // would pull every receipt's bytes out of the database.
        payments: {
          orderBy: { paidAt: "asc" },
          select: {
            id: true,
            amount: true,
            paidAt: true,
            note: true,
            receiptName: true,
          },
        },
      },
    }),
    prisma.student.findMany({
      select: {
        id: true,
        name: true,
        grade: true,
        client: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const subscriptions = rows.map((s) => ({
    ...s,
    pricePerLesson: Number(s.pricePerLesson),
    discountPercent: Number(s.discountPercent),
    payments: s.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      hasReceipt: p.receiptName !== null,
    })),
  }));

  const students = studentRows.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
    clientName: s.client.name,
  }));

  return (
    <SubscriptionsBoard subscriptions={subscriptions} students={students} />
  );
}
