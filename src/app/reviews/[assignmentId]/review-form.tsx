"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { submitReview } from "@/lib/actions/reviews";

const RECOMMENDATION_LABELS: Record<string, string> = {
  ACCEPT: "게재 가능(Accept)",
  MINOR_REVISION: "소폭수정(Minor Revision)",
  MAJOR_REVISION: "대폭수정(Major Revision)",
  REJECT: "게재불가(Reject)",
};

type Initial = {
  score: number | null;
  commentsToAuthor: string;
  commentsToEditor: string | null;
  recommendation: string;
} | null;

export function ReviewForm({
  assignmentId,
  initial,
  submitted,
}: {
  assignmentId: string;
  initial: Initial;
  submitted: boolean;
}) {
  const action = submitReview.bind(null, assignmentId);
  const [state, formAction, pending] = useActionState(action, {});

  const [score, setScore] = useState(initial?.score != null ? String(initial.score) : "");
  const [recommendation, setRecommendation] = useState(initial?.recommendation ?? "");
  const [commentsToAuthor, setCommentsToAuthor] = useState(initial?.commentsToAuthor ?? "");
  const [commentsToEditor, setCommentsToEditor] = useState(initial?.commentsToEditor ?? "");

  // 제출이 성공하면 서버에서 새로 내려온 저장값으로 동기화한다. 값이 실제로
  // 바뀐 경우에만 실행되므로(참조가 아닌 원시값 의존), 입력 중에 임의로
  // 초기화되지 않는다.
  useEffect(() => {
    setScore(initial?.score != null ? String(initial.score) : "");
    setRecommendation(initial?.recommendation ?? "");
    setCommentsToAuthor(initial?.commentsToAuthor ?? "");
    setCommentsToEditor(initial?.commentsToEditor ?? "");
  }, [initial?.score, initial?.recommendation, initial?.commentsToAuthor, initial?.commentsToEditor]);

  if (submitted && initial) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-gray-500">이미 제출된 심사는 더 이상 수정할 수 없습니다.</p>
        <div>
          <p className="font-medium text-gray-700">점수</p>
          <p className="text-gray-900">{initial.score ?? "-"}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">심사의견</p>
          <p className="text-gray-900">
            {RECOMMENDATION_LABELS[initial.recommendation] ?? initial.recommendation}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-700">저자에게 전달할 코멘트</p>
          <p className="whitespace-pre-wrap text-gray-900">{initial.commentsToAuthor}</p>
        </div>
        {initial.commentsToEditor && (
          <div>
            <p className="font-medium text-gray-700">편집자 전용 코멘트</p>
            <p className="whitespace-pre-wrap text-gray-900">{initial.commentsToEditor}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">점수 (1-10)</label>
        <input
          name="score"
          type="number"
          min={1}
          max={10}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-24 rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">심사의견</label>
        <select
          name="recommendation"
          required
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>
            선택
          </option>
          <option value="ACCEPT">게재 가능(Accept)</option>
          <option value="MINOR_REVISION">소폭수정(Minor Revision)</option>
          <option value="MAJOR_REVISION">대폭수정(Major Revision)</option>
          <option value="REJECT">게재불가(Reject)</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">저자에게 전달할 코멘트</label>
        <textarea
          name="commentsToAuthor"
          required
          rows={6}
          value={commentsToAuthor}
          onChange={(e) => setCommentsToAuthor(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          편집자 전용 코멘트 (저자에게 비공개)
        </label>
        <textarea
          name="commentsToEditor"
          rows={3}
          value={commentsToEditor ?? ""}
          onChange={(e) => setCommentsToEditor(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {pending ? "제출 중..." : "심사 제출"}
      </button>
    </form>
  );
}
