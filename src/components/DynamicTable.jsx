import {
  Edit3,
  Trash2,
  Eye as ViewIcon,
  ExternalLink as ManagePayrollIcon,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

const DynamicTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onViewDetails,
  onManagePayroll,
  idKey = "internalId",
  moduleType = "employee",
}) => {
  if (!columns || columns.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        No columns selected. Use the 'Columns' button to show columns.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(
              (col) =>
                !col.isHiddenInTable && (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                )
            )}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.filter((c) => !c.isHiddenInTable).length + 1}
                className="px-6 py-10 text-center text-gray-500"
              >
                No {moduleType} records found.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item[idKey]}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => {
                  if (col.isHiddenInTable) return null;
                  return (
                    <td
                      key={col.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {(() => {
                        const val = item[col.key];
                        if (moduleType === "employee" && col.key === "status") {
                          return <StatusBadge status={val} />;
                        }
                        if (col.type === "date" && val) {
                          const dateVal = String(val).includes("T")
                            ? val
                            : val + "T00:00:00Z";
                          const dateObj = new Date(dateVal);
                          return isNaN(dateObj.getTime())
                            ? "N/A"
                            : dateObj.toLocaleDateString(undefined, {
                                timeZone: "UTC",
                              });
                        }
                        if (
                          moduleType === "payroll" &&
                          col.type === "number" &&
                          typeof val === "number"
                        ) {
                          return val.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                        }
                        return val === undefined ||
                          val === null ||
                          String(val).trim() === ""
                          ? "N/A"
                          : String(val);
                      })()}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                  {onViewDetails && moduleType === "employee" && (
                    <button
                      onClick={() => onViewDetails(item)}
                      title="View Details"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <ViewIcon size={18} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      title={`Edit ${moduleType}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit3 size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item[idKey])}
                      title={`Delete ${moduleType}`}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  {moduleType === "employee" && onManagePayroll && (
                    <button
                      onClick={() =>
                        onManagePayroll(item.employeeId, item.fullName)
                      }
                      title="Manage Payroll"
                      className="text-green-600 hover:text-green-900"
                    >
                      <ManagePayrollIcon size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
