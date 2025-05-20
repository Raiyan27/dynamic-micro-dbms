import {
  XCircle,
  User,
  CalendarDays,
  CheckCircle,
  AlertTriangle,
  XOctagon,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Percent,
  MinusCircle,
  Minus,
  PlusCircle,
  Sigma,
} from "lucide-react";
import PayrollCharts from "../components/PayrollCharts";

const PayrollStatusIcon = ({ status }) => {
  switch (status) {
    case "Paid":
      return <CheckCircle className="text-green-500 inline mr-2" size={18} />;
    case "Processed":
      return <CheckCircle className="text-blue-500 inline mr-2" size={18} />;
    case "Pending":
      return (
        <AlertTriangle className="text-yellow-500 inline mr-2" size={18} />
      );
    case "On Hold":
      return (
        <AlertTriangle className="text-orange-500 inline mr-2" size={18} />
      );
    case "Cancelled":
      return <XOctagon className="text-red-500 inline mr-2" size={18} />;
    default:
      return <HelpCircle className="text-gray-400 inline mr-2" size={18} />;
  }
};

const PayrollDetailViewModal = ({
  isOpen,
  onClose,
  payrollRecord,
  employeeFullName,
  payrollSchema,
}) => {
  if (!isOpen || !payrollRecord) return null;

  const formatCurrency = (value) => {
    if (value === undefined || value === null)
      return <span className="text-gray-500">N/A</span>;
    return Number(value).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null)
      return <span className="text-gray-500">N/A</span>;
    return `${Number(value).toFixed(2)}%`;
  };

  const formatDate = (value) => {
    if (value === undefined || value === null || String(value).trim() === "")
      return <span className="text-gray-500">N/A</span>;
    const dateVal = String(value).includes("T") ? value : value + "T00:00:00Z";
    const dateObj = new Date(dateVal);
    return isNaN(dateObj.getTime())
      ? "N/A"
      : dateObj.toLocaleDateString(undefined, {
          timeZone: "UTC",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const findAmountFieldKey = (percentageFieldKey) => {
    if (percentageFieldKey === "houseRentAllowancePercentage")
      return "houseRentAmount";
    if (percentageFieldKey === "medicalAllowancePercentage")
      return "medicalAmount";
    if (percentageFieldKey === "incomeTaxPercentage") return "incomeTaxAmount";
    return null;
  };

  const getDisplayItems = (category) => {
    const items = [];
    const processedAmountKeys = new Set();

    payrollSchema.forEach((field) => {
      if (
        field.isHidden ||
        field.isSystem ||
        field.notInForm ||
        [
          "internalId",
          "employeeId",
          "employeeFullName",
          "grossSalary",
          "totalDeductions",
          "netSalary",
        ].includes(field.key)
      )
        return;

      const value = payrollRecord[field.key];
      if (
        value === undefined ||
        value === null ||
        (typeof value === "number" &&
          value === 0 &&
          !field.key.toLowerCase().includes("percentage"))
      ) {
        return;
      }

      let isRelevantField = false;
      let itemToAdd = {
        label: field.label,
        key: field.key,
        percentageValue: null,
        amountValue: null,
        isPercentageBased: false,
        type: field.type,
      };

      if (category === "earnings") {
        if (field.key === "basicSalary") {
          isRelevantField = true;
          itemToAdd.amountValue = value;
        } else if (
          field.key.toLowerCase().includes("percentage") &&
          (field.key.toLowerCase().includes("allowance") ||
            field.key === "houseRentAllowancePercentage" ||
            field.key === "medicalAllowancePercentage")
        ) {
          isRelevantField = true;
          itemToAdd.isPercentageBased = true;
          itemToAdd.percentageValue = value;
          const amountKey = findAmountFieldKey(field.key);
          if (amountKey && payrollRecord[amountKey] !== undefined) {
            itemToAdd.amountValue = payrollRecord[amountKey];
            processedAmountKeys.add(amountKey);
          }
        } else if (
          (field.key.toLowerCase().includes("allowance") ||
            (field.isCalculated &&
              field.key.toLowerCase().includes("amount"))) &&
          !processedAmountKeys.has(field.key) &&
          !field.key.toLowerCase().includes("percentage")
        ) {
          isRelevantField = true;
          itemToAdd.amountValue = value;
        }
      } else if (category === "deductions") {
        if (
          field.key.toLowerCase().includes("percentage") &&
          (field.key.toLowerCase().includes("deduction") ||
            field.key.toLowerCase().includes("tax"))
        ) {
          isRelevantField = true;
          itemToAdd.isPercentageBased = true;
          itemToAdd.percentageValue = value;
          const amountKey = findAmountFieldKey(field.key);
          if (amountKey && payrollRecord[amountKey] !== undefined) {
            itemToAdd.amountValue = payrollRecord[amountKey];
            processedAmountKeys.add(amountKey);
          }
        } else if (
          (field.key.toLowerCase().includes("deduction") ||
            (field.isCalculated && field.key.toLowerCase().includes("tax"))) &&
          !processedAmountKeys.has(field.key) &&
          !field.key.toLowerCase().includes("percentage")
        ) {
          isRelevantField = true;
          itemToAdd.amountValue = value;
        }
      }

      if (isRelevantField) {
        if (
          itemToAdd.percentageValue !== null ||
          itemToAdd.amountValue !== null
        ) {
          items.push(itemToAdd);
        }
      }
    });
    return items;
  };

  const displayableEarnings = getDisplayItems("earnings");
  const displayableDeductions = getDisplayItems("deductions");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-gray-100 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
          <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
            <User size={32} className="mr-3 text-indigo-600" />
            Payroll Details: {employeeFullName} ({payrollRecord.employeeId})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            <XCircle size={30} />
          </button>
        </div>

        <div className="overflow-y-auto pr-3 flex-grow custom-scrollbar">
          {/* Key Info Section */}
          <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-lg">
              <p className="text-sm font-semibold text-gray-500 flex items-center mb-1">
                <CalendarDays size={18} className="mr-2 text-blue-600" />
                Disbursement Date
              </p>
              <p className="text-xl font-bold text-gray-700">
                {formatDate(payrollRecord.disbursementDate)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-lg">
              <p className="text-sm font-semibold text-gray-500 flex items-center mb-1">
                <HelpCircle size={18} className="mr-2 text-purple-600" />
                Payroll Status
              </p>
              <div className="text-xl font-bold text-gray-700 flex items-center">
                <PayrollStatusIcon status={payrollRecord.payrollStatus} />
                {payrollRecord.payrollStatus}
              </div>
            </div>
          </section>

          {/* Earnings & Deductions Detailed List */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Earnings Column */}
              <div className="bg-white p-6 rounded-xl shadow-xl">
                <h3 className="text-2xl font-bold text-green-600 mb-5 flex items-center border-b-2 border-green-200 pb-2">
                  <TrendingUp size={26} className="mr-3" />
                  Earnings
                </h3>
                <div className="space-y-4">
                  {displayableEarnings.map((item) => (
                    <div
                      key={`earn-${item.key}`}
                      className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-md text-gray-700 font-medium">
                          {item.label}
                        </span>
                        {item.isPercentageBased &&
                        item.percentageValue !== null ? (
                          <span className="text-sm font-semibold text-gray-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center">
                            <Percent
                              size={14}
                              className="mr-1 text-green-700"
                            />
                            {formatPercentage(item.percentageValue)}
                          </span>
                        ) : item.amountValue !== null ? (
                          <span className="text-lg font-bold text-gray-800">
                            {formatCurrency(item.amountValue)}
                          </span>
                        ) : null}
                      </div>
                      {/* Secondary Value Display (Calculated Amount for Percentage-based items) */}
                      {item.isPercentageBased && item.amountValue !== null && (
                        <div className="flex items-center justify-end mt-1.5">
                          <span className="text-md font-semibold text-green-700">
                            {formatCurrency(item.amountValue)}
                          </span>
                          <PlusCircle
                            size={16}
                            className="ml-2 text-green-500 opacity-70"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t-4 border-green-500 mt-4">
                    <span className="text-lg font-extrabold text-green-700">
                      Gross Salary
                    </span>
                    <span className="text-lg font-extrabold text-green-700">
                      {formatCurrency(payrollRecord.grossSalary)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="bg-white p-6 rounded-xl shadow-xl">
                <h3 className="text-2xl font-bold text-red-600 mb-5 flex items-center border-b-2 border-red-200 pb-2">
                  <TrendingDown size={26} className="mr-3" />
                  Deductions
                </h3>
                <div className="space-y-4">
                  {displayableDeductions.map((item) => (
                    <div
                      key={`deduct-${item.key}`}
                      className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-md text-gray-700 font-medium">
                          {item.label}
                        </span>
                        {/* Primary Value Display (Percentage OR Fixed Amount) */}
                        {item.isPercentageBased &&
                        item.percentageValue !== null ? (
                          <span className="text-sm font-semibold text-gray-600 bg-red-100 px-2 py-0.5 rounded-full flex items-center">
                            <Percent size={14} className="mr-1 text-red-700" />
                            {formatPercentage(item.percentageValue)}
                          </span>
                        ) : item.amountValue !== null ? (
                          <span className="text-lg font-bold text-gray-800">
                            {formatCurrency(item.amountValue)}
                          </span>
                        ) : null}
                      </div>
                      {/* Secondary Value Display (Calculated Amount for Percentage-based items) */}
                      {item.isPercentageBased && item.amountValue !== null && (
                        <div className="flex items-center justify-end mt-1.5">
                          <span className="text-md font-semibold text-red-700">
                            {formatCurrency(item.amountValue)}
                          </span>
                          <MinusCircle
                            size={16}
                            className="ml-2 text-red-500 opacity-70"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t-4 border-red-500 mt-4">
                    <span className="text-lg font-extrabold text-red-700">
                      Total Deductions
                    </span>
                    <span className="text-lg font-extrabold text-red-700">
                      {formatCurrency(payrollRecord.totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Net Salary Summary - Enhanced */}
          <section className="my-10 bg-indigo-600 text-white p-8 rounded-xl shadow-2xl text-center">
            <h3 className="text-3xl font-extrabold mb-3 flex items-center justify-center">
              <Sigma size={30} className="mr-3" /> Net Payable Salary
            </h3>
            <p className="text-5xl font-black tracking-tight mb-4">
              {formatCurrency(payrollRecord.netSalary)}
            </p>
            <div className="text-lg font-medium opacity-90 flex items-center justify-center space-x-2">
              <span>( {formatCurrency(payrollRecord.grossSalary)}</span>
              <Minus size={20} />
              <span>{formatCurrency(payrollRecord.totalDeductions)} )</span>
            </div>
          </section>

          {/* Charts Section */}
          <section className="pb-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <BarChart3 size={28} className="mr-3 text-indigo-500" />
              Visual Breakdown
            </h3>
            <PayrollCharts
              payrollData={payrollRecord}
              payrollSchema={payrollSchema}
            />
          </section>
        </div>
        <div className="mt-8 flex justify-end border-t border-gray-300 pt-6">
          <button
            onClick={onClose}
            className="px-8 py-3 text-md font-semibold text-white bg-indigo-700 rounded-lg shadow-lg hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailViewModal;
