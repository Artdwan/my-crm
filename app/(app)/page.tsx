import { prisma } from "@/app/lib/prisma";
import LeadsBoard from "./leads-board";

export default async function Home() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { id: true } } },
  });

  return <LeadsBoard leads={leads} />;
}
