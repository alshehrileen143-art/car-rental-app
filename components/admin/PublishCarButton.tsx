"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishCarButton({ catalogId }: { catalogId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pricePerDay, setPricePerDay] = useState("");
  const [seats, setSeats] = useState("");
  const [transmission, setTransmission] = useState("automatic");
  const [fuelType, setFuelType] = useState("petrol");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");

 async function handlePublish() {
  setLoading(true);
  try {
    const res = await fetch(`/api/catalog/${catalogId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricePerDay: parseFloat(pricePerDay),
        seats: parseInt(seats),
        transmission,
        fuelType,
        location,
        imageUrl,
      }),
    });

      if (!res.ok) throw new Error("فشل النشر");

      setOpen(false);
      router.refresh();
    } catch (e) {
      alert("حدث خطأ أثناء النشر");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-black px-3 py-1.5 text-xs text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        نشر
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-bold">إكمال بيانات السيارة</h2>

        <div className="space-y-3">
          <input
            type="number"
            placeholder="السعر لليوم (ر.س)"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-800"
          />
          <input
            type="number"
            placeholder="عدد المقاعد"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-800"
          />
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-800"
          >
            <option value="automatic">أوتوماتيك</option>
            <option value="manual">عادي</option>
          </select>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-800"
          >
            <option value="petrol">بنزين</option>
            <option value="hybrid">هايبرد</option>
            <option value="electric">كهرباء</option>
          </select>
          <input
            type="text"
            placeholder="الموقع (اختياري)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-800"
          
            />
          <input
            type="text"
            placeholder="رابط الصورة"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-800"
     
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            className="rounded-full px-3 py-1.5 text-xs text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
          >
            إلغاء
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="rounded-full bg-black px-3 py-1.5 text-xs text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            {loading ? "جاري النشر..." : "نشر السيارة"}
          </button>
        </div>
      </div>
    </div>
  );
}