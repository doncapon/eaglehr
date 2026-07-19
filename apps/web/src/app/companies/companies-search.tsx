"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SuggestionCompany {
  name: string;
}

export function CompaniesSearch({ initialQuery }: { initialQuery: string }) {
  const [typed, setTyped] = useState(initialQuery);
  const [suggestion, setSuggestion] = useState<SuggestionCompany | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const latestRequestId = useRef(0);

  // Debounced: updates the URL (drives the server-rendered grid below) and looks up
  // the top match for the inline completion.
  useEffect(() => {
    const trimmed = typed.trim();

    if (!trimmed) {
      setSuggestion(null);
      router.replace("/companies", { scroll: false });
      router.refresh();
      return;
    }

    const handle = setTimeout(() => {
      router.replace(`/companies?q=${encodeURIComponent(trimmed)}`, { scroll: false });
      router.refresh();

      const requestId = ++latestRequestId.current;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies?q=${encodeURIComponent(trimmed)}&limit=10`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (requestId !== latestRequestId.current || !data) return;
          const items: SuggestionCompany[] = data.items ?? [];
          // Inline completion only makes visual sense for a prefix match (can't
          // "complete" a name that matched in the middle) — the grid below still
          // shows every substring match regardless.
          const lower = trimmed.toLowerCase();
          const prefixMatch = items.find((c) => c.name.toLowerCase().startsWith(lower));
          setSuggestion(prefixMatch ?? null);
        })
        .catch(() => {});
    }, 150);

    return () => clearTimeout(handle);
  }, [typed, router]);

  // Render the ghost completion by setting the DOM value directly and selecting the
  // appended remainder — an uncontrolled-input technique so the browser's native
  // "typing replaces selection" / "backspace clears selection" behavior does the
  // rest of the interaction for free.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (suggestion && suggestion.name.toLowerCase().startsWith(typed.toLowerCase()) && suggestion.name.length > typed.length) {
      input.value = typed + suggestion.name.slice(typed.length);
      input.setSelectionRange(typed.length, suggestion.name.length);
    } else {
      input.value = typed;
    }
  }, [suggestion, typed]);

  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        defaultValue={typed}
        onChange={(event) => setTyped(event.target.value)}
        placeholder="Search companies..."
        autoComplete="off"
        className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm transition-colors focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
      />
    </div>
  );
}
