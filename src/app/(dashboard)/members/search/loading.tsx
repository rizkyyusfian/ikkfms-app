import React from "react";

export default function MemberSearchLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 rounded bg-border" />
        <div className="h-4 w-96 rounded bg-border" />
      </div>

      {/* Main Container Card Skeleton */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-4">
        {/* Search Bar Input & Button Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-border" />
          <div className="h-10 w-24 rounded-lg bg-border" />
        </div>
      </div>
    </div>
  );
}
