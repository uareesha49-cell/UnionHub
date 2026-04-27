/** Roles that can be assigned via /api/director/users (not director — that uses register). */
export const ASSIGNABLE_STAFF_ROLES = [
  "principal",
  "teacher",
  "employee",
  "vice_principal",
  "tech_staff",
  "finance",
];

export function normalizeAssignableRole(role) {
  if (role === undefined || role === null) return null;
  const value = String(role)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return ASSIGNABLE_STAFF_ROLES.includes(value) ? value : null;
}
