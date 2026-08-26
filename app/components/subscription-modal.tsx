"use client";

import { type FormEvent } from "react";
import { createSubscription } from "@/app/actions/subscriptions";

export default function SubscriptionModal({
  clients,
  fixedClientId,
  clientName,
  onClose,
  note,
}: {
  clients: { id: number; name: string }[];
  fixedClientId?: number;
  clientName?: string;
  onClose: () => void;
  note: (msg: string) => void;
}) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fixedClientId) fd.set("clientId", String(fixedClientId));
    await createSubscription(fd);
    form.reset();
    onClose();
    note("Абонемент добавлен");
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="mh">
          <div>
            <b>Новый абонемент</b>
            <span>
              {clientName ? `Для клиента: ${clientName}` : "Укажите клиента и параметры"}
            </span>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        {!fixedClientId && (
          <label>
            Клиент
            <select name="clientId" required defaultValue="">
              <option value="" disabled>
                Выберите клиента
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="row">
          <label>
            Предмет
            <select name="subject">
              <option>Математика</option>
              <option>Химия</option>
              <option>ЦЭ / ЦТ</option>
            </select>
          </label>
          <label>
            Период
            <input type="month" name="periodStart" required />
          </label>
        </div>
        <div className="row">
          <label>
            Занятий
            <input
              type="number"
              name="lessonsCount"
              min="1"
              required
              placeholder="8"
            />
          </label>
          <label>
            Цена/занятие, BYN
            <input
              type="number"
              name="pricePerLesson"
              min="0"
              step="0.01"
              required
              placeholder="15"
            />
          </label>
        </div>
        <label>
          Скидка, %
          <input
            type="number"
            name="discountPercent"
            min="0"
            max="100"
            step="1"
            placeholder="0"
          />
        </label>
        <div className="ma">
          <button type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="primary">Создать абонемент</button>
        </div>
      </form>
    </div>
  );
}
