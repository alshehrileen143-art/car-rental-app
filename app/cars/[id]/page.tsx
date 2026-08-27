import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { expandRangeToIsoDates } from "@/lib/dateRanges";
import { categoryLabel, transmissionLabel, fuelLabel, type CarCategory } from "@/lib/carOptions";
import BookingForm from "@/components/BookingForm";
import ReviewsSection from "@/components/ReviewsSection";

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!car || !car.isActive) {
    notFound();
  }

  const bookings = await prisma.booking.findMany({
    where: { carId: id, status: "CONFIRMED" },
    select: { startDate: true, endDate: true },
  });

  const bookedDates = bookings.flatMap((b) => expandRangeToIsoDates(b.startDate, b.endDate));

  const reviews = await prisma.review.findMany({
    where: { carId: id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800">
            {car.images[0] ? (
              <Image
                src={car.images[0].url}
                alt={car.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 560px, 100vw"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                لا توجد صورة
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              {car.brand} · {categoryLabel[car.category as CarCategory] ?? car.category}
            </p>
            <h1 className="text-3xl font-bold">{car.name}</h1>
            <p className="mt-3 text-2xl font-bold">
              {car.pricePerDay} ر.س <span className="text-sm font-normal text-zinc-500">/ اليوم</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
              {car.seats} مقاعد
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
              {transmissionLabel[car.transmission] ?? car.transmission}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
              {fuelLabel[car.fuelType] ?? car.fuelType}
            </span>
            {car.location && (
              <span className="rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
                {car.location}
              </span>
            )}
          </div>

          <p className="text-zinc-700 dark:text-zinc-300">{car.description}</p>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">اختر تواريخ الحجز</h2>
          <BookingForm carId={car.id} pricePerDay={car.pricePerDay} bookedDates={bookedDates} />
        </div>
      </div>

      <ReviewsSection carId={car.id} initialReviews={reviews} />
    </div>
  );
}
