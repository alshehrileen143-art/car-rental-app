import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    carCount,
    activeCarCount,
    bookingCount,
    confirmedBookingCount,
    customerCount,
    blockedCustomerCount,
    totalRevenue,
    monthRevenue,
    topCarsGrouped,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", isBlocked: true } }),
    prisma.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { totalPrice: true } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", createdAt: { gte: startOfMonth } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.groupBy({
      by: ["carId"],
      where: { status: "CONFIRMED" },
      _sum: { totalPrice: true },
      _count: { _all: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 5,
    }),
  ]);

  const topCarIds = topCarsGrouped.map((g) => g.carId);
  const topCarDetails = await prisma.car.findMany({
    where: { id: { in: topCarIds } },
    select: { id: true, name: true, brand: true },
  });
  const topCars = topCarsGrouped.map((g) => ({
    car: topCarDetails.find((c) => c.id === g.carId),
    bookings: g._count._all,
    revenue: g._sum.totalPrice ?? 0,
  }));

  const stats = [
    { label: "إجمالي الإيرادات", value: `${(totalRevenue._sum.totalPrice ?? 0).toLocaleString()} ر.س` },
    { label: "إيرادات هذا الشهر", value: `${(monthRevenue._sum.totalPrice ?? 0).toLocaleString()} ر.س` },
    { label: "حجوزات مؤكدة", value: `${confirmedBookingCount} / ${bookingCount}` },
    { label: "السيارات المنشورة", value: `${activeCarCount} / ${carCount}` },
    { label: "العملاء", value: customerCount },
    { label: "عملاء محظورون", value: blockedCustomerCount },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">لوحة التحكم</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">الأكثر مبيعًا</h2>
        {topCars.length === 0 ? (
          <p className="text-sm text-zinc-500">لا توجد حجوزات بعد.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
            <table className="w-full min-w-[500px] text-sm">
              <thead className="bg-zinc-50 text-right dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium">السيارة</th>
                  <th className="px-4 py-3 font-medium">عدد الحجوزات</th>
                  <th className="px-4 py-3 font-medium">الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {topCars.map((t, i) => (
                  <tr key={t.car?.id ?? i} className="border-t border-black/10 dark:border-white/10">
                    <td className="px-4 py-3">
                      {t.car ? `${t.car.brand} ${t.car.name}` : "سيارة محذوفة"}
                    </td>
                    <td className="px-4 py-3">{t.bookings}</td>
                    <td className="px-4 py-3">{t.revenue.toLocaleString()} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
