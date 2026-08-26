"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const NAV: { label: string; href: string | null; icon: string }[] = [
  { label: "Обзор", href: null, icon: "⌂" },
  { label: "Лиды", href: "/", icon: "▦" },
  { label: "Клиенты", href: "/clients", icon: "♙" },
  { label: "Ученики", href: null, icon: "♟" },
  { label: "Календарь", href: null, icon: "□" },
  { label: "Занятия", href: null, icon: "◉" },
  { label: "Абонементы", href: "/subscriptions", icon: "▤" },
  { label: "Финансы", href: null, icon: "₽" },
  { label: "Реклама", href: null, icon: "↗" },
  { label: "Шаблоны", href: "/templates", icon: "≡" },
];

export default function Sidebar({
  username,
  leadCount,
}: {
  username: string;
  leadCount: number;
}) {
  const pathname = usePathname();
  const [toast, setToast] = useState("");

  const note = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2000);
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
        {NAV.map((n) =>
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
