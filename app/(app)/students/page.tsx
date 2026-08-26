import { prisma } from "@/app/lib/prisma";
import { fetchRoster, isKabinetConfigured, kabinetStudentUrl } from "@/app/lib/kabinet";
import StudentsBoard from "./students-board";

export default async function StudentsPage() {
  const [rows, roster] = await Promise.all([
    prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true, who: true, phone: true } },
        subscriptions: { select: { id: true } },
      },
    }),
    fetchRoster(),
  ]);

  const students = rows.map((s) => {
    const linked = s.kabinetStudentId
      ? roster?.find((r) => r.id === s.kabinetStudentId) ?? null
      : null;
    return {
      id: s.id,
      name: s.name,
      grade: s.grade,
      kabinetStudentId: s.kabinetStudentId,
      client: s.client,
      subscriptionCount: s.subscriptions.length,
      kabinet: linked,
      kabinetUrl: s.kabinetStudentId ? kabinetStudentUrl(s.kabinetStudentId) : null,
    };
  });

  return (
    <StudentsBoard
      students={students}
      roster={roster}
      kabinetConfigured={isKabinetConfigured()}
      kabinetReachable={roster !== null}
    />
  );
}
