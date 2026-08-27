import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bookings = await prisma.booking.findMany({
    where: { carId: id, status: "CONFIRMED" },
    select: { startDate: true, endDate: true },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json({ bookings });
}
