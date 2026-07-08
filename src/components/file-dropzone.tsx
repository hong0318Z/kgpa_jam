"use client";

import { useRef, useState } from "react";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({
  name,
  accept,
  required,
  hint,
  multiple = false,
}: {
  name: string;
  accept: string;
  required?: boolean;
  hint?: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const applyToInput = (list: File[]) => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    inputRef.current.files = dt.files;
  };

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const next = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
    setFiles(next);
    applyToInput(next);
  };

  const removeAt = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    applyToInput(next);
  };

  return (
    <div>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        required={required && files.length === 0}
        multiple={multiple}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed px-4 py-8 text-center text-sm transition-colors ${
          dragOver ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <p className="text-gray-700">
          클릭하거나 파일을 끌어다 놓아 업로드
          {multiple && files.length > 0 ? " (파일 추가)" : ""}
        </p>
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
      {files.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded border border-gray-200 px-3 py-1.5 text-sm"
            >
              <span className="flex-1 truncate font-medium text-gray-900">{f.name}</span>
              <span className="shrink-0 text-xs text-gray-500">({formatSize(f.size)})</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(i);
                }}
                className="shrink-0 text-gray-500 hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
