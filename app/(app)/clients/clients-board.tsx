"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Client, Subscription } from "@prisma/client";
import { createClient } from "@/app/actions/clients";
import SubscriptionModal from "@/app/components/subscription-modal";
import PaymentModal from "@/app/components/payment-modal";
import StudentModal, { type StudentDraft } from "@/app/components/student-modal";
import type { PaymentDTO } from "@/app/(app)/subscriptions/subscriptions-board";
import type { KabinetStudent } from "@/app/lib/kabinet";
import {
  PAYMENT_STATUS_LABEL,
  formatBYN,
  formatDate,
  formatPeriod,
  paidTotal,
  paymentStatus,
  remainingAmount,
  subscriptionTotal,
} from "@/app/lib/subscriptions";

type SubscriptionDTO = Omit<
  Subscription,
  "pricePerLesson" | "discountPercent"
> & {
  pricePerLesson: number;
  discountPercent: number;
  payments: PaymentDTO[];
};

type StudentDTO = {
  id: number;
  name: string;
  grade: string;
  kabinetStudentId: string | null;
  subscriptions: SubscriptionDTO[];
};

type ClientWithStudents = Client & { students: StudentDTO[] };

export default function ClientsBoard({
  clients,
  roster,
}: {
  clients: ClientWithStudents[];
  roster: KabinetStudent[] | null;
}) {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [subForStudent, setSubForStudent] = useState<StudentDTO | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [studentModal, setStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentDraft | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () =>
      clients.filter((c) =>
        (c.name + c.who + c.students.map((s) => s.name + s.grade).join(" "))
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [clients, q],
  );

  const selected = clients.find((c) => c.id === selectedId) ?? null;
  const allSubs = selected?.students.flatMap((s) => s.subscriptions) ?? [];
  const paying = allSubs.find((s) => s.id === payingId) ?? null;

  const note = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2000);
  };

  async function handleAddClient(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    await createClient(fd);
    form.reset();
    setModal(false);
    note("Клиент добавлен");
  }

  function openNewStudent() {
    setEditingStudent(null);
    setStudentModal(true);
  }

  function openEditStudent(s: StudentDTO) {
    setEditingStudent({
      id: s.id,
      name: s.name,
      grade: s.grade,
      kabinetStudentId: s.kabinetStudentId,
    });
    setStudentModal(true);
  }

  return (
    <>
      <header>
        <div>
          <h1>Клиенты</h1>
          <p>Кто платит за занятия — обычно родители учеников</p>
        </div>
        <div className="actions">
          <button className="primary" onClick={() => setModal(true)}>
            ＋ Добавить клиента
          </button>
        </div>
      </header>

      <section className="toolbar">
        <label>
          ⌕
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по клиенту или ученику..."
          />
        </label>
      </section>

      <section className="grid">
        {filtered.map((c) => (
          <article
            className="card"
            key={c.id}
            onClick={() => setSelectedId(c.id)}
          >
            <div className="cardtop">
              <i style={{ background: "#7457e8" }}>{c.name[0]}</i>
              <div>
                <b>{c.name}</b>
                <span>{c.who}</span>
              </div>
              <strong>•••</strong>
            </div>
            <div className="tags">
              {c.students.length === 0 && <span>Учеников нет</span>}
              {c.students.map((s) => (
                <span key={s.id}>
                  {s.name} · {s.grade}
                </span>
              ))}
            </div>
            <footer>
              <span>{c.channel}</span>
              <time>
                {c.students.reduce((n, s) => n + s.subscriptions.length, 0)}{" "}
                абонементов
              </time>
            </footer>
          </article>
        ))}
        {filtered.length === 0 && <p>Клиентов пока нет</p>}
      </section>

      {modal && (
        <div className="overlay" onMouseDown={() => setModal(false)}>
          <form
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
            onSubmit={handleAddClient}
          >
            <div className="mh">
              <div>
                <b>Новый клиент</b>
                <span>Плательщик — ученики добавляются в его карточке</span>
              </div>
              <button type="button" onClick={() => setModal(false)}>
                ×
              </button>
            </div>
            <label>
              Имя
              <input name="name" required autoFocus placeholder="Мария" />
            </label>
            <div className="row">
              <label>
                Кто это
                <input name="who" placeholder="мама ученика" />
              </label>
              <label>
                Канал
                <select name="channel">
                  <option>Instagram</option>
                  <option>Telegram</option>
                  <option>Рекомендация</option>
                </select>
              </label>
            </div>
            <label>
              Телефон
              <input name="phone" placeholder="+375 29 000-00-00" />
            </label>
            <div className="ma">
              <button type="button" onClick={() => setModal(false)}>
                Отмена
              </button>
              <button className="primary">Создать клиента</button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div
          className="overlay drawerlay"
          onMouseDown={() => setSelectedId(null)}
        >
          <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mh">
              <div>
                <b>{selected.name}</b>
                <span>
                  {selected.who} · {selected.channel}
                </span>
              </div>
              <button onClick={() => setSelectedId(null)}>×</button>
            </div>
            <div className="person">
              <i style={{ background: "#7457e8" }}>{selected.name[0]}</i>
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.phone || "Телефон не указан"}</p>
              </div>
            </div>

            <section className="block">
              <h3>Ученики</h3>
              {selected.students.length === 0 && <p>Учеников пока нет</p>}
              {selected.students.map((st) => (
                <div className="subrow" key={st.id}>
                  <div className="subhead">
                    <b>
                      {st.name} · {st.grade}
                    </b>
                    <button
                      className="rowaction"
                      onClick={() => openEditStudent(st)}
                    >
                      ✎
                    </button>
                  </div>
                  <span>
                    {st.kabinetStudentId
                      ? `Кабинет: ${st.kabinetStudentId}`
                      : "Не связан с «Кабинетом»"}
                  </span>

                  {st.subscriptions.map((s) => {
                    const total = subscriptionTotal(
                      s.lessonsCount,
                      s.pricePerLesson,
                      s.discountPercent,
                    );
                    const paid = paidTotal(s.payments);
                    const status = paymentStatus(total, paid);
                    const remaining = remainingAmount(total, paid);
                    return (
                      <div className="payrow subsub" key={s.id}>
                        <div>
                          <b>
                            {formatPeriod(s.periodStart)} · {s.subject}
                          </b>
                          <span>
                            Итого {formatBYN(total)} · оплачено{" "}
                            {formatBYN(paid)}
                            {remaining > 0 &&
                              ` · остаток ${formatBYN(remaining)}`}
                          </span>
                          {s.payments.map((p) => (
                            <span key={p.id}>
                              {formatDate(p.paidAt)} — {formatBYN(p.amount)}
                              {p.hasReceipt && (
                                <>
                                  {" · "}
                                  <a
                                    href={`/api/receipts/${p.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    чек
                                  </a>
                                </>
                              )}
                            </span>
                          ))}
                        </div>
                        <div className="payside">
                          <span className={`badge ${status.toLowerCase()}`}>
                            {PAYMENT_STATUS_LABEL[status]}
                          </span>
                          {status !== "PAID" && (
                            <button
                              className="rowaction"
                              onClick={() => setPayingId(s.id)}
                            >
                              ＋ Оплата
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    className="add"
                    onClick={() => setSubForStudent(st)}
                  >
                    ＋ Абонемент
                  </button>
                </div>
              ))}
              <button className="add" onClick={openNewStudent}>
                ＋ Добавить ученика
              </button>
            </section>
          </aside>
        </div>
      )}

      {studentModal && selected && (
        <StudentModal
          clientId={selected.id}
          clientName={selected.name}
          editing={editingStudent}
          roster={roster}
          onClose={() => {
            setStudentModal(false);
            setEditingStudent(null);
          }}
          note={note}
        />
      )}

      {subForStudent && (
        <SubscriptionModal
          students={[]}
          fixedStudentId={subForStudent.id}
          studentName={subForStudent.name}
          onClose={() => setSubForStudent(null)}
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
