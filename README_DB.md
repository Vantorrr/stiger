# Настройка базы данных

## Локальная разработка

### Вариант 1: PostgreSQL (рекомендуется)

1. Установи PostgreSQL локально или используй Docker:
```bash
docker run --name stiger-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=stiger -p 5432:5432 -d postgres
```

2. Обнови `DATABASE_URL` в `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/stiger?schema=public"
```

3. Запусти миграции:
```bash
npx prisma migrate dev --name init
```

### Вариант 2: SQLite (для быстрого старта)

1. Измени `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Обнови `DATABASE_URL` в `.env`:
```
DATABASE_URL="file:./dev.db"
```

3. Запусти миграции:
```bash
npx prisma migrate dev --name init
```

## Продакшен (Vercel)

1. Создай Vercel Postgres в панели Vercel
2. Добавь `DATABASE_URL` в Environment Variables проекта
3. Запусти миграции:
```bash
npx prisma migrate deploy
```

## Полезные команды

- `npx prisma studio` - открыть Prisma Studio для просмотра данных
- `npx prisma migrate dev` - создать новую миграцию
- `npx prisma migrate deploy` - применить миграции в продакшене
- `npx prisma generate` - сгенерировать Prisma Client

