"use client";

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-md rounded border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">{error.message || "오류가 발생했습니다."}</p>
    </div>
  );
}
