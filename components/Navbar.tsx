"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-black">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-bold text-primary">
          تأجير السيارات
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/cars" className="hover:underline">
            السيارات
          </Link>

          <ThemeToggle />

          {status === "loading" ? null : session ? (
            <>
              {session.user.role === "CUSTOMER" && (
                <Link href="/my-bookings" className="hover:underline">
                  حجوزاتي
                </Link>
              )}
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="hover:underline">
                  لوحة التحكم
                </Link>
              )}
              <span className="text-black/60 dark:text-white/60">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full bg-primary px-4 py-1.5 text-white transition-colors hover:bg-primary-hover"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-4 py-1.5 text-white transition-colors hover:bg-primary-hover"
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
