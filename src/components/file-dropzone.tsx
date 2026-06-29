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
}: {
  name: string;
  accept: string;
  required?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const setFromList = (files: FileList | null) => {
    const f = files?.[0] ?? null;
    setFile(f);
    if (inputRef.current && f) {
      const dt = new DataTransfer();
      dt.items.add(f);
      inputRef.current.files = dt.files;
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="hidden"
        onChange={(e) => setFromList(e.target.files)}
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
          setFromList(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed px-4 py-8 text-center text-sm transition-colors ${
          dragOver ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        {file ? (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{file.name}</span>
            <span className="text-xs text-gray-500">({formatSize(file.size)})</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="ml-1 text-gray-500 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-700">클릭하거나 파일을 끌어다 놓아 업로드</p>
            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
          </>
        )}
      </div>
    </div>
  );
}
