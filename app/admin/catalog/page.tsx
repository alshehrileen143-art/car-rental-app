import { prisma } from "@/lib/prisma";
import PublishCarButton from "@/components/admin/PublishCarButton";

export default async function AdminCatalogPage() {
  const cars = await prisma.carCatalog.findMany({
    where: { isUsed: false, name: { not: "" } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">مخزن السيارات (Catalog)</h1>
        <p className="mt-1 text-sm text-zinc-500">
          اختاري سيارة من القائمة وعبّي بياناتها الناقصة لنشرها للعملاء.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-zinc-50 text-right dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium">السيارة</th>
              <th className="px-4 py-3 font-medium">النوع</th>
              <th className="px-4 py-3 font-medium">الوصف</th>
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
                <td className="px-4 py-3">{car.category}</td>
                <td className="max-w-xs px-4 py-3 text-xs text-zinc-500">
                  {car.description}
                </td>
                <td className="px-4 py-3">
                  <PublishCarButton catalogId={car.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && (
          <p className="px-4 py-6 text-center text-zinc-500">لا توجد سيارات بالمخزن حاليًا.</p>
        )}
      </div>
    </div>
  );
}