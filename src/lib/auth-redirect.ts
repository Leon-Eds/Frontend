/**
 * Picks the dashboard a signed-in user should land on.
 * `role` is the role the backend returned; `selectedRole` is the login tab the user picked.
 */
export function dashboardPathFor(role: string, selectedRole = ""): string {
  const r = role.toLowerCase().trim();
  const s = selectedRole.toLowerCase().trim();
  if (r === "superadmin") return "/super-admin";
  if (r === "attendanceofficer") return "/dashboard/scanner";
  if (s === "student" || ["student", "parent", "guardian"].includes(r)) return "/dashboard/student-portal";
  if (s === "teacher" || ["teacher", "faculty"].includes(r)) return "/dashboard/faculty";
  if (s === "bursar" || r === "bursar") return "/dashboard/bursar";
  return "/dashboard";
}
