import { prisma } from "@/lib/prisma";
import CarCard from "@/components/CarCard";
import { CAR_CATEGORIES, categoryLabel } from "@/lib/carOptions";
import { resolveCarFilters, buildCarWhere, type CarSearchParams } from "@/lib/carFilters";

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<CarSearchParams>;
}) {
  const rawParams = await searchParams;
  const filters = resolveCarFilters(rawParams);

  const [cars, brands, locations] = await Promise.all([
    prisma.car.findMany({
      where: buildCarWhere(filters),
      include: { images: true, reviews: { select: { rating: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.car.findMany({ where: { isActive: true }, select: { brand: true }, distinct: ["brand"] }),
    prisma.car.findMany({
      where: { isActive: true, location: { not: null } },
      select: { location: true },
      distinct: ["location"],
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">نتائج البحث</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {cars.length} سيارة متاحة{filters.location ? ` في ${filters.location}` : ""}.
        </p>
      </div>

      <form className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex flex-col gap-1">
          <label htmlFor="location" className="text-xs text-zinc-500">
            المدينة
          </label>
          <select
            id="location"
            name="location"
            defaultValue={filters.location}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="">الكل</option>
            {locations.map((l) =>
              l.location ? (
                <option key={l.location} value={l.location}>
                  {l.location}
                </option>
              ) : null
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="brand" className="text-xs text-zinc-500">
            الماركة
          </label>
          <select
            id="brand"
            name="brand"
            defaultValue={filters.brand}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="">الكل</option>
            {brands.map((b) => (
              <option key={b.brand} value={b.brand}>
                {b.brand}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-xs text-zinc-500">
            نوع السيارة
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="">الكل</option>
            {CAR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="seats" className="text-xs text-zinc-500">
            الركاب (على الأقل)
          </label>
          <input
            id="seats"
            name="seats"
            type="number"
            min={1}
            defaultValue={filters.seats}
            className="w-24 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="minPrice" className="text-xs text-zinc-500">
            السعر من
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            defaultValue={filters.minPrice}
            className="w-24 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="maxPrice" className="text-xs text-zinc-500">
            السعر إلى
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            defaultValue={filters.maxPrice}
            className="w-24 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-xs text-zinc-500">
            من تاريخ
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={filters.startDate}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="endDate" className="text-xs text-zinc-500">
            إلى تاريخ
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={filters.endDate}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          تصفية
        </button>
      </form>

      {cars.length === 0 ? (
        <p className="text-zinc-500">لا توجد سيارات مطابقة لبحثك حاليًا.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => {
            const reviewCount = car.reviews.length;
            const averageRating = reviewCount
              ? car.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              : 0;
            return (
              <CarCard
                key={car.id}
                car={car}
                averageRating={averageRating}
                reviewCount={reviewCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
