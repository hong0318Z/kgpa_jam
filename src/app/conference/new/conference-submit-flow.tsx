"use client";

import { useState } from "react";
import { SubmissionForm } from "@/app/submissions/new/submission-form";
import { PosterForm } from "./poster-form";
import { CONFERENCE_FORMATS, CONFERENCE_FORMAT_LABELS } from "@/lib/labels";

type Format = "POSTER" | "PROCEEDINGS" | "ARTWORK";

type Volume = {
  id: string;
  label: string;
  callStartDate: Date;
  callEndDate: Date;
  plannedPublishDate: Date;
  conferenceFormats: string[];
};

export function ConferenceSubmitFlow({
  volumes,
  pledgeAuthorNames,
}: {
  volumes: Volume[];
  pledgeAuthorNames?: string;
}) {
  const available = CONFERENCE_FORMATS.filter((f) =>
    volumes.some((v) => v.conferenceFormats.includes(f)),
  );
  const [chosen, setChosen] = useState<Format | null>(null);
  const format = chosen ?? (available.length === 1 ? available[0] : null);
  const formatVolumes = format
    ? volumes.filter((v) => v.conferenceFormats.includes(format))
    : [];

  return (
    <div className="flex flex-col gap-4">
      {available.length === 0 && (
        <p className="text-sm text-red-600">현재 투고를 받고 있는 형식이 없습니다.</p>
      )}
      {available.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">투고 형식을 선택해 주세요.</p>
          <div className="flex gap-2">
            {available.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setChosen(f)}
                className={`rounded border px-4 py-2 text-sm font-medium ${
                  format === f
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {CONFERENCE_FORMAT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      )}
      {available.length === 1 && (
        <p className="text-sm text-gray-700">
          투고 형식: <span className="font-medium">{CONFERENCE_FORMAT_LABELS[available[0]]}</span>
        </p>
      )}
      {(format === "POSTER" || format === "ARTWORK") && (
        <PosterForm
          key={format}
          format={format}
          volumes={formatVolumes}
          pledgeAuthorNames={pledgeAuthorNames}
        />
      )}
      {format === "PROCEEDINGS" && (
        <SubmissionForm
          volumes={formatVolumes}
          pledgeAuthorNames={pledgeAuthorNames}
          hideCopyrightUpload
        />
      )}
    </div>
  );
}
