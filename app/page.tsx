import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CAR_CATEGORIES, categoryLabel, TRIP_PURPOSES, purposeLabel } from "@/lib/carOptions";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const locations = await prisma.car.findMany({
    where: { isActive: true, location: { not: null } },
    select: { location: true },
    distinct: ["location"],
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">استأجر سيارتك التالية بسهولة</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          حدد احتياجك وشوف السيارات المتاحة اللي تناسبك.
        </p>
      </div>

      <form
        action="/cars"
        method="GET"
        className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="location" className="text-sm text-zinc-600 dark:text-zinc-400">
              المدينة
            </label>
            <select
              id="location"
              name="location"
              defaultValue=""
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
            >
              <option value="">أي مدينة</option>
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
            <label htmlFor="purpose" className="text-sm text-zinc-600 dark:text-zinc-400">
              الغرض من الاستخدام
            </label>
            <select
              id="purpose"
              name="purpose"
              defaultValue=""
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
            >
              <option value="">بدون تحديد</option>
              {TRIP_PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {purposeLabel[p]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm text-zinc-600 dark:text-zinc-400">
              نوع السيارة
            </label>
            <select
              id="category"
              name="category"
              defaultValue=""
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
            >
              <option value="">أي نوع</option>
              {CAR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="seats" className="text-sm text-zinc-600 dark:text-zinc-400">
              عدد الركاب
            </label>
            <input
              id="seats"
              name="seats"
              type="number"
              min={1}
              placeholder="مثال: 4"
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="minPrice" className="text-sm text-zinc-600 dark:text-zinc-400">
              السعر من (ر.س/يوم)
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min={0}
              placeholder="0"
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="maxPrice" className="text-sm text-zinc-600 dark:text-zinc-400">
              السعر إلى (ر.س/يوم)
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min={0}
              placeholder="بدون حد"
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="startDate" className="text-sm text-zinc-600 dark:text-zinc-400">
              من تاريخ
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="endDate" className="text-sm text-zinc-600 dark:text-zinc-400">
              إلى تاريخ
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-black px-5 py-3 font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          ابحث عن سيارة
        </button>
      </form>

      <Link
        href="/cars"
        className="mt-4 text-center text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        أو تصفّح كل السيارات مباشرة
      </Link>
    </div>
  );
}
