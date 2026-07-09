"use client";

import { useState } from "react";
import { PrivacyConsentNotice, PrivacyConsentText } from "@/components/privacy-consent-notice";

export function PrivacyConsentBox() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">아래 내용을 확인해 주세요.</span>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-medium text-gray-700 underline hover:text-gray-900"
        >
          크게 보기
        </button>
      </div>
      <PrivacyConsentNotice />

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">개인정보 수집 · 이용 동의</h3>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-gray-500 hover:text-gray-800"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="text-base leading-relaxed text-gray-700">
              <PrivacyConsentText />
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="mt-6 w-full rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
