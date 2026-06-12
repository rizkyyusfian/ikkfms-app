import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 rounded bg-border" />
        <div className="h-4 w-96 rounded bg-border" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-border" />
              <div className="h-8 w-8 rounded bg-border" />
            </div>
            <div className="h-8 w-16 rounded bg-border" />
            <div className="h-3 w-32 rounded bg-border" />
          </div>
        ))}
      </div>

      {/* Large Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 space-y-6">
          <div className="flex justify-between border-b border-border pb-4">
            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-border" />
              <div className="h-3.5 w-64 rounded bg-border" />
            </div>
            <div className="h-8 w-8 rounded bg-border" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 rounded bg-border" />
                <div className="h-4 w-12 rounded bg-border" />
              </div>
              <div className="h-2 w-full rounded bg-border" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
          <div className="flex justify-between border-b border-border pb-4">
            <div className="space-y-2">
              <div className="h-5 w-36 rounded bg-border" />
              <div className="h-3.5 w-48 rounded bg-border" />
            </div>
            <div className="h-8 w-8 rounded bg-border" />
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-border" />
          ))}
          <div className="h-20 w-full rounded-xl bg-border" />
        </div>
      </div>
    </div>
  );
}
