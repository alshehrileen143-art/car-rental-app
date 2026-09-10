import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const cars = await prisma.carCatalog.findMany({
    where: { isUsed: false },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cars);
}