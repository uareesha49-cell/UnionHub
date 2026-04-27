import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../auth/api";

/** Shared `/auth/student/me` payload for student profile + fees list. */
export function useStudentMe(token) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest("/auth/student/me", { token });
      setPayload(data);
    } catch {
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  return { payload, loading, reload: load };
}
