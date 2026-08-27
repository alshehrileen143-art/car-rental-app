"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "كيف أحجز سيارة؟",
    answer:
      "اختر السيارة المناسبة من صفحة السيارات، حدد تاريخ الاستلام والتسليم، ثم أكمل بيانات الحجز والدفع لتأكيد الحجز.",
  },
  {
    question: "وش طريقة الدفع؟",
    answer: "الدفع إلكترونيًا عبر بطاقة الائتمان أو مدى عند تأكيد الحجز مباشرة.",
  },
  {
    question: "هل فيه رسوم إضافية؟",
    answer:
      "قد تُضاف رسوم إضافية مثل التأمين أو التوصيل حسب الخيارات التي تختارها، وتظهر تفاصيلها قبل تأكيد الحجز.",
  },
  {
    question: "كيف ألغي الحجز؟",
    answer: "من صفحة \"حجوزاتي\" يمكنك إلغاء الحجز قبل موعد الاستلام مباشرة.",
  },
  {
    question: "ما هي ساعات الدعم الفني؟",
    answer: "فريق الدعم الفني متاح يوميًا من الساعة 9 صباحًا حتى 11 مساءً.",
  },
];

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleQuestion(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900">
          <div className="flex items-center justify-between bg-black px-4 py-3 text-white dark:bg-white dark:text-black">
            <span className="font-bold">المساعد الافتراضي</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق"
              className="rounded-full p-1 hover:bg-white/20 dark:hover:bg-black/10"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-3">
            <p className="mb-2 px-1 text-sm text-black/60 dark:text-white/60">
              الأسئلة الشائعة
            </p>
            <ul className="flex flex-col gap-2">
              {FAQS.map((faq, index) => (
                <li
                  key={faq.question}
                  className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="flex w-full items-center justify-between gap-2 bg-zinc-50 px-3 py-2 text-right text-sm font-medium hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    {faq.question}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {openIndex === index && (
                    <p className="px-3 py-2 text-sm text-black/70 dark:text-white/70">
                      {faq.answer}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((current) => !current)}
        aria-label="فتح المساعد الافتراضي"
        title="المساعد الافتراضي"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-105 dark:bg-white dark:text-black"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h-1A2.5 2.5 0 0 1 2 13.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="8" cy="9.5" r="1" fill="currentColor" />
            <circle cx="12" cy="9.5" r="1" fill="currentColor" />
            <circle cx="16" cy="9.5" r="1" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
