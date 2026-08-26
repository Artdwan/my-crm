import { prisma } from "@/app/lib/prisma";
import ClientsBoard from "./clients-board";

export default async function ClientsPage() {
  const rows = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        orderBy: { periodStart: "desc" },
        include: {
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
      },
    },
  });

  const clients = rows.map((c) => ({
    ...c,
    subscriptions: c.subscriptions.map((s) => ({
      ...s,
      pricePerLesson: Number(s.pricePerLesson),
      discountPercent: Number(s.discountPercent),
      payments: s.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
        hasReceipt: p.receiptName !== null,
      })),
    })),
  }));

  return <ClientsBoard clients={clients} />;
}
