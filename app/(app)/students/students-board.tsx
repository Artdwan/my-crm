"use client";

import { useMemo, useState } from "react";
import type { KabinetStudent } from "@/app/lib/kabinet";
import StudentModal, { type StudentDraft } from "@/app/components/student-modal";

type StudentRow = {
  id: number;
  name: string;
  grade: string;
  kabinetStudentId: string | null;
  client: { id: number; name: string; who: string; phone: string | null };
  subscriptionCount: number;
  kabinet: KabinetStudent | null;
  kabinetUrl: string | null;
};

export default function StudentsBoard({
  students,
  roster,
  kabinetConfigured,
  kabinetReachable,
}: {
  students: StudentRow[];
  roster: KabinetStudent[] | null;
  kabinetConfigured: boolean;
  kabinetReachable: boolean;
}) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () =>
      students.filter((s) =>
        (s.name + s.grade + s.client.name)
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [students, q],
  );

  const note = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2000);
  };

  const draft: StudentDraft | null = editing
    ? {
        id: editing.id,
        name: editing.name,
        grade: editing.grade,
        kabinetStudentId: editing.kabinetStudentId,
      }
    : null;

  return (
    <>
      <header>
        <div>
          <h1>Ученики</h1>
          <p>Дети, за которых платят клиенты. Учёба ведётся в «Кабинете»</p>
        </div>
      </header>

      {kabinetConfigured && !kabinetReachable && (
        <p className="hint">
          «Кабинет» не отвечает — данные об успеваемости временно недоступны.
        </p>
      )}
      {!kabinetConfigured && (
        <p className="hint">
          Связь с «Кабинетом» не настроена: задайте KABINET_API_URL и
          KABINET_TOKEN в .env, чтобы подтягивать успеваемость.
        </p>
      )}

      <section className="toolbar">
        <label>
          ⌕
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по ученику, классу или клиенту..."
          />
        </label>
      </section>

      <section className="grid">
        {filtered.map((s) => (
          <article className="card" key={s.id} onClick={() => setEditing(s)}>
            <div className="cardtop">
              <i style={{ background: "#299fe6" }}>{s.name[0]}</i>
              <div>
                <b>{s.name}</b>
                <span>{s.grade}</span>
              </div>
              <strong>•••</strong>
            </div>
            <div className="tags">
              <span>
                {s.client.who}: {s.client.name}
              </span>
              <span>{s.subscriptionCount} абонементов</span>
            </div>
            {s.kabinetStudentId ? (
              <p>
                <i style={{ background: "#4fb78a" }}></i>
                {s.kabinet
                  ? `Кабинет · ${s.kabinet.avg}/${s.kabinet.goal} баллов${
                      s.kabinet.overdue > 0
                        ? ` · просрочено ДЗ: ${s.kabinet.overdue}`
                        : ""
                    }`
                  : `Связан с «Кабинетом» (${s.kabinetStudentId})`}
              </p>
            ) : (
              <p>
                <i style={{ background: "#9aa0ab" }}></i>
                Не связан с «Кабинетом»
              </p>
            )}
            {s.kabinet?.groupNames.length ? (
              <footer>
                <span>{s.kabinet.groupNames.join(", ")}</span>
                {s.kabinetUrl && (
                  <a
                    href={s.kabinetUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    открыть →
                  </a>
                )}
              </footer>
            ) : (
              s.kabinetUrl && (
                <footer>
                  <span />
                  <a
                    href={s.kabinetUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    открыть в «Кабинете» →
                  </a>
                </footer>
              )
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <p>Учеников пока нет — добавьте их в карточке клиента</p>
        )}
      </section>

      {editing && (
        <StudentModal
          clientId={editing.client.id}
          clientName={editing.client.name}
          editing={draft}
          roster={roster}
          onClose={() => setEditing(null)}
          note={note}
        />
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}
