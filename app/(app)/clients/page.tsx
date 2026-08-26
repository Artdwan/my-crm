import { prisma } from "@/app/lib/prisma";
import ClientsBoard from "./clients-board";

export default async function ClientsPage() {
  const rows = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscriptions: { orderBy: { periodStart: "desc" } } },
  });

  const clients = rows.map((c) => ({
    ...c,
    subscriptions: c.subscriptions.map((s) => ({
      ...s,
      pricePerLesson: Number(s.pricePerLesson),
      discountPercent: Number(s.discountPercent),
    })),
  }));

  return <ClientsBoard clients={clients} />;
}
