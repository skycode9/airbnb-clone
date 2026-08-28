import "dotenv/config";
import { defineConfig } from "prisma/config";

const prismaUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!prismaUrl) {
  throw new Error(
    "DIRECT_URL or DATABASE_URL must be set in .env for Prisma CLI commands.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: prismaUrl,
  },
});
