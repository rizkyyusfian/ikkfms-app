"use client";

import React, { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({ placeholder = "Cari..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  // Update URL search parameter with a debounce
  useEffect(() => {
    const currentQuery = searchParams.get("q") || "";
    if (value.trim() === currentQuery) return;

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (value.trim()) {
          params.set("q", value.trim());
        }
        router.push(`?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      startTransition(() => {
        const params = new URLSearchParams();
        if (value.trim()) {
          params.set("q", value.trim());
        }
        router.push(`?${params.toString()}`);
      });
    },
    [value, router]
  );

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-surface pl-4 pr-10 py-2 text-sm shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary text-text-primary placeholder:text-text-secondary/50"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              startTransition(() => {
                router.push("?");
              });
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary transition-colors"
            title="Bersihkan pencarian"
          >
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary px-5 flex items-center justify-center min-w-20"
      >
        {isPending ? (
          <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          "Cari"
        )}
      </button>
    </form>
  );
}
