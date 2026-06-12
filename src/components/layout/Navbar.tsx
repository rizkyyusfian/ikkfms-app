"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (document.documentElement.classList.contains("dark")) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Data Keluarga", href: "/families" },
    { label: "Cari Anggota", href: "/members/search" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface px-6 py-3 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left Side: Logo & Association Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-md">
            <img
              src="/logo_ikkfms.jpeg"
              alt="IKKFMS Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-sans text-sm font-semibold tracking-wide text-text-primary">
            IKKFMS Sorong
          </span>
        </Link>

        {/* Center-left Nav Links */}
        <div className="hidden flex-1 justify-start pl-8 md:flex gap-6">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-sm font-medium transition-colors ${
                  isActive
                    ? "text-accent-primary border-b-2 border-accent-primary pb-1"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side: Theme Toggle + Admin Indicator + Logout */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-background hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            )}
          </button>

          {/* Admin Indicator */}
          <span className="font-mono text-xs font-semibold text-text-secondary border border-border px-2.5 py-1 rounded bg-background">
            {adminName}
          </span>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="font-sans text-sm font-semibold text-accent-primary hover:text-accent-primary-hover transition-colors cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </div>
    </nav>
  );
}
