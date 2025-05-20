import {
  XCircle,
  User,
  Briefcase,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XOctagon,
  HelpCircle,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const PayrollStatusIcon = ({ status }) => {
  switch (status) {
    case "Paid":
      return <CheckCircle className="text-green-500 inline mr-1" size={16} />;
    case "Processed":
      return <CheckCircle className="text-blue-500 inline mr-1" size={16} />;
    case "Pending":
      return (
        <AlertTriangle className="text-yellow-500 inline mr-1" size={16} />
      );
    case "On Hold":
      return (
        <AlertTriangle className="text-orange-500 inline mr-1" size={16} />
      );
    case "Cancelled":
      return <XOctagon className="text-red-500 inline mr-1" size={16} />;
    default:
      return <HelpCircle className="text-gray-400 inline mr-1" size={16} />;
  }
};

const EmployeeDetailViewModal = ({
  isOpen,
  onClose,
  employee,
  payrollSummary,
  employeeSchema,
  payrollSchema,
}) => {
  if (!isOpen || !employee) return null;

  const profileDetails = employeeSchema
    .filter(
      (field) =>
        !field.isHidden &&
        employee[field.key] !== undefined &&
        employee[field.key] !== null &&
        String(employee[field.key]).trim() !== ""
    )
    .map((field) => ({
      label: field.label,
      value: employee[field.key],
      key: field.key,
      type: field.type,
    }));

  const payrollDisplayItems = payrollSummary
    ? payrollSchema
        .filter(
          (field) =>
            !field.isHidden &&
            !field.notInForm &&
            payrollSummary[field.key] !== undefined &&
            (field.isCalculated ||
              ["disbursementDate", "payrollStatus", "basicSalary"].includes(
                field.key
              ))
        )
        .map((field) => ({
          label: field.label,
          value: payrollSummary[field.key],
          key: field.key,
          type: field.type,
        }))
    : [];

  const formatValue = (value, type, key) => {
    if (value === undefined || value === null || String(value).trim() === "")
      return "N/A";
    if (type === "date") {
      const dateVal = String(value).includes("T")
        ? value
        : value + "T00:00:00Z";
      const dateObj = new Date(dateVal);
      return isNaN(dateObj.getTime())
        ? "N/A"
        : dateObj.toLocaleDateString(undefined, {
            timeZone: "UTC",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
    }
    if (type === "number" && key !== "employeeId") {
      return Number(value).toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
      });
    }
    if (key === "status") return <StatusBadge status={value} />;
    if (key === "payrollStatus")
      return (
        <>
          <PayrollStatusIcon status={value} />
          {value}
        </>
      );

    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <User size={28} className="mr-3 text-indigo-600" />
            Employee Details: {employee.fullName} ({employee.employeeId})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            <XCircle size={28} />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 flex-grow">
          <section className="mb-8">
            <h3 className="text-xl font-medium text-indigo-700 mb-4 flex items-center">
              <Briefcase size={22} className="mr-2" /> Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-indigo-50 p-4 rounded-lg">
              {profileDetails.map((item) => (
                <div key={`prof-${item.key}`} className="py-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-md text-gray-700 break-words">
                    {formatValue(item.value, item.type, item.key)}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xl font-medium text-green-700 mb-4 flex items-center">
              <DollarSign size={22} className="mr-2" /> Payroll Summary
            </h3>
            {payrollSummary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-green-50 p-4 rounded-lg">
                {payrollDisplayItems.map((item) => (
                  <div key={`pay-${item.key}`} className="py-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-md text-gray-700 break-words">
                      {formatValue(item.value, item.type, item.key)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-yellow-700 font-medium">
                  No payroll information available for this employee.
                </p>
              </div>
            )}
          </section>
        </div>
        <div className="mt-8 flex justify-end border-t pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailViewModal;
