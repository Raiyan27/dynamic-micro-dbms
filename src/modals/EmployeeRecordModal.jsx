import React, { useState, useEffect } from "react";
import { Save, XCircle } from "lucide-react";
import { generateInternalId as generateNewInternalId } from "../utils/helpers";

const EmployeeRecordModal = ({
  isOpen,
  onClose,
  onSave,
  currentRecord,
  allFields,
  nextEmployeeId,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      let initialData;
      if (currentRecord) {
        initialData = { ...currentRecord };
      } else {
        initialData = { internalId: generateNewInternalId() };
        allFields.forEach((field) => {
          if (field.key === "employeeId") {
            initialData[field.key] = nextEmployeeId;
          } else if (field.key !== "internalId") {
            initialData[field.key] =
              field.defaultValue !== undefined ? field.defaultValue : "";
          }
        });
      }
      setFormData(initialData);
      setErrors({});
    }
  }, [currentRecord, isOpen, allFields, nextEmployeeId]);

  const handleChange = (key, value, type) => {
    setFormData((prev) => ({
      ...prev,
      [key]: type === "number" && value !== "" ? parseFloat(value) : value,
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    allFields.forEach((field) => {
      if (field.isSystem && field.key === "internalId") return;

      const value = formData[field.key];
      const stringValue =
        value === undefined || value === null ? "" : String(value).trim();

      const isFieldRequired = !currentRecord
        ? field.key !== "internalId"
        : field.isRequired;

      if (isFieldRequired && stringValue === "") {
        newErrors[field.key] = `${field.label} cannot be empty.`;
      }

      if (!newErrors[field.key]) {
        if (
          field.type === "email" &&
          stringValue !== "" &&
          !/\S+@\S+\.\S+/.test(stringValue)
        ) {
          newErrors[field.key] = `Invalid email format.`;
        }
        if (field.type === "tel" && stringValue !== "") {
          const phoneNumber = stringValue.replace(/\D/g, "");
          if (phoneNumber.length < 7 || phoneNumber.length > 15) {
            newErrors[field.key] = `Phone must be 7-15 digits.`;
          }
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {currentRecord ? "Edit Employee" : "Add New Employee"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allFields
              .filter((field) => !field.isHidden && field.key !== "internalId")
              .map((field) => {
                const isFieldReadOnly = field.isEditable === false;
                const isRequiredForThisMode = !currentRecord
                  ? true
                  : field.isRequired;

                return (
                  <div
                    key={field.key}
                    className={field.type === "textarea" ? "md:col-span-2" : ""}
                  >
                    <label
                      htmlFor={field.key}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.label}{" "}
                      {isRequiredForThisMode && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {field.type === "select" ? (
                      <select
                        id={field.key}
                        name={field.key}
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value, field.type)
                        }
                        required={isRequiredForThisMode}
                        disabled={isFieldReadOnly}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          errors[field.key]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          isFieldReadOnly
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option
                          value=""
                          disabled
                        >{`Select ${field.label}`}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={
                          field.type === "email"
                            ? "email"
                            : field.type === "tel"
                            ? "tel"
                            : field.type === "date"
                            ? "date"
                            : field.type === "number"
                            ? "number"
                            : "text"
                        }
                        id={field.key}
                        name={field.key}
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value, field.type)
                        }
                        required={isRequiredForThisMode}
                        readOnly={isFieldReadOnly}
                        className={`mt-1 block w-full px-3 py-2 border ${
                          isFieldReadOnly
                            ? "bg-gray-100 cursor-not-allowed"
                            : errors[field.key]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder={field.placeholder || field.label}
                        step={field.type === "number" ? "any" : undefined}
                      />
                    )}
                    {errors[field.key] && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors[field.key]}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save size={18} className="inline mr-2" /> Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EmployeeRecordModal;
