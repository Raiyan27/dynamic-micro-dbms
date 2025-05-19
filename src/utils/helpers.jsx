export const generateInternalId = () =>
  `_internal_${Math.random().toString(36).substr(2, 9)}`;

export const generateNextEmployeeId = (existingEmployees) => {
  const existingIds = existingEmployees
    .map((emp) => emp.employeeId)
    .filter((id) => typeof id === "string" && id.startsWith("E"))
    .map((id) => parseInt(id.substring(1), 10))
    .filter((num) => !isNaN(num));

  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `E${String(maxId + 1).padStart(3, "0")}`;
};

export const calculatePayrollMetrics = (payrollDataFromForm) => {
  const metrics = { ...payrollDataFromForm };

  const basicSalary = parseFloat(metrics.basicSalary) || 0;

  metrics.houseRentAllowancePercentage =
    parseFloat(metrics.houseRentAllowancePercentage) || 0;
  metrics.medicalAllowancePercentage =
    parseFloat(metrics.medicalAllowancePercentage) || 0;
  metrics.conveyanceAllowanceFixed =
    parseFloat(metrics.conveyanceAllowanceFixed) || 0;
  metrics.telephoneAllowanceFixed =
    parseFloat(metrics.telephoneAllowanceFixed) || 0;
  metrics.specialAllowanceFixed =
    parseFloat(metrics.specialAllowanceFixed) || 0;
  metrics.otherAllowancesFixed = parseFloat(metrics.otherAllowancesFixed) || 0;

  metrics.incomeTaxPercentage = parseFloat(metrics.incomeTaxPercentage) || 0;
  metrics.otherDeductionsFixed = parseFloat(metrics.otherDeductionsFixed) || 0;

  metrics.houseRentAmount =
    (basicSalary * metrics.houseRentAllowancePercentage) / 100;
  metrics.medicalAmount =
    (basicSalary * metrics.medicalAllowancePercentage) / 100;

  metrics.grossSalary =
    basicSalary +
    metrics.houseRentAmount +
    metrics.medicalAmount +
    metrics.conveyanceAllowanceFixed +
    metrics.telephoneAllowanceFixed +
    metrics.specialAllowanceFixed +
    metrics.otherAllowancesFixed;

  metrics.incomeTaxAmount =
    (metrics.grossSalary * metrics.incomeTaxPercentage) / 100;

  metrics.totalDeductions =
    metrics.incomeTaxAmount + metrics.otherDeductionsFixed;

  metrics.netSalary = metrics.grossSalary - metrics.totalDeductions;

  for (const key in metrics) {
    if (
      typeof metrics[key] === "number" &&
      !key.toLowerCase().includes("percentage") &&
      key !== "basicSalary"
    ) {
      if (isFinite(metrics[key])) {
        metrics[key] = parseFloat(metrics[key].toFixed(2));
      } else {
        metrics[key] = 0;
      }
    }
  }
  metrics.basicSalary = basicSalary;

  return metrics;
};
