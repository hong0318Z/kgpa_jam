export function FileActions({
  fileId,
  label,
  mimeType,
}: {
  fileId: string;
  label: string;
  mimeType: string;
}) {
  const canPreview = mimeType === "application/pdf";

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="text-gray-700">{label}</span>
      {canPreview && (
        <a
          href={`/api/files/${fileId}?view=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          보기
        </a>
      )}
      <a href={`/api/files/${fileId}`} className="text-gray-700 underline">
        다운로드
      </a>
    </span>
  );
}
