import { useState, useEffect, useMemo } from "react";
import { Eye } from "lucide-react";
import { api } from "../api";
import DynamicTable from "../components/DynamicTable";
import PaginationControls from "../components/PaginationControls";
import ColumnTogglerModal from "../modals/ColumnTogglerModal";
import PayrollRecordModal from "../modals/PayrollRecordModal";

const PayrollPage = () => {
  const [allPayrollFields, setAllPayrollFields] = useState([]);
  const [visiblePayrollColumnKeys, setVisiblePayrollColumnKeys] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [currentEditingPayroll, setCurrentEditingPayroll] = useState(null);
  const [currentEditingEmployeeFullName, setCurrentEditingEmployeeFullName] =
    useState("");

  const [isColumnTogglerModalOpen, setIsColumnTogglerModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pSchema, payrolls, emps] = await Promise.all([
        api.fetchPayrollSchema(),
        api.fetchPayrolls(),
        api.fetchEmployees(),
      ]);
      setAllPayrollFields(pSchema);
      setPayrollData(payrolls);
      setEmployeeData(emps);

      const initialVisibleKeys = api.getVisiblePayrollColumns();
      setVisiblePayrollColumnKeys(initialVisibleKeys);

      setError(null);
    } catch (err) {
      console.error("Failed to load payroll data:", err);
      setError("Failed to load payroll data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allPayrollFields.length > 0 && visiblePayrollColumnKeys.length > 0) {
      api.saveVisiblePayrollColumns(visiblePayrollColumnKeys);
    }
  }, [visiblePayrollColumnKeys, allPayrollFields]);

  const handleColumnVisibilityChange = (keyToToggle) => {
    const fieldSchema = allPayrollFields.find((f) => f.key === keyToToggle);

    if (
      fieldSchema &&
      fieldSchema.alwaysVisibleInPayroll &&
      visiblePayrollColumnKeys.includes(keyToToggle)
    ) {
      alert(`${fieldSchema.label} column cannot be hidden.`);
      return;
    }

    setVisiblePayrollColumnKeys((prev) => {
      let newKeys;
      if (prev.includes(keyToToggle)) {
        newKeys = prev.filter((k) => k !== keyToToggle);
      } else {
        newKeys = [...prev, keyToToggle];
      }

      allPayrollFields.forEach((field) => {
        if (field.alwaysVisibleInPayroll && !newKeys.includes(field.key)) {
          newKeys.unshift(field.key);
        }
      });
      return [...new Set(newKeys)];
    });
  };

  const enrichedPayrollData = useMemo(() => {
    return payrollData.map((p) => {
      const employee = employeeData.find(
        (emp) => emp.employeeId === p.employeeId
      );
      return {
        ...p,
        employeeFullName: employee ? employee.fullName : "N/A",
      };
    });
  }, [payrollData, employeeData]);

  const filteredPayrollData = useMemo(() => {
    if (!searchTerm) return enrichedPayrollData;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return enrichedPayrollData.filter((item) =>
      allPayrollFields.some((field) => {
        const value = item[field.key];

        const checkValues = [value, item.employeeFullName];
        return checkValues.some(
          (v) =>
            v !== undefined &&
            v !== null &&
            String(v).toLowerCase().includes(lowerSearchTerm)
        );
      })
    );
  }, [enrichedPayrollData, allPayrollFields, searchTerm]);

  const columnsToDisplayForPayroll = useMemo(() => {
    const potentialTableColumns = allPayrollFields.filter(
      (field) => !field.isHidden
    );

    let displayKeys = [...visiblePayrollColumnKeys];

    potentialTableColumns.forEach((field) => {
      if (field.alwaysVisibleInPayroll && !displayKeys.includes(field.key)) {
        displayKeys.unshift(field.key);
      }
    });
    displayKeys = [...new Set(displayKeys)];

    return displayKeys
      .map((key) => potentialTableColumns.find((field) => field.key === key))
      .filter(Boolean)
      .sort((a, b) => {
        if (a.key === "employeeId") return -1;
        if (b.key === "employeeId") return 1;

        const indexA = allPayrollFields.findIndex((f) => f.key === a.key);
        const indexB = allPayrollFields.findIndex((f) => f.key === b.key);
        return indexA - indexB;
      });
  }, [allPayrollFields, visiblePayrollColumnKeys]);

  const totalPages = Math.ceil(filteredPayrollData.length / ROWS_PER_PAGE);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (currentPage < 1 && totalPages > 0) setCurrentPage(1);
    else if (totalPages === 0 && filteredPayrollData.length === 0)
      setCurrentPage(1);
  }, [currentPage, totalPages, filteredPayrollData.length]);

  const paginatedPayrollData = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredPayrollData.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredPayrollData, currentPage, ROWS_PER_PAGE]);

  const handleEditPayroll = (payrollItem) => {
    setCurrentEditingPayroll(payrollItem);
    const emp = employeeData.find(
      (e) => e.employeeId === payrollItem.employeeId
    );
    setCurrentEditingEmployeeFullName(emp ? emp.fullName : "N/A");
    setIsPayrollModalOpen(true);
  };

  const handleSavePayroll = async (payrollDataToSave) => {
    setIsLoading(true);
    try {
      await api.addOrUpdatePayroll(payrollDataToSave);
      setError(null);
      setIsPayrollModalOpen(false);
      await fetchData();
      alert("Payroll data updated successfully!");
    } catch (err) {
      console.error("Failed to save payroll:", err);
      setError("Failed to save payroll: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleableColumns = useMemo(() => {
    return allPayrollFields.filter((f) => !f.isHidden);
  }, [allPayrollFields]);

  if (isLoading && allPayrollFields.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-100">
        Loading Payroll System...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
          Payroll Overview
        </h1>
      </header>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search payroll records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto sm:flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => setIsColumnTogglerModalOpen(true)}
            title="Show/Hide Columns"
            className="flex items-center px-3 py-2 sm:px-4 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600"
          >
            <Eye size={18} className="mr-0 sm:mr-2" />{" "}
            <span className="hidden sm:inline">Columns</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center text-gray-500 py-4">Processing...</div>
      )}

      {!isLoading && (
        <>
          <DynamicTable
            columns={columnsToDisplayForPayroll}
            data={paginatedPayrollData}
            onEdit={handleEditPayroll}
            idKey="internalId"
            moduleType="payroll"
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {isPayrollModalOpen &&
        currentEditingPayroll &&
        allPayrollFields.length > 0 && (
          <PayrollRecordModal
            isOpen={isPayrollModalOpen}
            onClose={() => setIsPayrollModalOpen(false)}
            onSave={handleSavePayroll}
            employeeId={currentEditingPayroll.employeeId}
            employeeFullName={currentEditingEmployeeFullName}
            existingPayrollData={currentEditingPayroll}
            payrollSchema={allPayrollFields}
          />
        )}

      {isColumnTogglerModalOpen && toggleableColumns.length > 0 && (
        <ColumnTogglerModal
          isOpen={isColumnTogglerModalOpen}
          onClose={() => setIsColumnTogglerModalOpen(false)}
          allColumns={toggleableColumns}
          visibleColumnKeys={visiblePayrollColumnKeys}
          onVisibilityChange={handleColumnVisibilityChange}
          moduleContext="payroll"
        />
      )}
    </div>
  );
};
export default PayrollPage;
