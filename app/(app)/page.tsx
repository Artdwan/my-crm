import { prisma } from "@/app/lib/prisma";
import LeadsBoard from "./leads-board";

export default async function Home() {
  const [leads, templates] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true } } },
    }),
    prisma.template.findMany({
      orderBy: [{ stage: "asc" }, { title: "asc" }],
      select: { id: true, title: true, body: true, stage: true },
    }),
  ]);

  return <LeadsBoard leads={leads} templates={templates} />;
}
