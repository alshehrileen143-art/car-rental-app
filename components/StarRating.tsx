"use client";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.7L12 2.5Z"
      />
    </svg>
  );
}

/** Read-only star display for an average rating (rounded to the nearest whole star). */
export function StarDisplay({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const rounded = Math.round(value);
  const dims = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className={`flex gap-0.5 text-amber-500 ${dims}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={dims}>
          <Star filled={n <= rounded} />
        </span>
      ))}
    </div>
  );
}

/** Interactive 1-5 star picker. */
export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} من 5`}
          className="h-7 w-7 transition-transform hover:scale-110"
        >
          <Star filled={n <= value} />
        </button>
      ))}
    </div>
  );
}
