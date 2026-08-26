"use client";

import { useState, type FormEvent } from "react";
import type { KabinetStudent } from "@/app/lib/kabinet";
import { createStudent, deleteStudent, updateStudent } from "@/app/actions/students";

export type StudentDraft = {
  id: number;
  name: string;
  grade: string;
  kabinetStudentId: string | null;
};

export default function StudentModal({
  clientId,
  clientName,
  editing,
  roster,
  onClose,
  note,
}: {
  clientId: number;
  clientName?: string;
  editing?: StudentDraft | null;
  /** null when Кабинет is unconfigured or unreachable — falls back to manual entry. */
  roster: KabinetStudent[] | null;
  onClose: () => void;
  note: (msg: string) => void;
}) {
  const [linkId, setLinkId] = useState(editing?.kabinetStudentId ?? "");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("clientId", String(clientId));
    fd.set("kabinetStudentId", linkId);

    if (editing) {
      await updateStudent(editing.id, fd);
      note("Ученик обновлён");
    } else {
      await createStudent(fd);
      note("Ученик добавлен");
    }
    form.reset();
    onClose();
  }

  async function handleDelete() {
    if (!editing) return;
    await deleteStudent(editing.id);
    onClose();
    note("Ученик удалён");
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
            <b>{editing ? "Изменить ученика" : "Новый ученик"}</b>
            <span>{clientName ? `Платит: ${clientName}` : "Ученик клиента"}</span>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="row">
          <label>
            Имя ученика
            <input
              name="name"
              required
              autoFocus
              defaultValue={editing?.name ?? ""}
              placeholder="Максим"
            />
          </label>
          <label>
            Класс
            <input
              name="grade"
              defaultValue={editing?.grade ?? ""}
              placeholder="9 класс"
            />
          </label>
        </div>

        <label>
          Ученик в «Кабинете»
          {roster ? (
            <select value={linkId} onChange={(e) => setLinkId(e.target.value)}>
              <option value="">Не связан</option>
              {roster.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.grade} класс
                  {r.groupNames.length > 0 && ` · ${r.groupNames.join(", ")}`}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={linkId}
              onChange={(e) => setLinkId(e.target.value)}
              placeholder="id ученика, например acc-st"
            />
          )}
        </label>
        {!roster && (
          <p className="hint">
            «Кабинет» сейчас недоступен — id можно вписать вручную, связь
            заработает, когда сервис поднимется.
          </p>
        )}

        <div className="ma">
          {editing && (
            <button type="button" className="danger" onClick={handleDelete}>
              Удалить
            </button>
          )}
          <button type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="primary">
            {editing ? "Сохранить" : "Добавить ученика"}
          </button>
        </div>
      </form>
    </div>
  );
}
