"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import TaisStrip from "@/components/ui/TaisStrip";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          username,
          password,
          redirect: false,
        });

        if (result?.error || !result?.ok) {
          setError("Username atau password salah.");
        } else {
          router.push("/");
          router.refresh();
        }
      } catch (err) {
        console.error("Login client error:", err);
        setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      }
    });
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Login Card */}
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        {/* Tais Strip Signature Element */}
        <TaisStrip className="h-[6px]" />

        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src="/logo_ikkfms.jpeg"
              alt="Logo IKKFMS"
              className="h-16 w-16 rounded-xl object-cover shadow border border-border"
            />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">
                IKKFMS PORTAL
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                Sistem Informasi Kependudukan Ikatan Kerukunan Keluarga Feto Mone Sorong
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger animate-pulse">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="label text-xs uppercase tracking-wider font-semibold">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Username admin"
                disabled={isPending}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="label text-xs uppercase tracking-wider font-semibold">
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
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-2.5 mt-2 flex justify-center items-center"
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
          </form>
        </div>
      </div>

      {/* Footer copyright */}
      <p className="mt-8 text-center text-xs text-text-secondary">
        &copy; MRYY 2026. Semua Hak Cipta Dilindungi.
      </p>
    </div>
  );
}
