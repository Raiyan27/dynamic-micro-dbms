import React, { useState, useEffect, useCallback } from "react";
import { Save, XCircle } from "lucide-react";
import { calculatePayrollMetrics, generateInternalId } from "../utils/helpers";

const PayrollRecordModal = ({
  isOpen,
  onClose,
  onSave,
  employeeId,
  employeeFullName,
  existingPayrollData,
  payrollSchema,
  isMandatoryInitialSetup = false,
}) => {
  const [formData, setFormData] = useState({});
  const [calculatedFields, setCalculatedFields] = useState({});
  const [errors, setErrors] = useState({});
  const [isInitialSetupState, setIsInitialSetupState] = useState(false);

  const initializeFormData = useCallback(() => {
    const initialData = { employeeId };
    const isActuallyInitial = !existingPayrollData || isMandatoryInitialSetup;
    setIsInitialSetupState(isActuallyInitial);

    if (existingPayrollData && !isMandatoryInitialSetup) {
      payrollSchema.forEach((field) => {
        if (!field.isCalculated && !field.notInForm) {
          initialData[field.key] =
            existingPayrollData[field.key] !== undefined
              ? existingPayrollData[field.key]
              : field.defaultValue !== undefined
              ? field.defaultValue
              : "";
        }
      });
      initialData.internalId =
        existingPayrollData.internalId || generateInternalId();
    } else {
      payrollSchema.forEach((field) => {
        if (!field.isCalculated && !field.notInForm) {
          initialData[field.key] =
            field.defaultValue !== undefined ? field.defaultValue : "";
        }
      });
      initialData.internalId = generateInternalId();
    }
    initialData.basicSalary = parseFloat(initialData.basicSalary) || 0;
    setFormData(initialData);
    setErrors({});
  }, [employeeId, existingPayrollData, payrollSchema, isMandatoryInitialSetup]);

  useEffect(() => {
    if (isOpen) {
      initializeFormData();
    }
  }, [isOpen, initializeFormData]);

  useEffect(() => {
    if (isOpen && Object.keys(formData).length > 0) {
      const metrics = calculatePayrollMetrics(formData);
      setCalculatedFields(metrics);
    }
  }, [formData, isOpen]);

  const handleChange = (key, value) => {
    setFormData((prev) => {
      const fieldSchema = payrollSchema.find((f) => f.key === key);
      const updatedValue =
        fieldSchema?.type === "number" && value !== ""
          ? parseFloat(value)
          : value;
      return { ...prev, [key]: updatedValue };
    });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    payrollSchema.forEach((field) => {
      if (field.isCalculated || field.notInForm || field.isHidden) return;

      const disbursementFieldSchema = payrollSchema.find(
        (f) => f.key === "disbursementDate"
      );
      const isDisbursementDateNonEditableAfterCreation =
        disbursementFieldSchema?.isEditableAfterCreation === false;

      if (field.isRequired) {
        const value = formData[field.key];
        const stringValue =
          value === undefined || value === null ? "" : String(value).trim();

        if (stringValue === "") {
          if (
            field.key === "disbursementDate" &&
            !isInitialSetupState &&
            isDisbursementDateNonEditableAfterCreation &&
            existingPayrollData?.disbursementDate
          ) {
            // Skip error
          } else {
            newErrors[field.key] = `${field.label} is required.`;
          }
        } else if (field.type === "number" && isNaN(parseFloat(value))) {
          newErrors[field.key] = `${field.label} must be a valid number.`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAttemptClose = () => {
    if (isMandatoryInitialSetup && isInitialSetupState) {
      alert(
        "You must complete and save the initial payroll information before closing."
      );
      return;
    }
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const finalPayrollData = {
        ...formData,
        ...calculatedFields,
        employeeId: employeeId,
        internalId:
          formData.internalId ||
          existingPayrollData?.internalId ||
          generateInternalId(),
      };
      onSave(finalPayrollData, isInitialSetupState);
    }
  };

  if (!isOpen) return null;

  const inputFields = payrollSchema.filter(
    (f) => !f.isCalculated && !f.notInForm && !f.isHidden
  );
  const displayCalculatedFields = payrollSchema.filter(
    (f) => f.isCalculated && !f.isHidden
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            {isInitialSetupState
              ? "Set Up Initial Payroll: "
              : "Manage Payroll: "}
            {employeeFullName} ({employeeId})
          </h2>
          <button
            onClick={handleAttemptClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isMandatoryInitialSetup && isInitialSetupState}
          >
            <XCircle size={24} />
          </button>
        </div>
        {isMandatoryInitialSetup && isInitialSetupState && (
          <p className="mb-4 p-3 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md text-sm">
            Please complete and save this initial payroll setup. This step is
            mandatory for new employees.
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-medium text-gray-800 mb-2 border-b pb-1">
            Configuration & Earnings/Deductions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6">
            {inputFields.map((field) => {
              const disbursementFieldSchema = payrollSchema.find(
                (f) => f.key === "disbursementDate"
              );
              const isDisbursementDateNonEditableAfterCreation =
                disbursementFieldSchema?.isEditableAfterCreation === false;
              const isFieldReadOnly =
                field.key === "disbursementDate" &&
                !isInitialSetupState &&
                isDisbursementDateNonEditableAfterCreation;

              return (
                <div key={field.key}>
                  <label
                    htmlFor={field.key}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {field.label}{" "}
                    {field.isRequired && (
                      <span className="text-red-500">*</span>
                    )}
                    {field.hint && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({field.hint})
                      </span>
                    )}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={field.key}
                      name={field.key}
                      value={
                        formData[field.key] === undefined
                          ? ""
                          : formData[field.key]
                      }
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      required={field.isRequired}
                      disabled={isFieldReadOnly}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors[field.key] ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        isFieldReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
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
                        field.type === "number"
                          ? "number"
                          : field.type === "date"
                          ? "date"
                          : "text"
                      }
                      id={field.key}
                      name={field.key}
                      value={
                        formData[field.key] === undefined
                          ? ""
                          : formData[field.key]
                      }
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      required={field.isRequired}
                      readOnly={isFieldReadOnly}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors[field.key] ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        isFieldReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
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

          <h3 className="text-lg font-medium text-gray-800 mb-2 border-b pb-1">
            Calculated Payroll Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6 bg-gray-50 p-4 rounded">
            {displayCalculatedFields.map((field) => (
              <div key={field.key}>
                <p className="text-sm font-medium text-gray-500">
                  {field.label}
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {calculatedFields[field.key] !== undefined &&
                  !isNaN(calculatedFields[field.key])
                    ? Number(calculatedFields[field.key]).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )
                    : "N/A"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleAttemptClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              // disabled={isMandatoryInitialSetup && isInitialSetupState}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save size={18} className="inline mr-2" /> Save Payroll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollRecordModal;
