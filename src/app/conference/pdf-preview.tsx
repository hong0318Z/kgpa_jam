"use client";

import { useEffect, useRef, useState } from "react";

export function PdfPreview({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="mt-3">
      <div className="h-[560px] w-full overflow-hidden rounded border border-gray-200 bg-gray-50">
        {visible && (
          <object
            data={`${src}#view=FitH&navpanes=0`}
            type="application/pdf"
            aria-label={title}
            className="h-full w-full"
          >
            <p className="p-4 text-sm text-gray-600">
              이 브라우저에서는 미리보기를 표시할 수 없습니다.{" "}
              <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                PDF 열기
              </a>
            </p>
          </object>
        )}
      </div>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-xs text-blue-600 underline"
      >
        새 창에서 크게 보기
      </a>
    </div>
  );
}
