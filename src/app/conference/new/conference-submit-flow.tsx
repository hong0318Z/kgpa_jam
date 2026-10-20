"use client";

import { useState } from "react";
import { SubmissionForm } from "@/app/submissions/new/submission-form";
import { PosterForm } from "./poster-form";

type Volume = {
  id: string;
  label: string;
  callStartDate: Date;
  callEndDate: Date;
  plannedPublishDate: Date;
};

export function ConferenceSubmitFlow({
  volumes,
  pledgeAuthorNames,
}: {
  volumes: Volume[];
  pledgeAuthorNames?: string;
}) {
  const [format, setFormat] = useState<"POSTER" | "PROCEEDINGS" | null>(null);

  const tab = (value: "POSTER" | "PROCEEDINGS", label: string) => (
    <button
      type="button"
      onClick={() => setFormat(value)}
      className={`rounded border px-4 py-2 text-sm font-medium ${
        format === value
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">투고 형식을 선택해 주세요.</p>
        <div className="flex gap-2">
          {tab("POSTER", "포스터")}
          {tab("PROCEEDINGS", "논문(프로시딩)")}
        </div>
      </div>
      {format === "POSTER" && (
        <PosterForm volumes={volumes} pledgeAuthorNames={pledgeAuthorNames} />
      )}
      {format === "PROCEEDINGS" && (
        <SubmissionForm
          volumes={volumes}
          pledgeAuthorNames={pledgeAuthorNames}
          hideCopyrightUpload
        />
      )}
    </div>
  );
}
