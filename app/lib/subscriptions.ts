export function subscriptionTotal(
  lessonsCount: number,
  pricePerLesson: number,
  discountPercent: number,
): number {
  return lessonsCount * pricePerLesson * (1 - discountPercent / 100);
}

export function formatBYN(amount: number): string {
  return `${amount.toFixed(2)} BYN`;
}

export function formatPeriod(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function paidTotal(payments: { amount: number }[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function remainingAmount(total: number, paid: number): number {
  return Math.max(0, total - paid);
}

export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";

export function paymentStatus(total: number, paid: number): PaymentStatus {
  // Tolerate float drift from the discount multiplication so an exact
  // payoff isn't left showing a stray 0.001 remainder.
  if (paid >= total - 0.005) return "PAID";
  if (paid > 0) return "PARTIAL";
  return "UNPAID";
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PAID: "Оплачен",
  PARTIAL: "Частично",
  UNPAID: "Не оплачен",
};
