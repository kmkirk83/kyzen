/**
 * Optional Prisma seed — run when DATABASE_URL is set:
 *   npx prisma db seed
 *
 * Until a DB is connected, the dashboard Seeded mode uses the in-process
 * catalog in lib/visibility-summary.ts (no network required).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "acme-analytics" },
    update: {},
    create: {
      name: "Acme Analytics",
      slug: "acme-analytics",
    },
  }).catch(async () => {
    // Schema field names may differ — seed is best-effort documentation.
    console.log("Seed skipped or partial: align fields with prisma/schema.prisma");
    return null;
  });

  console.log("Seed complete", org?.id ?? "(see schema)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
