"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { ar } from "react-day-picker/locale";
import { dateToLocalIso } from "@/lib/clientDates";

type BookingCalendarProps = {
  bookedDates: Set<string>;
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
};

export default function BookingCalendar({ bookedDates, selected, onSelect }: BookingCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-900">
      <DayPicker
        mode="range"
        locale={ar}
        dir="rtl"
        numberOfMonths={1}
        selected={selected}
        onSelect={onSelect}
        disabled={[{ before: today }, (date) => bookedDates.has(dateToLocalIso(date))]}
        excludeDisabled
      />
      <div className="mt-2 flex items-center gap-4 border-t border-black/10 px-1 pt-3 text-xs text-zinc-500 dark:border-white/10">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          محجوز / غير متاح
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-primary" />
          محدد
        </span>
      </div>
    </div>
  );
}
