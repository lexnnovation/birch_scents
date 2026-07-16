"use client";

import { useState } from "react";
import { SearchOverlay } from "./SearchOverlay";

/** Wraps a search button (desktop pill or mobile icon) with its own overlay instance. */
export function SearchTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" aria-label="Search" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <SearchOverlay open={open} onOpenChange={setOpen} />
    </>
  );
}
