"use client";

import { useState, type FormEvent } from "react";
import type { Template, LeadStatus } from "@prisma/client";
import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from "@/app/actions/templates";
import { PLACEHOLDERS, copyText } from "@/app/lib/templates";
import { STAGES } from "@/app/lib/stages";

function stageLabel(stage: LeadStatus | null): string {
  if (!stage) return "Любой этап";
  return STAGES.find((s) => s.key === stage)?.label ?? "Любой этап";
}

export default function TemplatesBoard({
  templates,
}: {
  templates: Template[];
}) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [toast, setToast] = useState("");

  const note = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2000);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (editing) {
      await updateTemplate(editing.id, fd);
      note("Шаблон обновлён");
    } else {
      await createTemplate(fd);
      note("Шаблон добавлен");
    }
    form.reset();
    setModal(false);
    setEditing(null);
  }

  async function handleDelete(id: number) {
    await deleteTemplate(id);
    setEditing(null);
    setModal(false);
    note("Шаблон удалён");
  }

  async function handleCopy(body: string) {
    const ok = await copyText(body);
    note(ok ? "Скопировано" : "Не удалось скопировать — выделите вручную");
  }

  function openNew() {
    setEditing(null);
    setModal(true);
  }

  function openEdit(t: Template) {
    setEditing(t);
    setModal(true);
  }

  return (
    <>
      <header>
        <div>
          <h1>Шаблоны</h1>
          <p>Готовые ответы для быстрой переписки с лидами</p>
        </div>
        <div className="actions">
          <button className="primary" onClick={openNew}>
            ＋ Добавить шаблон
          </button>
        </div>
      </header>

      <section className="grid">
        {templates.map((t) => (
          <article className="card" key={t.id}>
            <div className="cardtop">
              <div>
                <b>{t.title}</b>
                <span>{stageLabel(t.stage)}</span>
              </div>
            </div>
            <pre className="tplbody">{t.body}</pre>
            <div className="tplactions">
              <button className="rowaction" onClick={() => handleCopy(t.body)}>
                ⧉ Копировать
              </button>
              <button className="rowaction" onClick={() => openEdit(t)}>
                ✎ Изменить
              </button>
            </div>
          </article>
        ))}
        {templates.length === 0 && <p>Шаблонов пока нет</p>}
      </section>

      {modal && (
        <div
          className="overlay"
          onMouseDown={() => {
            setModal(false);
            setEditing(null);
          }}
        >
          <form
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <div className="mh">
              <div>
                <b>{editing ? "Изменить шаблон" : "Новый шаблон"}</b>
                <span>
                  Подстановки: {PLACEHOLDERS.map((p) => p.token).join(", ")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModal(false);
                  setEditing(null);
                }}
              >
                ×
              </button>
            </div>
            <label>
              Название
              <input
                name="title"
                required
                autoFocus
                defaultValue={editing?.title ?? ""}
                placeholder="Первый ответ на заявку"
              />
            </label>
            <label>
              Этап воронки
              <select name="stage" defaultValue={editing?.stage ?? ""}>
                <option value="">Любой этап</option>
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Текст
              <textarea
                name="body"
                required
                rows={8}
                defaultValue={editing?.body ?? ""}
                placeholder="Здравствуйте, {имя}! Вы писали по поводу занятий по предмету {предмет}."
              />
            </label>
            <div className="ma">
              {editing && (
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDelete(editing.id)}
                >
                  Удалить
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setModal(false);
                  setEditing(null);
                }}
              >
                Отмена
              </button>
              <button className="primary">
                {editing ? "Сохранить" : "Создать шаблон"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}
