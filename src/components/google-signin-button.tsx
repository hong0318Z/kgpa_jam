"use client";

import { useEffect, useState } from "react";
import { googleSignIn } from "@/lib/actions/google-auth";
import { isInAppBrowser, getInAppBrowserName, isAndroid, openInExternalBrowser } from "@/lib/in-app-browser";

export function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 34.6 26.9 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C40.9 36.2 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

export function GoogleSignInButton() {
  const [inApp, setInApp] = useState(false);
  const [android, setAndroid] = useState(false);
  const [browserName, setBrowserName] = useState<string | null>(null);

  useEffect(() => {
    setInApp(isInAppBrowser());
    setAndroid(isAndroid());
    setBrowserName(getInAppBrowserName());
  }, []);

  if (inApp) {
    return (
      <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
        <p className="mb-2 font-medium">
          {browserName ? `${browserName} 인앱 브라우저` : "인앱 브라우저"}에서는 보안 정책상 Google
          로그인을 사용할 수 없습니다.
        </p>
        <p className="mb-2">
          {android
            ? "아래 버튼을 눌러 외부 브라우저(Chrome)로 열어주세요."
            : "우측 상단 메뉴(••• 또는 공유 아이콘)에서 'Safari로 열기(다른 브라우저로 열기)'를 선택해 주세요."}
        </p>
        <button
          type="button"
          onClick={() => openInExternalBrowser(window.location.href)}
          className="w-full rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          외부 브라우저로 열기
        </button>
        <p className="mt-2 text-[11px] text-amber-700">
          이메일 · 비밀번호 로그인은 인앱 브라우저에서도 정상적으로 이용할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <form action={googleSignIn}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <GoogleIcon />
        Google로 계속하기
      </button>
    </form>
  );
}
