"use client";

import { type FormEvent } from "react";
import { createSubscription } from "@/app/actions/subscriptions";

export default function SubscriptionModal({
  students,
  fixedStudentId,
  studentName,
  onClose,
  note,
}: {
  students: { id: number; name: string; grade: string; clientName: string }[];
  fixedStudentId?: number;
  studentName?: string;
  onClose: () => void;
  note: (msg: string) => void;
}) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fixedStudentId) fd.set("studentId", String(fixedStudentId));
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
              {studentName
                ? `Для ученика: ${studentName}`
                : "Укажите ученика и параметры"}
            </span>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        {!fixedStudentId && (
          <label>
            Ученик
            <select name="studentId" required defaultValue="">
              <option value="" disabled>
                Выберите ученика
              </option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.grade} · платит {s.clientName}
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
