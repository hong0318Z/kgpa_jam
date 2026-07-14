export function isInAppBrowser(userAgent?: string): boolean {
  const ua = (userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "")).toLowerCase();
  return /kakaotalk|instagram|fban|fbav|line\/|naver\(inapp|everytimeapp|whale|daumapps|band\//i.test(ua);
}

export function getInAppBrowserName(userAgent?: string): string | null {
  const ua = (userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "")).toLowerCase();
  if (ua.includes("kakaotalk")) return "카카오톡";
  if (ua.includes("instagram")) return "인스타그램";
  if (ua.includes("fban") || ua.includes("fbav")) return "페이스북";
  if (ua.includes("line/")) return "라인";
  if (ua.includes("naver(inapp")) return "네이버 앱";
  if (ua.includes("band/")) return "밴드";
  return null;
}

export function isAndroid(userAgent?: string): boolean {
  const ua = userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return /android/i.test(ua);
}

export function isIOS(userAgent?: string): boolean {
  const ua = userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return /iphone|ipad|ipod/i.test(ua);
}

/**
 * 인앱 브라우저에서 외부 브라우저로 강제 이동을 시도한다.
 * 안드로이드는 intent 스킴으로 크롬을 직접 열 수 있지만,
 * iOS는 인앱 브라우저에서 외부 브라우저를 강제로 띄울 안정적인 방법이 없어
 * 실패할 수 있다 (호출부에서 안내 문구로 보완해야 함).
 */
export function openInExternalBrowser(url: string) {
  if (isAndroid()) {
    const withoutScheme = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;end`;
    return;
  }
  window.location.href = url.replace(/^https/, "x-safari-https");
}
