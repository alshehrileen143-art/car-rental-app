import Link from "next/link";
import Image from "next/image";
import { categoryLabel, transmissionLabel, fuelLabel, type CarCategory } from "@/lib/carOptions";
import { StarDisplay } from "@/components/StarRating";

type CarCardProps = {
  car: {
    id: string;
    name: string;
    brand: string;
    category: string;
    pricePerDay: number;
    seats: number;
    transmission: string;
    fuelType: string;
    location: string | null;
    images: { url: string }[];
  };
  averageRating?: number;
  reviewCount?: number;
};

export default function CarCard({ car, averageRating, reviewCount }: CarCardProps) {
  const image = car.images[0]?.url;

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        {image ? (
          <Image
            src={image}
            alt={car.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 1024px) 320px, 100vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            لا توجد صورة
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-zinc-500">
              {car.brand} · {categoryLabel[car.category as CarCategory] ?? car.category}
            </p>
            <h3 className="font-semibold">{car.name}</h3>
            {reviewCount ? (
              <div className="mt-1 flex items-center gap-1.5">
                <StarDisplay value={averageRating ?? 0} />
                <span className="text-xs text-zinc-500">({reviewCount})</span>
              </div>
            ) : null}
          </div>
          <div className="text-left">
            <p className="font-bold">{car.pricePerDay} ر.س</p>
            <p className="text-xs text-zinc-500">لليوم</p>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
            {car.seats} مقاعد
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
            {transmissionLabel[car.transmission] ?? car.transmission}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
            {fuelLabel[car.fuelType] ?? car.fuelType}
          </span>
          {car.location && (
            <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
              {car.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
