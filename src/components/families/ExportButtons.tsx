"use client";

import React from "react";

type ExportButtonsProps = {
  familyId?: number;
};

export default function ExportButtons({ familyId }: ExportButtonsProps) {
  const excelUrl = familyId ? `/api/export/excel?familyId=${familyId}` : "/api/export/excel";
  const pdfUrl = familyId ? `/api/export/pdf?familyId=${familyId}` : "/api/export/pdf";

  return (
    <div className="flex gap-2">
      <a
        href={excelUrl}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm transition-colors hover:bg-background cursor-pointer"
      >
        <svg
          className="h-3.5 w-3.5 text-accent-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        Unduh Excel
      </a>
      <a
        href={pdfUrl}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm transition-colors hover:bg-background cursor-pointer"
      >
        <svg
          className="h-3.5 w-3.5 text-accent-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        Unduh PDF
      </a>
    </div>
  );
}
