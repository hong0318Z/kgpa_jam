"use client";

import { useState } from "react";

type ReviewResult = {
  id: string;
  round: number;
  roundIndex: number;
  recommendationLabel: string;
  commentsToAuthor: string;
};

export function ReviewResultsModal({ results }: { results: ReviewResult[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        심사결과 및 의견 보기
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">심사결과 및 의견</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-4 text-sm">
              {results.map((r) => (
                <li key={r.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="font-medium text-gray-900">
                    {r.round}차 심사위원 {r.roundIndex}
                  </p>
                  <p className="mt-1 text-gray-700">심사의견: {r.recommendationLabel}</p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">{r.commentsToAuthor}</p>
                </li>
              ))}
              {results.length === 0 && <li className="text-gray-500">등록된 심사 의견이 없습니다.</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
