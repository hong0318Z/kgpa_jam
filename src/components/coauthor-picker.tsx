"use client";

import { useEffect, useRef, useState } from "react";
import { searchUsers, type CoauthorInput } from "@/lib/actions/submission-authors";

type SearchResult = { id: string; name: string; email: string; affiliation: string };

function NameSearchField({
  value,
  onPick,
  onManualChange,
}: {
  value: string;
  onPick: (user: SearchResult) => void;
  onManualChange: (name: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleChange = (v: string) => {
    setQuery(v);
    onManualChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!v.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const found = await searchUsers(v);
      setResults(found);
      setOpen(found.length > 0);
    }, 300);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="이름으로 검색"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded border border-gray-200 bg-white text-sm shadow">
          {results.map((u) => (
            <li
              key={u.id}
              onClick={() => {
                onPick(u);
                setQuery(u.name);
                setOpen(false);
              }}
              className="cursor-pointer px-3 py-2 hover:bg-gray-50"
            >
              {u.name} ({u.email}) ({u.affiliation})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type AuthorRow = CoauthorInput & { key: string };

export function CoauthorPicker({
  name,
  initialAuthors,
}: {
  name: string;
  initialAuthors?: CoauthorInput[];
}) {
  const [authors, setAuthors] = useState<AuthorRow[]>(
    (initialAuthors ?? []).map((a, i) => ({ ...a, key: `init-${i}` })),
  );

  const update = (key: string, patch: Partial<AuthorRow>) => {
    setAuthors((prev) => prev.map((a) => (a.key === key ? { ...a, ...patch } : a)));
  };

  const addManual = () => {
    setAuthors((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        userId: null,
        name: "",
        email: "",
        affiliation: "",
        isCorresponding: prev.length === 0,
      },
    ]);
  };

  const remove = (key: string) => {
    setAuthors((prev) => prev.filter((a) => a.key !== key));
  };

  const setCorresponding = (key: string) => {
    setAuthors((prev) => prev.map((a) => ({ ...a, isCorresponding: a.key === key })));
  };

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(authors.map(({ key, ...rest }) => rest))} />
      {authors.map((a) => (
        <div key={a.key} className="flex flex-col gap-2 rounded border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <NameSearchField
                value={a.name}
                onManualChange={(v) => update(a.key, { name: v, userId: null })}
                onPick={(u) =>
                  update(a.key, {
                    userId: u.id,
                    name: u.name,
                    email: u.email,
                    affiliation: u.affiliation,
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() => remove(a.key)}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              ✕
            </button>
          </div>
          {!a.userId && (
            <div className="grid grid-cols-2 gap-2">
              <input
                value={a.email}
                onChange={(e) => update(a.key, { email: e.target.value })}
                placeholder="이메일 (비회원)"
                className="rounded border border-gray-300 px-2 py-1.5 text-xs"
              />
              <input
                value={a.affiliation}
                onChange={(e) => update(a.key, { affiliation: e.target.value })}
                placeholder="소속 (비회원)"
                className="rounded border border-gray-300 px-2 py-1.5 text-xs"
              />
            </div>
          )}
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={a.isCorresponding}
              onChange={() => setCorresponding(a.key)}
            />
            교신저자
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={addManual}
        className="w-fit rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
      >
        + 공저자 추가
      </button>
    </div>
  );
}
