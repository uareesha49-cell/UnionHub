import { ExternalLink } from "lucide-react";
import { mediaData } from "../utils/mediaData";

const DEFAULT_CGPA_URL =
  "https://cgpa-frontend-olive.vercel.app/";

const url = import.meta.env.VITE_CGPA_CALCULATOR_URL?.trim() || DEFAULT_CGPA_URL;

/** Student-only: preview image and link to resource (opens in a new tab). */
export const StudentCgpa = () => {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b font-montserrat flex flex-wrap items-center justify-between gap-3 w-full min-w-0">
          <h2 className="font-semibold text-[#1E6B78] text-base m-0">CGPA calculator</h2>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E6B78] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-95 shrink-0"
          >
            <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
            Open resource
          </a>
        </div>
        <div className="w-full border-b bg-gray-50">
          <img
            src={mediaData.SitePreview}
            alt="Preview of the linked resource"
            className="w-full max-h-[min(50vh,420px)] object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
};
