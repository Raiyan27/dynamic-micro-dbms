export const generateInternalId = () =>
  `emp_internal_${Math.random().toString(36).substr(2, 9)}`;

export const generateNextEmployeeId = (existingEmployees) => {
  if (!existingEmployees) return "E001";
  const existingIds = existingEmployees
    .map((emp) => emp.employeeId)
    .filter((id) => typeof id === "string" && id.startsWith("E"))
    .map((id) => parseInt(id.substring(1), 10))
    .filter((num) => !isNaN(num));

  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `E${String(maxId + 1).padStart(3, "0")}`;
};
