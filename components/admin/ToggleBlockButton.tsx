"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleBlockButton({
  userId,
  isBlocked,
}: {
  userId: string;
  isBlocked: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const action = isBlocked ? "إلغاء حظر" : "حظر";
    if (!confirm(`هل تريد ${action} هذا العميل؟`)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/customers/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !isBlocked }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "تعذر تنفيذ العملية");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={
        isBlocked
          ? "text-sm text-green-600 underline disabled:opacity-50"
          : "text-sm text-red-600 underline disabled:opacity-50"
      }
    >
      {loading ? "..." : isBlocked ? "إلغاء الحظر" : "حظر"}
    </button>
  );
}
