"use client";

import { useActionState, useState, useTransition } from "react";
import { updateEmailTemplate, resetEmailTemplate } from "@/lib/actions/email-templates";

export function EmailTemplateForm({
  templateKey,
  subject,
  bodyHtml,
  defaultSubject,
  defaultBodyHtml,
}: {
  templateKey: string;
  subject: string;
  bodyHtml: string;
  defaultSubject: string;
  defaultBodyHtml: string;
}) {
  const action = updateEmailTemplate.bind(null, templateKey);
  const [state, formAction, pending] = useActionState(action, {});
  const [resetPending, startReset] = useTransition();
  const [subjectValue, setSubjectValue] = useState(subject);
  const [bodyValue, setBodyValue] = useState(bodyHtml);

  function resetToDefault() {
    if (!confirm("기본 문구로 초기화하시겠습니까?")) return;
    startReset(async () => {
      await resetEmailTemplate(templateKey);
      setSubjectValue(defaultSubject);
      setBodyValue(defaultBodyHtml);
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">제목</label>
        <input
          name="subject"
          required
          value={subjectValue}
          onChange={(e) => setSubjectValue(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">본문 (HTML)</label>
        <textarea
          name="bodyHtml"
          required
          rows={14}
          value={bodyValue}
          onChange={(e) => setBodyValue(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-xs"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          disabled={resetPending}
          onClick={resetToDefault}
          className="w-fit rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {resetPending ? "초기화 중..." : "기본값으로 초기화"}
        </button>
      </div>
    </form>
  );
}
