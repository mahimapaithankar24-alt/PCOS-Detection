// app/(protected)/layout.tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <header className="bg-white border-b shadow-sm px-6 py-4 flex justify-between">
        <div className="font-bold text-teal-700 text-lg">
          PCOS AI Platform
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-700">
            Hello, <strong>{user.email}</strong>
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
