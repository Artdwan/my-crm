"use client";

import { useState } from "react";
import type { Subscription } from "@prisma/client";
import SubscriptionModal from "@/app/components/subscription-modal";
import {
  formatBYN,
  formatPeriod,
  subscriptionTotal,
} from "@/app/lib/subscriptions";

type SubscriptionDTO = Omit<
  Subscription,
  "pricePerLesson" | "discountPercent"
> & {
  pricePerLesson: number;
  discountPercent: number;
  client: { id: number; name: string };
};

export default function SubscriptionsBoard({
  subscriptions,
  clients,
}: {
  subscriptions: SubscriptionDTO[];
  clients: { id: number; name: string }[];
}) {
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");

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
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id}>
                  <td>{s.client.name}</td>
                  <td>{s.subject}</td>
                  <td>{formatPeriod(s.periodStart)}</td>
                  <td>{s.lessonsCount}</td>
                  <td>{formatBYN(s.pricePerLesson)}</td>
                  <td>{s.discountPercent > 0 ? `${s.discountPercent}%` : "—"}</td>
                  <td>
                    {formatBYN(
                      subscriptionTotal(
                        s.lessonsCount,
                        s.pricePerLesson,
                        s.discountPercent,
                      ),
                    )}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={7}>Абонементов пока нет</td>
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

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}
