import React from "react";

export default function FamiliesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header and Page Action Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-border" />
          <div className="h-4 w-28 rounded bg-border" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 rounded-lg bg-border" />
          <div className="h-9 w-40 rounded-lg bg-border" />
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-sm space-y-4">
        {/* Search Bar Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-border" />
          <div className="h-10 w-20 rounded-lg bg-border" />
        </div>

        {/* Table Skeleton */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border table-fixed">
            <thead className="bg-background">
              <tr>
                <th className="w-16 py-3 px-4"><div className="h-4 w-6 mx-auto rounded bg-border" /></th>
                <th className="py-3 px-4"><div className="h-4 w-24 rounded bg-border" /></th>
                <th className="py-3 px-4"><div className="h-4 w-32 rounded bg-border" /></th>
                <th className="w-48 py-3 px-4"><div className="h-4 w-16 rounded bg-border" /></th>
                <th className="w-40 py-3 px-4"><div className="h-4 w-20 rounded bg-border" /></th>
                <th className="w-28 py-3 px-4"><div className="h-4 w-14 mx-auto rounded bg-border" /></th>
                <th className="w-24 py-3 px-4"><div className="h-4 w-10 mx-auto rounded bg-border" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {[...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-4"><div className="h-4 w-4 mx-auto rounded bg-border" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-36 rounded bg-border" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-44 rounded bg-border" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-32 rounded bg-border" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-28 rounded bg-border" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-8 mx-auto rounded bg-border" /></td>
                  <td className="py-4 px-4 flex justify-center"><div className="h-7 w-16 rounded bg-border" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
