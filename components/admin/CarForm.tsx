"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAR_CATEGORIES, categoryLabel, type CarCategory } from "@/lib/carOptions";

type CarFormValues = {
  name: string;
  brand: string;
  category: CarCategory;
  description: string;
  pricePerDay: number;
  seats: number;
  transmission: "automatic" | "manual";
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  location: string;
  isActive: boolean;
  imagesText: string;
};

const defaultValues: CarFormValues = {
  name: "",
  brand: "",
  category: "sedan",
  description: "",
  pricePerDay: 0,
  seats: 5,
  transmission: "automatic",
  fuelType: "petrol",
  location: "",
  isActive: true,
  imagesText: "",
};

type CarFormProps = {
  carId?: string;
  initialValues?: Partial<CarFormValues>;
};

export default function CarForm({ carId, initialValues }: CarFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CarFormValues>({ ...defaultValues, ...initialValues });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(carId);

  function update<K extends keyof CarFormValues>(key: K, value: CarFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const images = values.imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: values.name,
      brand: values.brand,
      category: values.category,
      description: values.description,
      pricePerDay: values.pricePerDay,
      seats: values.seats,
      transmission: values.transmission,
      fuelType: values.fuelType,
      location: values.location,
      isActive: values.isActive,
      images,
    };

    const res = await fetch(isEdit ? `/api/cars/${carId}` : "/api/cars", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "حدث خطأ، حاول مرة أخرى");
      return;
    }

    router.push("/admin/cars");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">اسم السيارة</label>
          <input
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">الماركة</label>
          <input
            required
            value={values.brand}
            onChange={(e) => update("brand", e.target.value)}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">نوع السيارة</label>
          <select
            value={values.category}
            onChange={(e) => update("category", e.target.value as CarCategory)}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          >
            {CAR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-600 dark:text-zinc-400">الوصف</label>
        <textarea
          required
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">السعر/اليوم</label>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={values.pricePerDay}
            onChange={(e) => update("pricePerDay", Number(e.target.value))}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">المقاعد</label>
          <input
            required
            type="number"
            min={1}
            max={20}
            value={values.seats}
            onChange={(e) => update("seats", Number(e.target.value))}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">ناقل الحركة</label>
          <select
            value={values.transmission}
            onChange={(e) => update("transmission", e.target.value as CarFormValues["transmission"])}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          >
            <option value="automatic">أوتوماتيك</option>
            <option value="manual">يدوي</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">الوقود</label>
          <select
            value={values.fuelType}
            onChange={(e) => update("fuelType", e.target.value as CarFormValues["fuelType"])}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
          >
            <option value="petrol">بنزين</option>
            <option value="diesel">ديزل</option>
            <option value="electric">كهربائي</option>
            <option value="hybrid">هجين</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-600 dark:text-zinc-400">الموقع</label>
        <input
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-600 dark:text-zinc-400">
          روابط الصور (رابط في كل سطر)
        </label>
        <textarea
          rows={3}
          value={values.imagesText}
          onChange={(e) => update("imagesText", e.target.value)}
          placeholder="https://example.com/car1.jpg"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 font-mono text-xs dark:border-white/20"
        />
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
          />
          منشورة (تظهر للعملاء)
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-fit rounded-full bg-primary px-5 py-2.5 text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة السيارة"}
      </button>
    </form>
  );
}
