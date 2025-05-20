import { generateInternalId as generateNewInternalId } from "./utils/helpers";

const EMPLOYEE_DATA_KEY = "EmployeeData";
const PAYROLL_DATA_KEY = "PayrollData";
const VISIBLE_EMPLOYEE_COLUMNS_KEY = "visibleEmployeeColumns";
const VISIBLE_PAYROLL_COLUMNS_KEY = "visiblePayrollColumns";

const defaultEmployeeSchema = [
  {
    key: "internalId",
    label: "Internal ID",
    type: "text",
    isSystem: true,
    isEditable: false,
    isHidden: true,
  },
  {
    key: "employeeId",
    label: "Employee ID",
    type: "text",
    isSystem: true,
    isRequired: true,
    isEditable: false,
  },
  { key: "fullName", label: "Full Name", type: "text", isRequired: true },
  { key: "department", label: "Department", type: "text" },
  { key: "jobTitle", label: "Job Title", type: "text" },
  { key: "dateOfJoining", label: "Date of Joining", type: "date" },
  { key: "email", label: "Email", type: "email", isRequired: true },
  { key: "phoneNumber", label: "Phone Number", type: "tel" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["Active", "On Leave", "Terminated"],
    defaultValue: "Active",
  },
];

const defaultPayrollSchema = [
  {
    key: "internalId",
    label: "Internal ID",
    type: "text",
    isSystem: true,
    isEditable: false,
    isHidden: true,
  },
  {
    key: "employeeId",
    label: "Employee ID",
    type: "text",
    isSystem: true,
    isEditable: false,
    isRequired: true,
    notInForm: true,
    alwaysVisibleInPayroll: true,
  },
  {
    key: "employeeFullName",
    label: "Full Name",
    type: "text",
    isSystem: true,
    isEditable: false,
    isCalculated: true,
    notInForm: true,
    isHiddenInTableByDefault: false,
  },
  {
    key: "disbursementDate",
    label: "Disbursement Date",
    type: "date",
    isRequired: true,
    isEditableAfterCreation: false,
    defaultValue: "",
  },
  {
    key: "payrollStatus",
    label: "Payroll Status",
    type: "select",
    options: ["Pending", "Processed", "Paid", "On Hold", "Cancelled"],
    defaultValue: "Pending",
    isRequired: true,
  },
  {
    key: "basicSalary",
    label: "Basic Salary",
    type: "number",
    isRequired: true,
    defaultValue: 0,
  },
  {
    key: "houseRentAllowancePercentage",
    label: "HRA (%)",
    type: "number",
    isRequired: false,
    defaultValue: 40,
    hint: "Of Basic",
  },
  {
    key: "medicalAllowancePercentage",
    label: "Medical (%)",
    type: "number",
    isRequired: false,
    defaultValue: 10,
    hint: "Of Basic",
  },
  {
    key: "conveyanceAllowanceFixed",
    label: "Conveyance",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "telephoneAllowanceFixed",
    label: "Telephone",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "specialAllowanceFixed",
    label: "Special Allow.",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "otherAllowancesFixed",
    label: "Other Allow.",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "incomeTaxPercentage",
    label: "Income Tax (%)",
    type: "number",
    defaultValue: 0,
    hint: "Of Gross (Simplified)",
  },
  {
    key: "otherDeductionsFixed",
    label: "Other Deduct.",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "houseRentAmount",
    label: "HRA Amt",
    type: "number",
    isCalculated: true,
    isEditable: false,
  },
  {
    key: "medicalAmount",
    label: "Medical Amt",
    type: "number",
    isCalculated: true,
    isEditable: false,
  },
  {
    key: "grossSalary",
    label: "Gross Salary",
    type: "number",
    isCalculated: true,
    isEditable: false,
    isHighlyVisible: true,
  },
  {
    key: "incomeTaxAmount",
    label: "Income Tax Amt",
    type: "number",
    isCalculated: true,
    isEditable: false,
  },
  {
    key: "totalDeductions",
    label: "Total Deduct.",
    type: "number",
    isCalculated: true,
    isEditable: false,
  },
  {
    key: "netSalary",
    label: "Net Salary",
    type: "number",
    isCalculated: true,
    isEditable: false,
    isHighlyVisible: true,
  },
];

export const api = {
  fetchEmployeeSchema: async () => Promise.resolve(defaultEmployeeSchema),
  fetchEmployees: async () => {
    const savedData = localStorage.getItem(EMPLOYEE_DATA_KEY);
    return Promise.resolve(savedData ? JSON.parse(savedData) : []);
  },
  addEmployee: async (employeeData) => {
    const newEmployee = {
      ...employeeData,
      internalId: generateNewInternalId(),
    };
    const employees = await api.fetchEmployees();
    const updatedEmployees = [...employees, newEmployee];
    localStorage.setItem(EMPLOYEE_DATA_KEY, JSON.stringify(updatedEmployees));
    return Promise.resolve(newEmployee);
  },
  updateEmployee: async (internalId, employeeData) => {
    const employees = await api.fetchEmployees();
    const updatedEmployees = employees.map((emp) =>
      emp.internalId === internalId ? { ...emp, ...employeeData } : emp
    );
    localStorage.setItem(EMPLOYEE_DATA_KEY, JSON.stringify(updatedEmployees));
    return Promise.resolve({ ...employeeData, internalId: internalId });
  },
  deleteEmployee: async (internalId) => {
    const employees = await api.fetchEmployees();
    const updatedEmployees = employees.filter(
      (emp) => emp.internalId !== internalId
    );
    localStorage.setItem(EMPLOYEE_DATA_KEY, JSON.stringify(updatedEmployees));
    return Promise.resolve({ success: true });
  },

  fetchPayrollSchema: async () => Promise.resolve(defaultPayrollSchema),
  fetchPayrolls: async () => {
    const savedData = localStorage.getItem(PAYROLL_DATA_KEY);
    return Promise.resolve(savedData ? JSON.parse(savedData) : []);
  },
  fetchPayrollByEmployeeId: async (employeeId) => {
    const payrolls = await api.fetchPayrolls();
    return Promise.resolve(
      payrolls.find((p) => p.employeeId === employeeId) || null
    );
  },
  addOrUpdatePayroll: async (payrollData) => {
    const payrolls = await api.fetchPayrolls();
    let savedPayroll;
    const existingPayrollIndex = payrolls.findIndex(
      (p) => p.employeeId === payrollData.employeeId
    );

    if (existingPayrollIndex > -1) {
      const originalPayroll = payrolls[existingPayrollIndex];
      let dataToSave = { ...payrollData };
      if (
        originalPayroll.disbursementDate &&
        !defaultPayrollSchema.find((f) => f.key === "disbursementDate")
          .isEditableAfterCreation
      ) {
        dataToSave.disbursementDate = originalPayroll.disbursementDate;
      }
      savedPayroll = { ...originalPayroll, ...dataToSave };
      payrolls[existingPayrollIndex] = savedPayroll;
    } else {
      savedPayroll = { ...payrollData, internalId: generateNewInternalId() };
      payrolls.push(savedPayroll);
    }
    localStorage.setItem(PAYROLL_DATA_KEY, JSON.stringify(payrolls));
    return Promise.resolve(savedPayroll);
  },
  deletePayrollByEmployeeId: async (employeeId) => {
    const payrolls = await api.fetchPayrolls();
    const updatedPayrolls = payrolls.filter((p) => p.employeeId !== employeeId);
    localStorage.setItem(PAYROLL_DATA_KEY, JSON.stringify(updatedPayrolls));
    return Promise.resolve({ success: true });
  },

  getVisibleEmployeeColumns: () => {
    const saved = localStorage.getItem(VISIBLE_EMPLOYEE_COLUMNS_KEY);
    return saved ? JSON.parse(saved) : null;
  },
  saveVisibleEmployeeColumns: (keys) => {
    localStorage.setItem(VISIBLE_EMPLOYEE_COLUMNS_KEY, JSON.stringify(keys));
  },
  getVisiblePayrollColumns: () => {
    const saved = localStorage.getItem(VISIBLE_PAYROLL_COLUMNS_KEY);
    let visibleKeys;
    if (saved) {
      visibleKeys = JSON.parse(saved);
    } else {
      visibleKeys = defaultPayrollSchema
        .filter(
          (f) =>
            f.alwaysVisibleInPayroll ||
            f.isHighlyVisible ||
            [
              "employeeFullName",
              "payrollStatus",
              "disbursementDate",
              "basicSalary",
            ].includes(f.key)
        )
        .map((f) => f.key);
    }

    if (!visibleKeys.includes("employeeId")) {
      visibleKeys.unshift("employeeId");
    }
    return [...new Set(visibleKeys)];
  },
  saveVisiblePayrollColumns: (keys) => {
    const payrollEmployeeIdField = defaultPayrollSchema.find(
      (f) => f.key === "employeeId" && f.alwaysVisibleInPayroll
    );
    let keysToSave = [...keys];
    if (payrollEmployeeIdField && !keysToSave.includes("employeeId")) {
      keysToSave.unshift("employeeId");
    }
    localStorage.setItem(
      VISIBLE_PAYROLL_COLUMNS_KEY,
      JSON.stringify([...new Set(keysToSave)])
    );
  },
};
