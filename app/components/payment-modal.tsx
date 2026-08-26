"use client";

import { useState, type FormEvent } from "react";
import { createPayment } from "@/app/actions/payments";
import { formatBYN, formatPeriod } from "@/app/lib/subscriptions";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

export default function PaymentModal({
  subscriptionId,
  subject,
  periodStart,
  remaining,
  onClose,
  note,
}: {
  subscriptionId: number;
  subject: string;
  periodStart: Date;
  remaining: number;
  onClose: () => void;
  note: (msg: string) => void;
}) {
  const [fileError, setFileError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("subscriptionId", String(subscriptionId));

    const receipt = fd.get("receipt");
    if (receipt instanceof File && receipt.size > MAX_RECEIPT_BYTES) {
      setFileError("Файл больше 5 МБ — выберите файл поменьше");
      return;
    }

    await createPayment(fd);
    form.reset();
    onClose();
    note("Оплата записана");
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
            <b>Новая оплата</b>
            <span>
              {formatPeriod(periodStart)} · {subject} · остаток{" "}
              {formatBYN(remaining)}
            </span>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="row">
          <label>
            Сумма, BYN
            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              required
              autoFocus
              defaultValue={remaining > 0 ? remaining.toFixed(2) : ""}
            />
          </label>
          <label>
            Дата оплаты
            <input type="date" name="paidAt" required defaultValue={today} />
          </label>
        </div>
        <label>
          Чек (скриншот или PDF)
          <input
            type="file"
            name="receipt"
            accept="image/*,application/pdf"
            onChange={() => setFileError("")}
          />
        </label>
        {fileError && <div className="autherror">{fileError}</div>}
        <label>
          Комментарий
          <input name="note" placeholder="Например, перевод на карту" />
        </label>
        <div className="ma">
          <button type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="primary">Подтвердить оплату</button>
        </div>
      </form>
    </div>
  );
}
