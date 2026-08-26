export type TemplateVars = {
  name: string;
  grade: string;
  subject: string;
  channel: string;
};

/**
 * Placeholders are written in Russian so they read naturally while editing
 * a template: «Здравствуйте! Вы писали по поводу {предмет} для {класс}.»
 */
export const PLACEHOLDERS: { token: string; label: string }[] = [
  { token: "{имя}", label: "имя лида" },
  { token: "{класс}", label: "класс" },
  { token: "{предмет}", label: "предмет" },
  { token: "{канал}", label: "источник" },
];

/**
 * navigator.clipboard is unavailable outside secure contexts (plain HTTP on a
 * server) and rejects when the document isn't focused, so callers need to know
 * whether the copy actually happened rather than eating an unhandled rejection.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function renderTemplate(body: string, vars: TemplateVars): string {
  return body
    .replaceAll("{имя}", vars.name)
    .replaceAll("{класс}", vars.grade)
    .replaceAll("{предмет}", vars.subject)
    .replaceAll("{канал}", vars.channel);
}
