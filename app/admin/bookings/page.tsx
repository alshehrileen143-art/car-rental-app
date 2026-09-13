import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import CancelBookingButton from "@/components/CancelBookingButton";

const statusLabel: Record<string, string> = {
  CONFIRMED: "مؤكد",
  CANCELLED: "ملغى",
};

type SearchParams = { status?: string; carId?: string; q?: string };

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status, carId, q } = await searchParams;

  const where: Prisma.BookingWhereInput = {
    ...(status === "CONFIRMED" || status === "CANCELLED" ? { status } : {}),
    ...(carId ? { carId } : {}),
    ...(q?.trim()
      ? {
          user: {
            OR: [
              { name: { contains: q.trim() } },
              { email: { contains: q.trim() } },
            ],
          },
        }
      : {}),
  };

  const [bookings, cars] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { car: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.car.findMany({ select: { id: true, name: true, brand: true }, orderBy: { name: "asc" } }),
  ]);

  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">المبيعات</h1>
        <p className="text-sm text-zinc-500">
          {bookings.length} حجز · إجمالي {totalRevenue.toLocaleString()} ر.س
        </p>
      </div>

      <form className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs text-zinc-500">
            بحث عن عميل
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="الاسم أو البريد"
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="carId" className="text-xs text-zinc-500">
            السيارة
          </label>
          <select
            id="carId"
            name="carId"
            defaultValue={carId ?? ""}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="">الكل</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.brand} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-xs text-zinc-500">
            الحالة
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="">الكل</option>
            <option value="CONFIRMED">مؤكد</option>
            <option value="CANCELLED">ملغى</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2 text-sm text-white hover:bg-primary-hover"
        >
          تصفية
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[750px] text-sm">
          <thead className="bg-zinc-50 text-right dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium">العميل</th>
              <th className="px-4 py-3 font-medium">السيارة</th>
              <th className="px-4 py-3 font-medium">التواريخ</th>
              <th className="px-4 py-3 font-medium">السعر</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-3">
                  <p>{b.user.name}</p>
                  <p className="text-xs text-zinc-500">{b.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  {b.car.brand} {b.car.name}
                </td>
                <td className="px-4 py-3">
                  {new Date(b.startDate).toLocaleDateString("ar-SA")} —{" "}
                  {new Date(b.endDate).toLocaleDateString("ar-SA")}
                </td>
                <td className="px-4 py-3">{b.totalPrice} ر.س</td>
                <td className="px-4 py-3">
                  <span className={b.status === "CONFIRMED" ? "text-green-600" : "text-red-600"}>
                    {statusLabel[b.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {b.status === "CONFIRMED" && <CancelBookingButton bookingId={b.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="px-4 py-6 text-center text-zinc-500">لا توجد حجوزات مطابقة.</p>
        )}
      </div>
    </div>
  );
}
