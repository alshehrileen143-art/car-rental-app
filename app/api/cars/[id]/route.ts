import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { carSchema } from "@/lib/validation";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!car) {
    return NextResponse.json({ error: "السيارة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ car });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.car.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "السيارة غير موجودة" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = carSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const { images, location, ...rest } = parsed.data;

  const car = await prisma.car.update({
    where: { id },
    data: {
      ...rest,
      ...(location !== undefined ? { location: location || null } : {}),
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images.map((url) => ({ url })),
            },
          }
        : {}),
    },
    include: { images: true },
  });

  return NextResponse.json({ car });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.car.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "السيارة غير موجودة" }, { status: 404 });
  }

  const activeBookings = await prisma.booking.count({
    where: { carId: id, status: "CONFIRMED" },
  });

  if (activeBookings > 0) {
    // Has active bookings: soft-delete instead of hard delete so history stays intact.
    const car = await prisma.car.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ car, softDeleted: true });
  }

  await prisma.car.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
