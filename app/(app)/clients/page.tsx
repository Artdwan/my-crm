import { prisma } from "@/app/lib/prisma";
import { fetchRoster } from "@/app/lib/kabinet";
import ClientsBoard from "./clients-board";

export default async function ClientsPage() {
  const [rows, roster] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        students: {
          orderBy: { createdAt: "asc" },
          include: {
            subscriptions: {
              orderBy: { periodStart: "desc" },
              include: {
                // Metadata only — never select receiptData here, or every page
                // load would pull every receipt's bytes out of the database.
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
        },
      },
    }),
    fetchRoster(),
  ]);

  const clients = rows.map((c) => ({
    ...c,
    students: c.students.map((st) => ({
      id: st.id,
      name: st.name,
      grade: st.grade,
      kabinetStudentId: st.kabinetStudentId,
      subscriptions: st.subscriptions.map((s) => ({
        ...s,
        pricePerLesson: Number(s.pricePerLesson),
        discountPercent: Number(s.discountPercent),
        payments: s.payments.map((p) => ({
          ...p,
          amount: Number(p.amount),
          hasReceipt: p.receiptName !== null,
        })),
      })),
    })),
  }));

  return <ClientsBoard clients={clients} roster={roster} />;
}
