import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { carSchema } from "@/lib/validation";
import { resolveCarFilters, buildCarWhere } from "@/lib/carFilters";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get("includeInactive") === "true";

  const session = includeInactive ? await auth() : null;
  const canSeeInactive = includeInactive && session?.user.role === "ADMIN";

  const filters = resolveCarFilters({
    location: searchParams.get("location") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    seats: searchParams.get("seats") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    purpose: searchParams.get("purpose") ?? undefined,
  });

  const cars = await prisma.car.findMany({
    where: buildCarWhere(filters, { includeInactive: canSeeInactive }),
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cars });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = carSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const { images, location, ...rest } = parsed.data;

  const car = await prisma.car.create({
    data: {
      ...rest,
      location: location || null,
      images: { create: (images ?? []).map((url) => ({ url })) },
    },
    include: { images: true },
  });

  return NextResponse.json({ car }, { status: 201 });
}
