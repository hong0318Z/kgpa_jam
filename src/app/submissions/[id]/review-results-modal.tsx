"use client";

import { useState } from "react";
import Link from "next/link";

type ReviewResult = {
  id: string;
  round: number;
  roundIndex: number;
  recommendationLabel: string;
  commentsToAuthor: string;
};

export function ReviewResultsModal({
  results,
  editHref,
}: {
  results: ReviewResult[];
  editHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const currentRound = results.length > 0 ? Math.max(...results.map((r) => r.round)) : null;
  const currentResults = results.filter((r) => r.round === currentRound);
  const pastRounds = Array.from(
    new Set(results.filter((r) => r.round !== currentRound).map((r) => r.round)),
  ).sort((a, b) => a - b);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setHasViewed(true);
        }}
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
              {currentResults.map((r) => (
                <li key={r.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="font-medium text-gray-900">
                    {r.round}차 심사위원 {r.roundIndex}
                  </p>
                  <p className="mt-1 text-gray-700">심사의견: {r.recommendationLabel}</p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">{r.commentsToAuthor}</p>
                </li>
              ))}
              {currentResults.length === 0 && (
                <li className="text-gray-500">등록된 심사 의견이 없습니다.</li>
              )}
            </ul>
            {pastRounds.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4">
                {pastRounds.map((round) => (
                  <details key={round} className="rounded border border-gray-200 bg-gray-50 p-3">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                      {round}차 심사 결과 (열어보기)
                    </summary>
                    <ul className="mt-2 space-y-3 text-sm">
                      {results
                        .filter((r) => r.round === round)
                        .map((r) => (
                          <li key={r.id} className="border-b border-gray-100 pb-2 last:border-0">
                            <p className="font-medium text-gray-900">
                              {r.round}차 심사위원 {r.roundIndex}
                            </p>
                            <p className="mt-1 text-gray-700">심사의견: {r.recommendationLabel}</p>
                            <p className="mt-1 whitespace-pre-wrap text-gray-700">
                              {r.commentsToAuthor}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {hasViewed && editHref && (
        <Link
          href={editHref}
          className="mt-3 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          투고 내용 수정하기
        </Link>
      )}
    </>
  );
}
