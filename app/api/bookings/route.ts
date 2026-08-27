import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validation";
import { nightsBetween, toCalendarDate } from "@/lib/dateRanges";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { car: { include: { images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "يجب تسجيل الدخول للحجز" }, { status: 401 });
  }

  const requester = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!requester || requester.isBlocked) {
    return NextResponse.json({ error: "تم حظر حسابك من إجراء حجوزات جديدة" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  const { carId } = parsed.data;
  const startDate = toCalendarDate(parsed.data.startDate);
  const endDate = toCalendarDate(parsed.data.endDate);

  const today = toCalendarDate(new Date());
  if (startDate.getTime() < today.getTime()) {
    return NextResponse.json({ error: "لا يمكن الحجز في تاريخ ماضٍ" }, { status: 400 });
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const car = await tx.car.findUnique({ where: { id: carId } });
      if (!car || !car.isActive) {
        throw new Error("CAR_NOT_FOUND");
      }

      const conflict = await tx.booking.findFirst({
        where: {
          carId,
          status: "CONFIRMED",
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      });
      if (conflict) {
        throw new Error("DATES_UNAVAILABLE");
      }

      const totalDays = nightsBetween(startDate, endDate) + 1;
      const totalPrice = car.pricePerDay * totalDays;

      return tx.booking.create({
        data: {
          carId,
          userId: session.user.id,
          startDate,
          endDate,
          totalPrice,
          status: "CONFIRMED",
        },
        include: { car: true },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "DATES_UNAVAILABLE") {
      return NextResponse.json(
        { error: "تم حجز هذه التواريخ للتو، يرجى اختيار تواريخ أخرى" },
        { status: 409 }
      );
    }
    if (err instanceof Error && err.message === "CAR_NOT_FOUND") {
      return NextResponse.json({ error: "السيارة غير متوفرة" }, { status: 404 });
    }
    throw err;
  }
}
