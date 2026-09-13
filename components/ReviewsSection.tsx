"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { StarDisplay, StarInput } from "@/components/StarRating";

type ReviewData = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  userId: string;
  user: { id: string; name: string };
};

export default function ReviewsSection({
  carId,
  initialReviews,
}: {
  carId: string;
  initialReviews: ReviewData[];
}) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const myReview = session ? reviews.find((r) => r.userId === session.user.id) : undefined;

  useEffect(() => {
    if (myReview) {
      // Prefills the form once the caller's existing review is known (after
      // session/reviews load) without clobbering an in-progress edit.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
    // Only re-sync when the identity of "my review" changes (e.g. once the
    // session/reviews load), not on every keystroke while editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myReview?.id]);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("اختر تقييمًا من 1 إلى 5 نجوم");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/cars/${carId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "تعذر إرسال التقييم");
      return;
    }

    setReviews((prev) => {
      const withoutMine = prev.filter((r) => r.id !== data.review.id);
      return [data.review, ...withoutMine];
    });
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("هل تريد حذف هذا التقييم؟")) return;
    await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    if (session && reviewId === myReview?.id) {
      setRating(0);
      setComment("");
    }
  }

  return (
    <div className="mt-10 border-t border-black/10 pt-8 dark:border-white/10">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-xl font-bold">التقييمات والمراجعات</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <StarDisplay value={average} size="md" />
            <span>
              {average.toFixed(1)} ({reviews.length} تقييم)
            </span>
          </div>
        )}
      </div>

      {session ? (
        <form
          onSubmit={handleSubmit}
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
        >
          <p className="text-sm font-medium">{myReview ? "عدّل تقييمك" : "أضف تقييمك"}</p>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            required
            placeholder="شاركنا رأيك في هذه السيارة..."
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-fit rounded-full bg-primary px-5 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? "جاري الإرسال..." : myReview ? "تحديث التقييم" : "نشر التقييم"}
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-zinc-500">
          <Link href={`/login?callbackUrl=/cars/${carId}`} className="underline">
            سجّل الدخول
          </Link>{" "}
          لإضافة تقييم.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-zinc-500">لا توجد تقييمات بعد. كن أول من يقيّم هذه السيارة.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => {
            const canDelete =
              session && (session.user.id === review.userId || session.user.role === "ADMIN");
            return (
              <div
                key={review.id}
                className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.user.name}</span>
                    <StarDisplay value={review.rating} />
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-xs text-red-600 underline"
                    >
                      حذف
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{review.comment}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(review.createdAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
