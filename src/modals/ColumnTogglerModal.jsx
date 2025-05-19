import React from "react";
import { XCircle } from "lucide-react";

const ColumnTogglerModal = ({
  isOpen,
  onClose,
  allColumns,
  visibleColumnKeys,
  onVisibilityChange,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Show/Hide Columns
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {allColumns.map((col) => (
            <label
              key={col.key}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                checked={visibleColumnKeys.includes(col.key)}
                onChange={() => onVisibilityChange(col.key)}
                disabled={
                  col.isSystem && col.isRequired && col.isEditable === false
                }
              />
              <span className="text-gray-700">{col.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnTogglerModal;
