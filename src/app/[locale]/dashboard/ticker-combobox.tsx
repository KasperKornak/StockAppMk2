"use client";

import { useId, useMemo, useRef, useState } from "react";
import { KNOWN_TICKERS } from "@/lib/tickers/known-tickers";

const MAX_SUGGESTIONS = 8;

export function TickerCombobox({
  inputClassName,
  placeholder,
  noMatchesLabel,
}: {
  inputClassName: string;
  placeholder: string;
  noMatchesLabel: string;
}) {
  const listId = useId();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toUpperCase();
  const matches = useMemo(() => {
    if (!query) return [];
    return KNOWN_TICKERS.filter(
      (entry) => entry.ticker.startsWith(query) || entry.name.toUpperCase().includes(query),
    ).slice(0, MAX_SUGGESTIONS);
  }, [query]);

  function choose(ticker: string) {
    setValue(ticker);
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-1"
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <input
        id="ticker"
        name="ticker"
        required
        autoComplete="off"
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-controls={listId}
        placeholder={placeholder}
        className={inputClassName}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || matches.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((i) => (i + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((i) => (i - 1 + matches.length) % matches.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(matches[highlighted].ticker);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full z-10 mt-1 max-h-56 w-64 overflow-y-auto rounded-md border border-neutral-700 bg-neutral-900 py-1 shadow-lg"
        >
          {matches.map((entry, i) => (
            <li key={entry.ticker} role="option" aria-selected={i === highlighted}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(entry.ticker)}
                className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm ${
                  i === highlighted ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-300"
                }`}
              >
                <span className="font-medium">{entry.ticker}</span>
                <span className="truncate text-xs text-neutral-500">{entry.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query && matches.length === 0 && (
        <p className="absolute top-full z-10 mt-1 w-64 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-500 shadow-lg">
          {noMatchesLabel}
        </p>
      )}
    </div>
  );
}
