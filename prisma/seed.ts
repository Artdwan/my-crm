import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD must be set to seed the admin user",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash, role: "ADMIN" },
  });

  console.log(`Seeded admin user "${username}"`);

  await seedTemplates();
}

const STARTER_TEMPLATES = [
  {
    stage: "NEW" as const,
    title: "Первый ответ на заявку",
    body: `Здравствуйте, {имя}! Меня зовут Артур, центр обучения Art.Teach.
Вы писали по поводу занятий — {предмет}, {класс}.

Подскажите, пожалуйста, что сейчас даётся сложнее всего и какая цель: подтянуть оценки, закрыть пробелы или готовиться к экзамену?`,
  },
  {
    stage: "IN_DIALOG" as const,
    title: "Уточнение формата",
    body: `{имя}, спасибо за ответ!

У нас занятия проходят в мини-группах онлайн. Формат: 2 занятия в неделю по 60 минут, плюс разбор домашних заданий.

Подойдёт такой формат или вам интереснее индивидуальные занятия?`,
  },
  {
    stage: "QUALIFICATION" as const,
    title: "Приглашение на диагностику",
    body: `{имя}, предлагаю начать с бесплатной диагностики — это 30 минут, где преподаватель смотрит текущий уровень по предмету «{предмет}» и показывает, с чего начинать.

Когда удобно: в будни после 17:00 или в выходные днём?`,
  },
  {
    stage: "DIAGNOSTIC" as const,
    title: "Напоминание о диагностике",
    body: `{имя}, напоминаю про диагностику сегодня.

Ссылку пришлю за 10 минут до начала. Нужно: тихое место, наушники и тетрадь с ручкой. Если планы поменялись — скажите, перенесём.`,
  },
  {
    stage: "DECISION" as const,
    title: "Результат диагностики и условия",
    body: `{имя}, по итогам диагностики: базу видно, но есть пробелы, которые мешают двигаться дальше. При регулярных занятиях наверстаем.

Первый абонемент идёт со скидкой — так можно спокойно попробовать. Дальше — обычный ежемесячный абонемент.

Если всё подходит, скажите — и я закреплю место в группе.`,
  },
  {
    stage: null,
    title: "Follow-up после паузы",
    body: `{имя}, добрый день! Напоминаю о себе по поводу занятий — {предмет}.

Вопрос ещё актуален? Если сейчас не вовремя, скажите — напишу позже.`,
  },
  {
    stage: null,
    title: "Реквизиты для оплаты",
    body: `{имя}, для оплаты абонемента:

Карта: 0000 0000 0000 0000 (Артур)
Назначение: занятия, {предмет}

После оплаты пришлите, пожалуйста, чек — я подтвержу и закреплю место.`,
  },
];

async function seedTemplates() {
  // Only seed into an empty table: this runs on every container start, and
  // re-creating templates the user deliberately deleted would be worse than
  // starting empty.
  const existing = await prisma.template.count();
  if (existing > 0) {
    console.log(`Templates already present (${existing}) — skipping`);
    return;
  }

  await prisma.template.createMany({ data: STARTER_TEMPLATES });
  console.log(`Seeded ${STARTER_TEMPLATES.length} starter templates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
