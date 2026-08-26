import { prisma } from "@/app/lib/prisma";
import TemplatesBoard from "./templates-board";

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: [{ stage: "asc" }, { title: "asc" }],
  });

  return <TemplatesBoard templates={templates} />;
}
