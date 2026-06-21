"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
      <div className="max-w-lg mx-auto px-4">
        {/* Title Row */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h1 className="text-xl font-bold tracking-tight">
              Calorie Checker
            </h1>
          </div>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {user.displayName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium leading-tight truncate max-w-[120px]">
                  {user.displayName}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="ออกจากระบบ"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-1 -mb-px">
          <Link
            href="/"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
              pathname === "/"
                ? "bg-white/20 text-white"
                : "text-green-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            วิเคราะห์
          </Link>
          <Link
            href="/history"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
              pathname === "/history"
                ? "bg-white/20 text-white"
                : "text-green-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ประวัติ
          </Link>
        </div>
      </div>
    </header>
  );
}
