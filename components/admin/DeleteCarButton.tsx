"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCarButton({ carId }: { carId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("هل تريد حذف/إلغاء نشر هذه السيارة؟")) return;
    setLoading(true);
    await fetch(`/api/cars/${carId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 underline disabled:opacity-50"
    >
      {loading ? "..." : "حذف"}
    </button>
  );
}
