import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function mapCategory(wikiCategory: string): string {
  const c = wikiCategory.toLowerCase();
  if (c.includes("suv") || c.includes("crossover")) return "suv";
  if (c.includes("van") || c.includes("minivan")) return "van";
  if (c.includes("pickup") || c.includes("truck")) return "pickup";
  if (c.includes("sedan")) return "sedan";
  if (c.includes("kei") || c.includes("hatchback") || c.includes("coupe")) return "economy";
  return "sedan";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const catalogItem = await prisma.carCatalog.findUnique({ where: { id } });
  if (!catalogItem) {
    return NextResponse.json({ error: "السيارة غير موجودة" }, { status: 404 });
  }

  const newCar = await prisma.$transaction(async (tx) => {
    const car = await tx.car.create({
      data: {
        name: catalogItem.name,
        brand: catalogItem.brand,
        category: mapCategory(catalogItem.category),
        description: catalogItem.description,
        pricePerDay: body.pricePerDay,
        seats: body.seats,
        transmission: body.transmission,
        fuelType: body.fuelType,
        location: body.location || null,
        images: body.imageUrl
          ? { create: [{ url: body.imageUrl }] }
          : undefined,
      },
    });

    await tx.carCatalog.update({
      where: { id },
      data: { isUsed: true },
    });

    return car;
  });

  return NextResponse.json(newCar);
}