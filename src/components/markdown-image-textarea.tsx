"use client";

import { useRef, useState } from "react";
import { uploadNoticeImage } from "@/lib/actions/notices";

export function MarkdownImageTextarea({
  name,
  defaultValue,
  rows = 10,
}: {
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadNoticeImage(formData);
    setUploading(false);
    e.target.value = "";

    if (result.error || !result.url) {
      setError(result.error ?? "업로드에 실패했습니다.");
      return;
    }

    const textarea = textareaRef.current;
    const markdown = `![이미지](${result.url})`;
    if (!textarea) {
      setValue((v) => v + markdown);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = value.slice(0, start) + markdown + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + markdown.length;
      textarea.setSelectionRange(pos, pos);
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "이미지 삽입"}
        </button>
        <span className="text-xs text-gray-400">
          본문은 마크다운 문법(예: **굵게**, 줄바꿈)을 지원합니다.
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <textarea
        ref={textareaRef}
        name={name}
        required
        rows={rows}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
