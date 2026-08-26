"use client";

import { useState } from "react";
import type { Subscription } from "@prisma/client";
import SubscriptionModal from "@/app/components/subscription-modal";
import PaymentModal from "@/app/components/payment-modal";
import {
  PAYMENT_STATUS_LABEL,
  formatBYN,
  formatPeriod,
  paidTotal,
  paymentStatus,
  remainingAmount,
  subscriptionTotal,
} from "@/app/lib/subscriptions";

export type PaymentDTO = {
  id: number;
  amount: number;
  paidAt: Date;
  note: string | null;
  hasReceipt: boolean;
};

type SubscriptionDTO = Omit<
  Subscription,
  "pricePerLesson" | "discountPercent"
> & {
  pricePerLesson: number;
  discountPercent: number;
  client: { id: number; name: string };
  payments: PaymentDTO[];
};

export default function SubscriptionsBoard({
  subscriptions,
  clients,
}: {
  subscriptions: SubscriptionDTO[];
  clients: { id: number; name: string }[];
}) {
  const [modal, setModal] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const paying = subscriptions.find((s) => s.id === payingId) ?? null;

  const note = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <>
      <header>
        <div>
          <h1>Абонементы</h1>
          <p>Все действующие абонементы по клиентам</p>
        </div>
        <div className="actions">
          <button
            className="primary"
            onClick={() => setModal(true)}
            disabled={clients.length === 0}
          >
            ＋ Добавить абонемент
          </button>
        </div>
      </header>

      {clients.length === 0 ? (
        <p>Сначала добавьте клиента на странице «Клиенты»</p>
      ) : (
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Предмет</th>
                <th>Период</th>
                <th>Занятий</th>
                <th>Цена/занятие</th>
                <th>Скидка</th>
                <th>Итого</th>
                <th>Оплачено</th>
                <th>Остаток</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => {
                const total = subscriptionTotal(
                  s.lessonsCount,
                  s.pricePerLesson,
                  s.discountPercent,
                );
                const paid = paidTotal(s.payments);
                const status = paymentStatus(total, paid);
                return (
                  <tr key={s.id}>
                    <td>{s.client.name}</td>
                    <td>{s.subject}</td>
                    <td>{formatPeriod(s.periodStart)}</td>
                    <td>{s.lessonsCount}</td>
                    <td>{formatBYN(s.pricePerLesson)}</td>
                    <td>
                      {s.discountPercent > 0 ? `${s.discountPercent}%` : "—"}
                    </td>
                    <td>{formatBYN(total)}</td>
                    <td>{formatBYN(paid)}</td>
                    <td>{formatBYN(remainingAmount(total, paid))}</td>
                    <td>
                      <span className={`badge ${status.toLowerCase()}`}>
                        {PAYMENT_STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td>
                      {status !== "PAID" && (
                        <button
                          className="rowaction"
                          onClick={() => setPayingId(s.id)}
                        >
                          ＋ Оплата
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={11}>Абонементов пока нет</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <SubscriptionModal
          clients={clients}
          onClose={() => setModal(false)}
          note={note}
        />
      )}

      {paying && (
        <PaymentModal
          subscriptionId={paying.id}
          subject={paying.subject}
          periodStart={paying.periodStart}
          remaining={remainingAmount(
            subscriptionTotal(
              paying.lessonsCount,
              paying.pricePerLesson,
              paying.discountPercent,
            ),
            paidTotal(paying.payments),
          )}
          onClose={() => setPayingId(null)}
          note={note}
        />
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}
