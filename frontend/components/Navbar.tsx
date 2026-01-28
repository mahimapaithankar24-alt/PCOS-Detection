"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getCookie, deleteCookie } from "@/lib/cookies";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  Zap,
  LogOut,
  Menu,
  X,
  Clock,
  ChevronDown,
} from "lucide-react";

type UserType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const token = getCookie("pcos_token");
    const userData = getCookie("pcos_user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        console.warn("Invalid user data in cookie");
      }
    }
  }, [pathname]);

  function logout() {
    deleteCookie("pcos_token");
    deleteCookie("pcos_user");
    setUser(null);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/assess", label: "Assessment", icon: Zap },
        { href: "/history", label: "History", icon: Clock },
        { href: "/profile", label: "Profile", icon: User },
      ]
    : [];

  const isActive = (href: string) => pathname === href;
  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/register");

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo Section */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="PCOS AI Logo"
                width={40}
                height={40}
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                PCOS
                <span className="bg-gradient-to-tr from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </div>
          </button>

          {/* Desktop Navigation & Actions */}
          {user ? (
            <>
              {/* Desktop Links - Centered or Right Aligned */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                      isActive(link.href)
                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-black/5"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <link.icon
                      size={18}
                      strokeWidth={isActive(link.href) ? 2.5 : 2}
                      className={
                        isActive(link.href) ? "text-emerald-600" : "opacity-70"
                      }
                    />
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>

              {/* User Menu Dropdown */}
              <div className="hidden md:block relative ml-4">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full transition-all border ${
                    userMenuOpen
                      ? "bg-slate-50 border-emerald-500/30 ring-4 ring-emerald-500/10"
                      : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                      {user.first_name}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Panel */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 ring-1 ring-black/5 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                      <div className="p-5 bg-gradient-to-br from-slate-50/80 to-white border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors font-medium text-sm group"
                        >
                          <div className="p-2 bg-rose-100/50 rounded-lg group-hover:bg-rose-200/50 transition-colors">
                            <LogOut size={16} strokeWidth={2.5} />
                          </div>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          ) : (
            <>
              {/* Not Logged In - Desktop */}
              <div className="hidden md:flex items-center gap-4">
                {!isAuthPage && (
                  <>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-6 py-2.5 text-slate-600 font-semibold text-sm hover:text-slate-900 transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => router.push("/register")}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>

              {/* Not Logged In - Mobile Toggle */}
              <div className="md:hidden flex items-center gap-2">
                {!isAuthPage && (
                  <>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-4 py-2 text-slate-600 font-semibold text-sm"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => router.push("/register")}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm shadow-sm"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-5">
          <div className="p-4 space-y-2">
            {/* Mobile User Profile */}
            <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {user.first_name[0]}
                {user.last_name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Mobile Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium text-sm transition-all ${
                    isActive(link.href)
                      ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <link.icon
                    size={20}
                    className={
                      isActive(link.href) ? "text-emerald-600" : "text-slate-400"
                    }
                  />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>

            <div className="h-px bg-slate-100 my-4" />

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-rose-50/50 hover:bg-rose-50 text-rose-700 rounded-xl font-medium text-sm transition-all border border-rose-100"
            >
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}