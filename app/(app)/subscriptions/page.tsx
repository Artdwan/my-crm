import { prisma } from "@/app/lib/prisma";
import SubscriptionsBoard from "./subscriptions-board";

export default async function SubscriptionsPage() {
  const [rows, clients] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { periodStart: "desc" },
      include: { client: { select: { id: true, name: true } } },
    }),
    prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const subscriptions = rows.map((s) => ({
    ...s,
    pricePerLesson: Number(s.pricePerLesson),
    discountPercent: Number(s.discountPercent),
  }));

  return <SubscriptionsBoard subscriptions={subscriptions} clients={clients} />;
}
