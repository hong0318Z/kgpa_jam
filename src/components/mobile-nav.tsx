"use client";

import { useState } from "react";

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="메뉴 열기"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 text-gray-700 md:hidden"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      <nav
        className={`${
          open ? "flex" : "hidden"
        } absolute right-0 top-11 z-20 w-56 flex-col gap-3 rounded border border-gray-200 bg-white p-4 text-sm shadow-lg md:static md:flex md:w-auto md:flex-row md:items-center md:gap-4 md:border-none md:bg-transparent md:p-0 md:shadow-none`}
      >
        {children}
      </nav>
    </div>
  );
}
