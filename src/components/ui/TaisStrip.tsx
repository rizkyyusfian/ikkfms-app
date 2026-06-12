import React from "react";

export default function TaisStrip({ className = "h-[6px]" }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        width="100%"
        height="100%"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="taisPattern"
          width="24"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          {/* Chevron/Diamond repeating motif */}
          {/* Left diamond - Teal (accent-primary) */}
          <polygon points="0,3 6,0 12,3 6,6" fill="#0F6E56" fillOpacity="0.5" className="fill-[color:var(--accent-primary)]" />
          {/* Right diamond - Amber (accent-secondary) */}
          <polygon points="12,3 18,0 24,3 18,6" fill="#B45309" fillOpacity="0.5" className="fill-[color:var(--accent-secondary)]" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#taisPattern)" />
      </svg>
    </div>
  );
}
