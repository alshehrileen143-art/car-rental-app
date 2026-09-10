import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(process.cwd(), "toyota_vehicles.csv");
  const csvData = fs.readFileSync(csvPath, "utf-8");

  const rows = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  });

  let added = 0;
  for (const row of rows) {
    const existing = await prisma.carCatalog.findFirst({
      where: { name: row.Name, brand: "Toyota" },
    });
    if (existing) continue;

    await prisma.carCatalog.create({
      data: {
        name: row.Name,
        brand: "Toyota",
        category: row.Body_style,
        description: row.Description,
      },
    });
    added++;
  }

  console.log("Added " + added + " new cars to catalog");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
