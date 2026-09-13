import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteCarButton from "@/components/admin/DeleteCarButton";
import { categoryLabel, type CarCategory } from "@/lib/carOptions";

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">السيارات</h1>
        <Link
          href="/admin/cars/new"
          className="rounded-full bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover"
        >
          + إضافة سيارة
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-zinc-50 text-right dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium">السيارة</th>
              <th className="px-4 py-3 font-medium">النوع</th>
              <th className="px-4 py-3 font-medium">السعر/اليوم</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-3">
                  <p className="font-medium">{car.name}</p>
                  <p className="text-xs text-zinc-500">{car.brand}</p>
                </td>
                <td className="px-4 py-3">
                  {categoryLabel[car.category as CarCategory] ?? car.category}
                </td>
                <td className="px-4 py-3">{car.pricePerDay} ر.س</td>
                <td className="px-4 py-3">
                  <span className={car.isActive ? "text-green-600" : "text-zinc-500"}>
                    {car.isActive ? "منشورة" : "غير منشورة"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/cars/${car.id}/edit`} className="text-sm underline">
                      تعديل
                    </Link>
                    <DeleteCarButton carId={car.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && (
          <p className="px-4 py-6 text-center text-zinc-500">لا توجد سيارات بعد.</p>
        )}
      </div>
    </div>
  );
}
