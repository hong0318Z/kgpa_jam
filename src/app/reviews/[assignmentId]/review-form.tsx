"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { submitReview } from "@/lib/actions/reviews";

type Initial = {
  score: number | null;
  commentsToAuthor: string;
  commentsToEditor: string | null;
  recommendation: string;
} | null;

export function ReviewForm({
  assignmentId,
  initial,
}: {
  assignmentId: string;
  initial: Initial;
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
        <label className="mb-1 block text-sm font-medium text-gray-700">추천의견</label>
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
          <option value="ACCEPT">게재가(Accept)</option>
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
