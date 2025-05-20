import { generateInternalId as generateNewInternalId } from "./utils/helpers";
import { calculatePayrollMetrics as calculateDummyPayrollMetrics } from "./utils/helpers";

const EMPLOYEE_DATA_KEY = "EmployeeData";
const PAYROLL_DATA_KEY = "PayrollData";
const VISIBLE_EMPLOYEE_COLUMNS_KEY = "visibleEmployeeColumns";
const VISIBLE_PAYROLL_COLUMNS_KEY = "visiblePayrollColumns";

const createDummyEmployees = () => {
  const dummyEmployees = [
    {
      employeeId: "E001",
      fullName: "John Doe",
      department: "IT",
      jobTitle: "Web Developer",
      dateOfJoining: "2022-01-15",
      email: "JohnDoe@example.com",
      phoneNumber: "123-456-7890",
      status: "Active",
    },
    {
      employeeId: "E002",
      fullName: "Kate Smith",
      department: "HR",
      jobTitle: "Senior HR Manage",
      dateOfJoining: "2021-05-20",
      email: "KateSmith@example.com",
      phoneNumber: "987-654-3210",
      status: "Active",
    },
    {
      employeeId: "E003",
      fullName: "Charlie Brown",
      department: "Animation",
      jobTitle: "Motion Graphic Artist",
      dateOfJoining: "2023-03-10",
      email: "charlie@example.com",
      phoneNumber: "555-123-4567",
      status: "On Leave",
    },
    {
      employeeId: "E004",
      fullName: "Harvy Dent",
      department: "Legal",
      jobTitle: "Assitant Lawyer",
      dateOfJoining: "2020-11-01",
      email: "diana@example.com",
      phoneNumber: "111-222-3333",
      status: "Active",
    },
  ];
  return dummyEmployees.map((emp) => ({
    ...emp,
    internalId: generateNewInternalId(),
  }));
};

const createDummyPayrolls = (employees, payrollSchema) => {
  return employees
    .filter((emp) => emp.status !== "Terminated")
    .map((emp) => {
      const basicSalary = Math.floor(Math.random() * (8000 - 3000 + 1) + 3000);
      let disbursementDate = new Date();
      disbursementDate.setDate(1);

      let payrollStatus = "Pending";
      if (Math.random() < 0.6) payrollStatus = "Paid";
      else if (Math.random() < 0.8) payrollStatus = "Processed";

      const payrollInput = {
        employeeId: emp.employeeId,
        basicSalary: basicSalary,
        houseRentAllowancePercentage:
          payrollSchema.find((f) => f.key === "houseRentAllowancePercentage")
            ?.defaultValue || 40,
        medicalAllowancePercentage:
          payrollSchema.find((f) => f.key === "medicalAllowancePercentage")
            ?.defaultValue || 10,
        conveyanceAllowanceFixed:
          Math.random() > 0.5 ? Math.floor(Math.random() * 200) : 0,
        telephoneAllowanceFixed:
          Math.random() > 0.3 ? Math.floor(Math.random() * 100) : 0,
        specialAllowanceFixed:
          Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0,
        otherAllowancesFixed: 0,
        incomeTaxPercentage:
          payrollSchema.find((f) => f.key === "incomeTaxPercentage")
            ?.defaultValue || 10,
        otherDeductionsFixed:
          Math.random() > 0.8 ? Math.floor(Math.random() * 50) : 0,
        disbursementDate: disbursementDate.toISOString().split("T")[0],
        payrollStatus: payrollStatus,
        internalId: generateNewInternalId(),
      };
      return calculateDummyPayrollMetrics(payrollInput);
    });
};

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
    let savedData = localStorage.getItem(EMPLOYEE_DATA_KEY);
    if (savedData === null) {
      console.log(
        "API: No employee data found in localStorage. Creating dummy employees."
      );
      const dummyEmployees = createDummyEmployees();
      localStorage.setItem(EMPLOYEE_DATA_KEY, JSON.stringify(dummyEmployees));
      return Promise.resolve(dummyEmployees);
    }
    return Promise.resolve(JSON.parse(savedData));
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
    let savedPayrollData = localStorage.getItem(PAYROLL_DATA_KEY);
    if (savedPayrollData === null) {
      console.log(
        "API: No payroll data found in localStorage. Creating dummy payrolls."
      );
      const employees = await api.fetchEmployees();
      if (employees.length > 0) {
        const dummyPayrolls = createDummyPayrolls(
          employees,
          defaultPayrollSchema
        );
        localStorage.setItem(PAYROLL_DATA_KEY, JSON.stringify(dummyPayrolls));
        return Promise.resolve(dummyPayrolls);
      } else {
        localStorage.setItem(PAYROLL_DATA_KEY, JSON.stringify([]));
        return Promise.resolve([]);
      }
    }
    return Promise.resolve(JSON.parse(savedPayrollData));
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
      const disbursementDateSchema = defaultPayrollSchema.find(
        (f) => f.key === "disbursementDate"
      );
      if (
        originalPayroll.disbursementDate &&
        disbursementDateSchema &&
        !disbursementDateSchema.isEditableAfterCreation
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
    if (saved === null) {
      const defaultKeys = defaultEmployeeSchema
        .filter(
          (f) =>
            ["employeeId", "fullName", "department", "status"].includes(
              f.key
            ) && !f.isHidden
        )
        .map((f) => f.key);
      return defaultKeys.length > 0
        ? defaultKeys
        : defaultEmployeeSchema.slice(0, 4).map((f) => f.key);
    }
    return JSON.parse(saved);
  },
  saveVisibleEmployeeColumns: (keys) => {
    localStorage.setItem(VISIBLE_EMPLOYEE_COLUMNS_KEY, JSON.stringify(keys));
  },
  getVisiblePayrollColumns: () => {
    const saved = localStorage.getItem(VISIBLE_PAYROLL_COLUMNS_KEY);
    let visibleKeys;
    if (saved === null) {
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
    } else {
      visibleKeys = JSON.parse(saved);
    }

    const employeeIdField = defaultPayrollSchema.find(
      (f) => f.key === "employeeId" && f.alwaysVisibleInPayroll
    );
    if (employeeIdField && !visibleKeys.includes("employeeId")) {
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
