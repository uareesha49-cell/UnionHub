import { ExternalLink } from "lucide-react";

const url = import.meta.env.VITE_TIMETABLE_PROJECT_URL?.trim();

/** Tech staff only: embedded timetable app (URL from `VITE_TIMETABLE_PROJECT_URL`). */
export const TechStaffTimetable = () => {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col min-h-[70vh]">
        <div className="px-6 py-4 border-b font-montserrat font-semibold text-[#1E6B78] flex flex-wrap items-center justify-between gap-3">
          <span>Timetable</span>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E6B78] hover:underline"
            >
              Open live app
              <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
            </a>
          ) : null}
        </div>
        {url ? (
          <iframe
            title="Timetable"
            src={url}
            className="flex-1 w-full min-h-[60vh] border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        ) : (
          <div className="p-8 text-center text-grey text-sm font-montserrat">
            Set <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">VITE_TIMETABLE_PROJECT_URL</code> in your
            environment to the public URL of your timetable project. Reload the page after saving.
          </div>
        )}
      </div>
    </div>
  );
};
