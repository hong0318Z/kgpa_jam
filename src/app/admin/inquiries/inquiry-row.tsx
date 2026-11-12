"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { markInquiryRead, replyToInquiry } from "@/lib/actions/inquiries";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: string;
  replyMessage: string | null;
  repliedAt: string | null;
};

const STATUS_BADGE: Record<Inquiry["status"], { label: string; className: string }> = {
  NEW: { label: "NEW", className: "bg-red-100 text-red-700" },
  READ: { label: "확인함", className: "bg-gray-100 text-gray-600" },
  REPLIED: { label: "답장완료", className: "bg-green-100 text-green-700" },
};

export function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(inquiry.status);
  const [pending, startTransition] = useTransition();
  const replyAction = replyToInquiry.bind(null, inquiry.id);
  const [replyState, formAction, replyPending] = useActionState(replyAction, {});

  useEffect(() => {
    if (replyState?.success) setStatus("REPLIED");
  }, [replyState]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && status === "NEW") {
      startTransition(async () => {
        await markInquiryRead(inquiry.id);
        setStatus("READ");
      });
    }
  };

  const badge = STATUS_BADGE[status];

  return (
    <li className="rounded border border-gray-200 bg-white">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
          <span className="truncate text-sm font-medium text-gray-900">{inquiry.subject}</span>
          <span className="shrink-0 text-xs text-gray-400">· {inquiry.name}</span>
        </span>
        <span className="shrink-0 text-xs text-gray-400">{inquiry.createdAt}</span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3 text-sm">
          <p className="mb-2 text-xs text-gray-500">
            {inquiry.name} · {inquiry.email}
            {inquiry.phone && ` · ${inquiry.phone}`}
            {pending && " · 읽음 처리 중..."}
          </p>
          <p className="whitespace-pre-wrap text-gray-800">{inquiry.message}</p>

          {status === "REPLIED" && inquiry.replyMessage && (
            <div className="mt-4 rounded border border-green-200 bg-green-50 p-3">
              <p className="mb-1 text-xs text-gray-500">
                {inquiry.repliedAt} 답장함 · 문의자 메일로 안내됨
              </p>
              <p className="whitespace-pre-wrap text-gray-800">{inquiry.replyMessage}</p>
            </div>
          )}

          <form action={formAction} className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3">
            <label className="text-xs font-medium text-gray-600">
              {status === "REPLIED" ? "답장 수정 (다시 보내면 메일이 다시 발송됩니다)" : "답장 작성"}
            </label>
            <textarea
              name="replyMessage"
              defaultValue={inquiry.replyMessage ?? ""}
              rows={4}
              placeholder="답장 내용을 입력하면 문의자 이메일로 안내 메일이 발송됩니다."
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={replyPending}
                className="w-fit rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {replyPending ? "전송 중..." : "답장 보내기"}
              </button>
              {replyState?.success && <span className="text-xs text-green-600">{replyState.success}</span>}
              {replyState?.error && <span className="text-xs text-red-600">{replyState.error}</span>}
            </div>
          </form>
        </div>
      )}
    </li>
  );
}
