export const ASSIGNABLE_STAFF_ROLES = [
  "principal",
  "teacher",
  "employee",
  "vice_principal",
  "tech_staff",
  "finance",
];

/** Match backend: slug only, handles labels / stray spaces / zero-width chars. */
export function coerceStaffRoleSlug(raw) {
  if (raw === undefined || raw === null) return null;
  const value = String(raw)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return ASSIGNABLE_STAFF_ROLES.includes(value) ? value : null;
}
