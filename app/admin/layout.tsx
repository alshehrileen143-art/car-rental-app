import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:flex-row sm:px-6">
      <aside className="flex shrink-0 flex-row gap-2 sm:w-48 sm:flex-col">
        <Link
          href="/admin"
          className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          نظرة عامة
        </Link>
        <Link
          href="/admin/cars"
          className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          السيارات
        </Link>
        <Link
          href="/admin/bookings"
          className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          المبيعات
        </Link>
        <Link
          href="/admin/customers"
          className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        >
          العملاء
        </Link>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
