/**
 * Демонстрационные заявки для локальной проверки CRM.
 * Запуск: npm run db:seed  (нужен DATABASE_URL и `npx prisma generate`)
 *
 * Если база данных не подключена, скрипт наполнит локальное JSON-хранилище
 * (.data/leads.json), чтобы интерфейс CRM можно было посмотреть сразу.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const HAS_DATABASE = Boolean(process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL);

const SAMPLES = [
  {
    name: 'Мария Соколова',
    email: 'maria@example.com',
    comment: 'Интересуют книги 1 и 5, нужны обе языковые версии.',
    locale: 'ru',
    status: 'new',
  },
  {
    name: 'Anna Kowalski',
    email: 'anna.kowalski@example.com',
    comment: 'We would love the English edition for our bilingual daughter.',
    locale: 'en',
    status: 'contacted',
  },
  {
    name: 'Ирина Петрова',
    email: 'irina.p@example.com',
    comment: 'Возьму весь цикл, когда выйдет.',
    locale: 'ru',
    status: 'confirmed',
  },
  {
    name: 'David Miller',
    email: 'david.miller@example.com',
    comment: null,
    locale: 'en',
    status: 'in_progress',
  },
];

async function seedJson() {
  const dir = process.env.LOCAL_DATA_DIR || '.data';
  const file = path.resolve(process.cwd(), dir, 'leads.json');

  const leads = SAMPLES.map((sample, index) => {
    const created = new Date(Date.now() - index * 36 * 60 * 60 * 1000);
    return {
      id: crypto.randomUUID(),
      comment: null,
      notes: null,
      consent: true,
      source: 'seed',
      ip: '127.0.0.1',
      userAgent: 'seed-script',
      ...sample,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    };
  });

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(leads, null, 2), 'utf8');
  console.log(`✓ Записано ${leads.length} заявок в ${file}`);
}

async function seedPostgres() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  let created = 0;
  for (const sample of SAMPLES) {
    await prisma.lead.create({ data: sample });
    created += 1;
  }

  await prisma.$disconnect();
  console.log(`✓ Создано ${created} заявок в PostgreSQL`);
}

if (HAS_DATABASE) {
  await seedPostgres();
} else {
  await seedJson();
}
