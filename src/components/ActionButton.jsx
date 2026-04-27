import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Primary / submit-style button: shows a spinner inside the control while `loading` is true.
 */
export const ActionButton = forwardRef(function ActionButton(
  { children, loading = false, className = "", disabled, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={Boolean(disabled) || loading}
      className={`inline-flex items-center justify-center gap-2 ${className || ""}`}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" strokeWidth={2.5} aria-hidden /> : null}
      <span className="min-w-0">{children}</span>
    </button>
  );
});
