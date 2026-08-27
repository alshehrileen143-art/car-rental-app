import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CancelBookingButton from "@/components/CancelBookingButton";

const statusLabel: Record<string, string> = {
  CONFIRMED: "مؤكد",
  CANCELLED: "ملغى",
};

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session) return null;

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { car: { include: { images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">حجوزاتي</h1>

      {bookings.length === 0 ? (
        <p className="text-zinc-500">لا توجد حجوزات بعد.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-zinc-900"
            >
              <div>
                <p className="font-semibold">
                  {booking.car.brand} {booking.car.name}
                </p>
                <p className="text-sm text-zinc-500">
                  {new Date(booking.startDate).toLocaleDateString("ar-SA")} —{" "}
                  {new Date(booking.endDate).toLocaleDateString("ar-SA")}
                </p>
                <p className="text-sm text-zinc-500">
                  {booking.totalPrice} ر.س ·{" "}
                  <span
                    className={booking.status === "CONFIRMED" ? "text-green-600" : "text-red-600"}
                  >
                    {statusLabel[booking.status]}
                  </span>
                </p>
              </div>
              {booking.status === "CONFIRMED" && <CancelBookingButton bookingId={booking.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
