"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

type NavItem = { label: string; href: string | null; icon: string };

/** Разделы самой CRM — продажи и деньги. */
const CRM_NAV: NavItem[] = [
  { label: "Обзор", href: null, icon: "⌂" },
  { label: "Лиды", href: "/", icon: "▦" },
  { label: "Клиенты", href: "/clients", icon: "♙" },
  { label: "Ученики", href: "/students", icon: "♟" },
  { label: "Абонементы", href: "/subscriptions", icon: "▤" },
  { label: "Финансы", href: null, icon: "₽" },
  { label: "Реклама", href: null, icon: "↗" },
  { label: "Шаблоны", href: "/templates", icon: "≡" },
];

/**
 * Разделы «Кабинета ученика» — обучение. Живут в другом приложении, поэтому
 * это внешние ссылки; пути соответствуют его teacher-навигации
 * (kabinet/src/components/nav.ts).
 */
const KABINET_NAV: { label: string; path: string; icon: string }[] = [
  { label: "Календарь", path: "/teacher/calendar", icon: "□" },
  { label: "Занятия", path: "/teacher/groups", icon: "◉" },
  { label: "Ученики", path: "/teacher/students", icon: "♟" },
  { label: "Проверка работ", path: "/teacher/review", icon: "✓" },
  { label: "Материалы", path: "/teacher/assign", icon: "▣" },
];

export default function Sidebar({
  username,
  leadCount,
  kabinetAppUrl,
}: {
  username: string;
  leadCount: number;
  /** null, когда связь с «Кабинетом» не настроена. */
  kabinetAppUrl: string | null;
}) {
  const pathname = usePathname();
  const [toast, setToast] = useState("");

  const note = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <aside className="side">
      <div className="brand">
        <i>A</i>
        <div>
          <b>Art.Teach</b>
          <span>центр обучения</span>
        </div>
      </div>

      <nav>
        <div className="navgroup">CRM</div>
        {CRM_NAV.map((n) =>
          n.href ? (
            <Link
              key={n.label}
              href={n.href}
              className={pathname === n.href ? "active" : ""}
            >
              <i>{n.icon}</i>
              {n.label}
              {n.label === "Лиды" && <em>{leadCount}</em>}
            </Link>
          ) : (
            <button
              key={n.label}
              onClick={() => note(`Раздел «${n.label}» будет следующим`)}
            >
              <i>{n.icon}</i>
              {n.label}
            </button>
          ),
        )}

        <div className="navgroup sep">Кабинет ученика</div>
        {KABINET_NAV.map((n) =>
          kabinetAppUrl ? (
            <a
              key={n.label}
              href={`${kabinetAppUrl}${n.path}`}
              target="_blank"
              rel="noreferrer"
            >
              <i>{n.icon}</i>
              {n.label}
              <em className="ext">↗</em>
            </a>
          ) : (
            <button
              key={n.label}
              onClick={() =>
                note("Укажите KABINET_API_URL в .env, чтобы открыть «Кабинет»")
              }
            >
              <i>{n.icon}</i>
              {n.label}
            </button>
          ),
        )}
      </nav>

      <div className="bottom">
        <button>⚙ Настройки</button>
        <form action={logout}>
          <button className="wide">⏻ Выйти</button>
        </form>
        <div className="user">
          <i>{username[0]?.toUpperCase()}</i>
          <div>
            <b>{username}</b>
            <span>Администратор</span>
          </div>
          <strong>•••</strong>
        </div>
      </div>
      {toast && <div className="toast">✓ {toast}</div>}
    </aside>
  );
}
