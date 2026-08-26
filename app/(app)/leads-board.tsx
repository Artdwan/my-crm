"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Lead, LeadStatus } from "@prisma/client";
import { STAGES, stageColor } from "@/app/lib/stages";
import { createLead, moveLead, setLeadStatus } from "@/app/actions/leads";
import { convertLeadToClient } from "@/app/actions/clients";
import { copyText, renderTemplate } from "@/app/lib/templates";

type LeadWithClient = Lead & { client: { id: number } | null };

type TemplateDTO = {
  id: number;
  title: string;
  body: string;
  stage: LeadStatus | null;
};

export default function LeadsBoard({
  leads,
  templates,
}: {
  leads: LeadWithClient[];
  templates: TemplateDTO[];
}) {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () =>
      leads.filter((x) =>
        (x.name + x.grade + x.subject).toLowerCase().includes(q.toLowerCase()),
      ),
    [leads, q],
  );

  const selected = leads.find((x) => x.id === selectedId) ?? null;

  const note = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2000);
  };

  async function handleAddLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    await createLead(fd);
    form.reset();
    setModal(false);
    note("Лид добавлен");
  }

  async function handleMove(id: number, direction: 1 | -1) {
    await moveLead(id, direction);
  }

  async function handleStatusChange(id: number, status: LeadStatus) {
    await setLeadStatus(id, status);
  }

  async function handleConvert(id: number) {
    await convertLeadToClient(id);
    note("Клиент создан");
  }

  async function handleCopyTemplate(body: string, lead: LeadWithClient) {
    const ok = await copyText(
      renderTemplate(body, {
        name: lead.name,
        grade: lead.grade,
        subject: lead.subject,
        channel: lead.channel,
      }),
    );
    note(ok ? "Текст скопирован" : "Не удалось скопировать — выделите вручную");
  }

  return (
    <>
      <header>
        <div>
          <h1>Лиды</h1>
          <p>Управляйте обращениями и ведите их до первой оплаты</p>
        </div>
        <div className="actions">
          <button className="square">?</button>
          <button className="square">♢</button>
          <button className="primary" onClick={() => setModal(true)}>
            ＋ Добавить лида
          </button>
        </div>
      </header>

      <section className="stats">
        <article>
          <span>Новые лиды · 30 дней</span>
          <b>47</b>
          <small>↗ 18%</small>
        </article>
        <article>
          <span>Квалифицированные</span>
          <b>26</b>
          <small>55% от новых</small>
        </article>
        <article>
          <span>Записи на диагностику</span>
          <b>14</b>
          <small>54% от квалиф.</small>
        </article>
        <article>
          <span>Новые оплаты</span>
          <b>8</b>
          <small>CAC 68 BYN</small>
        </article>
        <article className="accent">
          <span>Выручка с рекламы</span>
          <b>1 920 BYN</b>
          <small>ROAS 3,5×</small>
        </article>
      </section>

      <section className="toolbar">
        <label>
          ⌕
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по имени, классу, предмету..."
          />
        </label>
        <button>Все предметы⌄</button>
        <button>Все классы⌄</button>
        <button>Все источники⌄</button>
        <button>
          ⚲ Фильтры <b>2</b>
        </button>
      </section>

      <section className="workspace">
        <div className="board">
          {STAGES.map((stage, ci) => {
            const cards = filtered.filter((x) => x.status === stage.key);
            return (
              <div className="column" key={stage.key}>
                <div className="colhead">
                  <i className={`d${ci}`}></i>
                  <b>{stage.label}</b>
                  <em>{cards.length}</em>
                  <button onClick={() => setModal(true)}>＋</button>
                </div>
                {cards.map((x) => (
                  <article
                    className="card"
                    key={x.id}
                    onClick={() => setSelectedId(x.id)}
                  >
                    <div className="cardtop">
                      <i style={{ background: stageColor(x.status) }}>
                        {x.name[0]}
                      </i>
                      <div>
                        <b>{x.name}</b>
                        <span>{x.who}</span>
                      </div>
                      <strong>•••</strong>
                    </div>
                    <div className="tags">
                      <span>{x.grade}</span>
                      <span>{x.subject}</span>
                    </div>
                    <p>
                      <i style={{ background: stageColor(x.status) }}></i>
                      {x.sub}
                    </p>
                    {x.task && <aside>◷ {x.task}</aside>}
                    <footer>
                      <span>
                        {x.channel === "Instagram" ? "◎" : "◈"} {x.channel}
                      </span>
                      <time>сегодня</time>
                    </footer>
                    <div className="moves">
                      <button
                        disabled={ci === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(x.id, -1);
                        }}
                      >
                        ‹
                      </button>
                      <button
                        disabled={ci === STAGES.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(x.id, 1);
                        }}
                      >
                        ›
                      </button>
                    </div>
                  </article>
                ))}
                <button className="add" onClick={() => setModal(true)}>
                  ＋ Добавить
                </button>
              </div>
            );
          })}
        </div>

        <aside className="right">
          <div className="pt">
            <div>
              <b>Задачи на сегодня</b>
              <span>5 задач · 2 просрочено</span>
            </div>
            <button>→</button>
          </div>
          {[
            [
              "Ответить Анне К.",
              "Лид · 9 класс · Математика",
              "Просрочено на 18 мин",
            ],
            [
              "Диагностика: Дмитрий",
              "8 класс · Химия · Discord",
              "Сегодня, 18:00",
            ],
            [
              "Связаться после диагностики",
              "Результат от Дарьи получен",
              "Сегодня, 20:00",
            ],
          ].map((t, i) => (
            <div className={`todo ${i === 0 ? "late" : ""}`} key={t[0]}>
              <button
                onClick={(e) =>
                  (e.currentTarget.parentElement!.style.display = "none")
                }
              ></button>
              <div>
                <b>{t[0]}</b>
                <span>{t[1]}</span>
                <time>{t[2]}</time>
              </div>
            </div>
          ))}
          <button className="all">Все задачи →</button>
          <div className="pt events">
            <div>
              <b>Ближайшие события</b>
              <span>Календарь занятий</span>
            </div>
            <button>＋</button>
          </div>
          <div className="event">
            <time>18:00</time>
            <i></i>
            <div>
              <b>Диагностика · Химия</b>
              <span>Дмитрий, 8 класс</span>
              <small>Дарья · Discord</small>
            </div>
          </div>
          <div className="event">
            <time>19:30</time>
            <i className="purple"></i>
            <div>
              <b>Группа · Математика</b>
              <span>9 класс · 6 учеников</span>
              <small>Артур · Discord</small>
            </div>
          </div>
        </aside>
      </section>

      {modal && (
        <div className="overlay" onMouseDown={() => setModal(false)}>
          <form
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
            onSubmit={handleAddLead}
          >
            <div className="mh">
              <div>
                <b>Новый лид</b>
                <span>Для быстрого создания достаточно имени и канала</span>
              </div>
              <button type="button" onClick={() => setModal(false)}>
                ×
              </button>
            </div>
            <label>
              Имя или ник
              <input
                name="name"
                required
                autoFocus
                placeholder="Например, @maria_9"
              />
            </label>
            <div className="row">
              <label>
                Канал
                <select name="channel">
                  <option>Instagram</option>
                  <option>Telegram</option>
                  <option>Рекомендация</option>
                </select>
              </label>
              <label>
                Класс
                <input name="grade" placeholder="9 класс" />
              </label>
            </div>
            <label>
              Предмет
              <select name="subject">
                <option>Математика</option>
                <option>Химия</option>
                <option>ЦЭ / ЦТ</option>
              </select>
            </label>
            <div className="ma">
              <button type="button" onClick={() => setModal(false)}>
                Отмена
              </button>
              <button className="primary">Создать лида</button>
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
              <i style={{ background: stageColor(selected.status) }}>
                {selected.name[0]}
              </i>
              <div>
                <h2>{selected.name}</h2>
                <p>
                  {selected.grade} · {selected.subject}
                </p>
              </div>
            </div>
            <div className="tabs">
              <b>Обзор</b>
              <span>История</span>
              <span>Задачи</span>
            </div>
            <section className="block">
              <h3>Этап воронки</h3>
              <select
                value={selected.status}
                onChange={(e) =>
                  handleStatusChange(selected.id, e.target.value as LeadStatus)
                }
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <label>
                Подстатус
                <input value={selected.sub} readOnly />
              </label>
            </section>
            {selected.status === "RESULT" && (
              <section className="block">
                <h3>Клиент</h3>
                {selected.client ? (
                  <p>✓ Клиент создан</p>
                ) : (
                  <button
                    className="primary wide"
                    onClick={() => handleConvert(selected.id)}
                  >
                    ＋ Создать клиента
                  </button>
                )}
              </section>
            )}
            <section className="block">
              <h3>Шаблоны ответов</h3>
              {templates.length === 0 && (
                <p>Шаблонов пока нет — добавьте их в разделе «Шаблоны»</p>
              )}
              {templates
                // Stage-specific templates first, then the universal ones.
                .filter((t) => t.stage === null || t.stage === selected.status)
                .sort((a, b) => Number(a.stage === null) - Number(b.stage === null))
                .map((t) => (
                  <div className="tplrow" key={t.id}>
                    <div>
                      <b>{t.title}</b>
                      <span>
                        {renderTemplate(t.body, {
                          name: selected.name,
                          grade: selected.grade,
                          subject: selected.subject,
                          channel: selected.channel,
                        })}
                      </span>
                    </div>
                    <button
                      className="rowaction"
                      onClick={() => handleCopyTemplate(t.body, selected)}
                    >
                      ⧉
                    </button>
                  </div>
                ))}
            </section>
            <section className="block">
              <h3>Следующее действие</h3>
              <div className="next">
                ◷{" "}
                <div>
                  <b>{selected.task || "Добавить задачу"}</b>
                  <span>Напоминание появится в CRM и Telegram</span>
                </div>
              </div>
            </section>
            <section className="block">
              <h3>История</h3>
              <p>● Лид создан · источник {selected.channel}</p>
            </section>
            <button
              className="primary wide"
              onClick={() => note("Задача создана")}
            >
              ＋ Создать задачу
            </button>
          </aside>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}
