import type { LeadStatus } from "@prisma/client";

export const STAGES: { key: LeadStatus; label: string; color: string }[] = [
  { key: "NEW", label: "Новый", color: "#7457e8" },
  { key: "IN_DIALOG", label: "В диалоге", color: "#299fe6" },
  { key: "QUALIFICATION", label: "Квалификация", color: "#e7a93b" },
  { key: "DIAGNOSTIC", label: "Диагностика", color: "#e66d70" },
  { key: "DECISION", label: "Решение", color: "#4fb78a" },
  { key: "RESULT", label: "Итог", color: "#9aa0ab" },
];

export function stageIndex(status: LeadStatus): number {
  return STAGES.findIndex((s) => s.key === status);
}

export function stageColor(status: LeadStatus): string {
  return STAGES[Math.max(0, stageIndex(status))].color;
}
