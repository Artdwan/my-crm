import { prisma } from "@/app/lib/prisma";
import { verifySession } from "@/app/lib/dal";
import LeadsBoard from "./leads-board";

export default async function Home() {
  const session = await verifySession();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <LeadsBoard leads={leads} username={session.username} />;
}
