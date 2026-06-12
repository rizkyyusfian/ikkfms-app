import React from "react";

export default function FamilyDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Back Link & Page Actions Skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-4 w-48 rounded bg-border" />
          <div className="h-7 w-64 rounded bg-border" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-border" />
          <div className="h-9 w-28 rounded-lg bg-border" />
          <div className="h-9 w-20 rounded-lg bg-border" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Head of Household Card Skeleton */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="h-5 w-36 rounded bg-border pb-3 border-b border-border" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3.5 w-24 rounded bg-border" />
                <div className="h-4 w-40 rounded bg-border" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Member Table Skeleton */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-border" />
              <div className="h-3.5 w-64 rounded bg-border" />
            </div>
            <div className="h-8 w-28 rounded-lg bg-border" />
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full divide-y divide-border table-fixed">
              <thead className="bg-background">
                <tr>
                  <th className="w-12 py-3 px-4"><div className="h-4 w-4 mx-auto rounded bg-border" /></th>
                  <th className="w-48 py-3 px-4"><div className="h-4 w-16 rounded bg-border" /></th>
                  <th className="py-3 px-4"><div className="h-4 w-24 rounded bg-border" /></th>
                  <th className="w-32 py-3 px-4"><div className="h-4 w-14 rounded bg-border" /></th>
                  <th className="w-32 py-3 px-4"><div className="h-4 w-8 mx-auto rounded bg-border" /></th>
                  <th className="w-40 py-3 px-4"><div className="h-4 w-20 rounded bg-border" /></th>
                  <th className="w-28 py-3 px-4"><div className="h-4 w-10 mx-auto rounded bg-border" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {[...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-4"><div className="h-4 w-4 mx-auto rounded bg-border" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-32 rounded bg-border" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-36 rounded bg-border" /></td>
                    <td className="py-4 px-4"><div className="h-4.5 w-16 rounded bg-border" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-4 mx-auto rounded bg-border" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 rounded bg-border" /></td>
                    <td className="py-4 px-4 flex justify-center gap-1"><div className="h-7 w-12 rounded bg-border" /><div className="h-7 w-12 rounded bg-border" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
