"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { DateRange } from "react-day-picker";
import BookingCalendar from "@/components/BookingCalendar";
import { dateToLocalIso, expandLocalRange } from "@/lib/clientDates";

type BookingFormProps = {
  carId: string;
  pricePerDay: number;
  bookedDates: string[];
};

function daysInclusive(from: Date, to: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / ms) + 1;
}

export default function BookingForm({ carId, pricePerDay, bookedDates }: BookingFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [bookedSet, setBookedSet] = useState(new Set(bookedDates));
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const days = range?.from && range?.to ? daysInclusive(range.from, range.to) : 0;
  const total = days * pricePerDay;

  const canBook = useMemo(() => Boolean(range?.from && range?.to), [range]);

  async function handleBook() {
    if (!range?.from || !range?.to) return;

    if (!session) {
      router.push(`/login?callbackUrl=/cars/${carId}`);
      return;
    }

    const startIso = dateToLocalIso(range.from);
    const endIso = dateToLocalIso(range.to);

    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId, startDate: startIso, endDate: endIso }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "تعذر إتمام الحجز");
      return;
    }

    setSuccess(true);
    setRange(undefined);
    setBookedSet((prev) => {
      const next = new Set(prev);
      for (const iso of expandLocalRange(startIso, endIso)) next.add(iso);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <BookingCalendar bookedDates={bookedSet} selected={range} onSelect={setRange} />

      <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        {days > 0 ? (
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-zinc-500">
              {days} {days === 1 ? "يوم" : "أيام"}
            </span>
            <span className="text-lg font-bold">{total} ر.س</span>
          </div>
        ) : (
          <p className="mb-3 text-sm text-zinc-500">اختر تاريخ البداية والنهاية لعرض السعر الإجمالي.</p>
        )}

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {success && (
          <p className="mb-3 text-sm text-green-600">
            تم الحجز بنجاح! يمكنك مراجعته في صفحة{" "}
            <a href="/my-bookings" className="underline">
              حجوزاتي
            </a>
            .
          </p>
        )}

        <button
          onClick={handleBook}
          disabled={!canBook || loading}
          className="w-full rounded-full bg-black px-5 py-2.5 text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {loading ? "جاري الحجز..." : session ? "احجز الآن" : "سجّل الدخول للحجز"}
        </button>
      </div>
    </div>
  );
}
