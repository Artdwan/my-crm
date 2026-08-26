"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form className="authcard" action={action}>
      <div className="brand">
        <i>A</i>
        <div>
          <b>Art.Teach</b>
          <span>центр обучения</span>
        </div>
      </div>
      <h1>Вход в CRM</h1>
      <p>Используйте логин и пароль администратора</p>
      <label>
        Логин
        <input name="username" required autoFocus placeholder="arthur" />
      </label>
      <label>
        Пароль
        <input name="password" type="password" required placeholder="••••••••" />
      </label>
      {state?.error && <div className="autherror">{state.error}</div>}
      <button className="primary wide" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
