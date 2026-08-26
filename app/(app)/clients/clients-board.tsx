"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Client, Subscription } from "@prisma/client";
import { createClient } from "@/app/actions/clients";
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
};

type ClientWithSubs = Client & { subscriptions: SubscriptionDTO[] };

export default function ClientsBoard({
  clients,
}: {
  clients: ClientWithSubs[];
}) {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [subModal, setSubModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () =>
      clients.filter((c) =>
        (c.name + c.grade + c.subject).toLowerCase().includes(q.toLowerCase()),
      ),
    [clients, q],
  );

  const selected = clients.find((c) => c.id === selectedId) ?? null;

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

  return (
    <>
      <header>
        <div>
          <h1>Клиенты</h1>
          <p>Ученики и родители, которые уже оплачивают занятия</p>
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
            placeholder="Поиск по имени, классу, предмету..."
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
              <span>{c.grade}</span>
              <span>{c.subject}</span>
            </div>
            <footer>
              <span>{c.channel}</span>
              <time>{c.subscriptions.length} абонементов</time>
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
                <span>Достаточно имени, остальное можно заполнить позже</span>
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
                Класс
                <input name="grade" placeholder="9 класс" />
              </label>
            </div>
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
                <p>
                  {selected.grade} · {selected.subject}
                </p>
              </div>
            </div>
            <section className="block">
              <h3>Контакты</h3>
              <p>{selected.phone || "Телефон не указан"}</p>
            </section>
            <section className="block">
              <h3>Абонементы</h3>
              {selected.subscriptions.length === 0 && (
                <p>Абонементов пока нет</p>
              )}
              {selected.subscriptions.map((s) => (
                <div className="todo" key={s.id}>
                  <div>
                    <b>
                      {formatPeriod(s.periodStart)} · {s.subject}
                    </b>
                    <span>
                      {s.lessonsCount} занятий × {s.pricePerLesson} BYN
                      {s.discountPercent > 0 && ` · скидка ${s.discountPercent}%`}
                    </span>
                    <time>
                      {formatBYN(
                        subscriptionTotal(
                          s.lessonsCount,
                          s.pricePerLesson,
                          s.discountPercent,
                        ),
                      )}
                    </time>
                  </div>
                </div>
              ))}
              <button className="add" onClick={() => setSubModal(true)}>
                ＋ Добавить абонемент
              </button>
            </section>
          </aside>
        </div>
      )}

      {subModal && selected && (
        <SubscriptionModal
          clients={[]}
          fixedClientId={selected.id}
          clientName={selected.name}
          onClose={() => setSubModal(false)}
          note={note}
        />
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}
