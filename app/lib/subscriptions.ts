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
