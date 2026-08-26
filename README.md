This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This project needs a PostgreSQL database and a couple of environment
variables before it will run.

1. Copy `.env.example` to `.env` and fill in `POSTGRES_PASSWORD`,
   `SESSION_SECRET` (generate one with
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
   and `ADMIN_PASSWORD`.
2. Start Postgres (via Docker):
   ```bash
   docker compose up -d db
   ```
3. Apply migrations and seed the admin user:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) and log in with the
`ADMIN_USERNAME`/`ADMIN_PASSWORD` from your `.env`.

To run the whole app (not just the database) in Docker, use
`docker compose up --build` instead — it builds the app image, runs
migrations and seeding automatically, then starts the server on port 3000.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
