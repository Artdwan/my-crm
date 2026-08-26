import type { ReactNode } from "react";
import { prisma } from "@/app/lib/prisma";
import { verifySession } from "@/app/lib/dal";
import Sidebar from "@/app/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await verifySession();
  const leadCount = await prisma.lead.count();

  return (
    <div className="shell">
      <Sidebar username={session.username} leadCount={leadCount} />
      <main>{children}</main>
    </div>
  );
}
