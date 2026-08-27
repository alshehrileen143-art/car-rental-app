import { prisma } from "@/lib/prisma";
import ToggleBlockButton from "@/components/admin/ToggleBlockButton";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      bookings: { select: { status: true, totalPrice: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">العملاء</h1>

      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-zinc-50 text-right dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium">العميل</th>
              <th className="px-4 py-3 font-medium">تاريخ الانضمام</th>
              <th className="px-4 py-3 font-medium">عدد الحجوزات</th>
              <th className="px-4 py-3 font-medium">إجمالي الإنفاق</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const confirmedBookings = customer.bookings.filter((b) => b.status === "CONFIRMED");
              const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
              return (
                <tr key={customer.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-zinc-500">{customer.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(customer.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-4 py-3">{customer.bookings.length}</td>
                  <td className="px-4 py-3">{totalSpent.toLocaleString()} ر.س</td>
                  <td className="px-4 py-3">
                    <span className={customer.isBlocked ? "text-red-600" : "text-green-600"}>
                      {customer.isBlocked ? "محظور" : "نشط"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ToggleBlockButton userId={customer.id} isBlocked={customer.isBlocked} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="px-4 py-6 text-center text-zinc-500">لا يوجد عملاء بعد.</p>
        )}
      </div>
    </div>
  );
}
