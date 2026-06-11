"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { loginAction } from "@/lib/actions";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await loginAction(null, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // Force a hard reload/redirect so middleware captures the cookie state
        window.location.href = "/";
      }
    });
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Login Card */}
      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo_ikkfms.jpeg"
            alt="Logo IKKFMS"
            width={72}
            height={72}
            className="rounded-xl object-cover shadow-lg border border-white/20"
            priority
          />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
            IKKFMS PORTAL
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-xs">
            Sistem Informasi Kependudukan Ikatan Kerukunan Keluarga Feto Mone Sorong
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 animate-pulse">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Masukkan username admin"
                disabled={isPending}
                className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isPending}
                className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk ke Portal"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer copyright */}
      <p className="mt-8 text-center text-xs text-slate-500">
        &copy; MRYY 2026. Semua Hak Cipta Dilindungi.
      </p>
    </div>
  );
}
