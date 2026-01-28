"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const getStrength = (pass: string) => {
    let s = 0;
    if (pass.length > 6) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    return s;
  };
  const strength = getStrength(form.password);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(await res.text());
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F3F4F6] p-4 lg:p-8">
      {/* Main Card */}
      <div className="bg-white w-full max-w-[1000px] h-auto rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Aurora Gradient (Visual & Branding) */}
        <div className="w-full lg:w-5/12 relative p-8 lg:p-12 flex flex-col justify-end overflow-hidden">
          {/* LOGO PLACEMENT LEFT (Desktop Only) */}
          {/* Positioned top-left, white (inverted) */}
          <div className="absolute top-8 left-8 z-20 hidden lg:block">
            <Image
              src="/logo.png"
              alt="PCOS AI"
              width={70}
              height={70}
              className="object-contain brightness-0 invert"
            />
          </div>

          {/* THE GRADIENT BACKGROUND */}
          <div className="absolute inset-0 z-0 bg-emerald-700">
            <div className="absolute top-[-20%] right-[-20%] w-100 h-100 bg-emerald-300 rounded-full blur-[80px] opacity-70"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-75 h-75 bg-emerald-600 rounded-full blur-[60px] opacity-90"></div>
            <div className="absolute top-[40%] right-[10%] w-50 h-50 bg-teal-400 rounded-full blur-[60px] opacity-60"></div>
          </div>

          {/* Grain texture overlay */}
          <div
            className="absolute inset-0 z-[1] opacity-[0.15] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            }}
          ></div>
          {/* LOGO PLACEMENT RIGHT (Mobile Only) */}
          <div className="lg:hidden flex bottom-0 justify-start items-start z-500">
            <div className="w-20 h-20">
              <Image
                src="/logo.png"
                alt="PCOS AI"
                width={60}
                height={60}
                className="object-contain brightness-0 invert"
              />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium mb-2">
              You can easily
            </p>
            <h2 className="text-white text-3xl font-bold leading-tight">
              Get access to your personal PCOS health tracking and AI-powered
              insights
            </h2>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-7/12 bg-white p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-[420px] mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Create an account
              </h1>
              <p className="text-slate-500 text-sm">
                Access your health assessments, AI predictions, and personalized
                recommendations anytime, anywhere.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-900 block">
                    First name
                  </label>
                  <input
                    name="first_name"
                    placeholder="John"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-900 block">
                    Last name
                  </label>
                  <input
                    name="last_name"
                    placeholder="Doe"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-900 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {form.password && (
                  <div className="flex gap-2 mt-2 h-1">
                    <div
                      className={`flex-1 rounded-full ${
                        strength > 0 ? "bg-emerald-600" : "bg-slate-200"
                      }`}
                    ></div>
                    <div
                      className={`flex-1 rounded-full ${
                        strength > 1 ? "bg-emerald-600" : "bg-slate-200"
                      }`}
                    ></div>
                    <div
                      className={`flex-1 rounded-full ${
                        strength > 2 ? "bg-emerald-600" : "bg-slate-200"
                      }`}
                    ></div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-8">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-emerald-600 font-semibold hover:underline"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
