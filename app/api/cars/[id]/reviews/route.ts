import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validation";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: { carId: id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "يجب تسجيل الدخول لإضافة تقييم" }, { status: 401 });
  }

  const { id: carId } = await params;
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) {
    return NextResponse.json({ error: "السيارة غير موجودة" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const review = await prisma.review.upsert({
    where: { carId_userId: { carId, userId: session.user.id } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: {
      carId,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ review }, { status: 201 });
}
