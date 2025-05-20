import { useState, useEffect, useMemo } from "react";
import { Plus, Eye } from "lucide-react";
import { api } from "../api";
import { generateNextEmployeeId } from "../utils/helpers";
import StatsDisplay from "../components/StatsDisplay";
import DynamicTable from "../components/DynamicTable";
import PaginationControls from "../components/PaginationControls";
import ColumnTogglerModal from "../modals/ColumnTogglerModal";
import EmployeeRecordModal from "../modals/EmployeeRecordModal";
import PayrollRecordModal from "../modals/PayrollRecordModal";

const HomePage = () => {
  const [allProfileFields, setAllProfileFields] = useState([]);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [currentEmployeeRecord, setCurrentEmployeeRecord] = useState(null);

  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [currentPayrollEmployeeId, setCurrentPayrollEmployeeId] =
    useState(null);
  const [currentPayrollEmployeeFullName, setCurrentPayrollEmployeeFullName] =
    useState("");
  const [existingPayrollDataForModal, setExistingPayrollDataForModal] =
    useState(null);
  const [payrollSchema, setPayrollSchema] = useState([]);
  const [isMandatoryPayrollSetup, setIsMandatoryPayrollSetup] = useState(false);

  const [isColumnTogglerModalOpen, setIsColumnTogglerModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [nextEmployeeIdToUse, setNextEmployeeIdToUse] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [empSchema, emps, paySchema] = await Promise.all([
          api.fetchEmployeeSchema(),
          api.fetchEmployees(),
          api.fetchPayrollSchema(),
        ]);

        setAllProfileFields(empSchema);
        setPayrollSchema(paySchema);

        const savedVisibleKeys = api.getVisibleEmployeeColumns();
        if (savedVisibleKeys) {
          setVisibleColumnKeys(savedVisibleKeys);
        } else {
          const defaultKeys = empSchema
            .filter(
              (f) =>
                ["employeeId", "fullName", "department", "status"].includes(
                  f.key
                ) && !f.isHidden
            )
            .map((f) => f.key);
          setVisibleColumnKeys(
            defaultKeys.length > 0
              ? defaultKeys
              : empSchema.slice(0, 4).map((f) => f.key)
          );
        }

        setEmployeeData(emps);
        setNextEmployeeIdToUse(generateNextEmployeeId(emps));
        setError(null);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load system data. Please refresh: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (allProfileFields.length > 0 && visibleColumnKeys.length > 0) {
      api.saveVisibleEmployeeColumns(visibleColumnKeys);
    }
  }, [visibleColumnKeys, allProfileFields]);

  const handleColumnVisibilityChange = (key) => {
    setVisibleColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleOpenEmployeeModal = (record = null) => {
    setCurrentEmployeeRecord(record);
    if (!record) {
      setNextEmployeeIdToUse(generateNextEmployeeId(employeeData));
    }
    setIsEmployeeModalOpen(true);
  };
  const handleCloseEmployeeModal = () => {
    setIsEmployeeModalOpen(false);

    if (isMandatoryPayrollSetup) {
      // setIsMandatoryPayrollSetup(false);
    }
  };

  const handleSaveEmployee = async (recordDataToSave) => {
    setIsLoading(true);
    const isNewEmployee = !(
      currentEmployeeRecord && currentEmployeeRecord.internalId
    );
    try {
      let savedRecord;
      if (!isNewEmployee) {
        savedRecord = await api.updateEmployee(
          currentEmployeeRecord.internalId,
          recordDataToSave
        );
        setEmployeeData((prev) =>
          prev.map((emp) =>
            emp.internalId === savedRecord.internalId ? savedRecord : emp
          )
        );
      } else {
        const newEmployeeIdGenerated = generateNextEmployeeId(employeeData);
        const dataWithId = {
          ...recordDataToSave,
          employeeId: newEmployeeIdGenerated,
        };
        savedRecord = await api.addEmployee(dataWithId);
        setEmployeeData((prev) => [...prev, savedRecord]);
      }

      const currentEmployees = employeeData.map((emp) =>
        emp.internalId === savedRecord.internalId ? savedRecord : emp
      );
      if (
        isNewEmployee &&
        !currentEmployees.find((e) => e.internalId === savedRecord.internalId)
      ) {
        currentEmployees.push(savedRecord);
      }
      setNextEmployeeIdToUse(generateNextEmployeeId(currentEmployees));

      setError(null);
      handleCloseEmployeeModal();

      if (isNewEmployee && savedRecord) {
        setIsMandatoryPayrollSetup(true);
        await handleOpenPayrollModal(
          savedRecord.employeeId,
          savedRecord.fullName,
          null
        );
      }
    } catch (err) {
      console.error("Failed to save employee:", err);
      setError("Failed to save employee: " + err.message);
      setIsMandatoryPayrollSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (internalIdToDelete) => {
    const employeeToDelete = employeeData.find(
      (emp) => emp.internalId === internalIdToDelete
    );
    if (!employeeToDelete) return;

    if (
      employeeToDelete.status === "Active" ||
      employeeToDelete.status === "On Leave"
    ) {
      alert(
        `Cannot delete ${employeeToDelete.fullName} (${employeeToDelete.employeeId}). Status: ${employeeToDelete.status}. Change to 'Terminated' first.`
      );
      return;
    }
    if (
      window.confirm(
        `Delete ${employeeToDelete.fullName} (${employeeToDelete.employeeId})? This also deletes their payroll data.`
      )
    ) {
      setIsLoading(true);
      try {
        await api.deleteEmployee(internalIdToDelete);
        await api.deletePayrollByEmployeeId(employeeToDelete.employeeId);

        const updatedData = employeeData.filter(
          (emp) => emp.internalId !== internalIdToDelete
        );
        setEmployeeData(updatedData);
        setNextEmployeeIdToUse(generateNextEmployeeId(updatedData));
        setError(null);
      } catch (err) {
        console.error("Failed to delete employee:", err);
        setError("Failed to delete employee: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenPayrollModal = async (
    employeeId,
    employeeFullName,
    existingData = null
  ) => {
    setIsLoading(true);
    try {
      const payrollToEdit =
        existingData || (await api.fetchPayrollByEmployeeId(employeeId));

      setExistingPayrollDataForModal(payrollToEdit);
      setCurrentPayrollEmployeeId(employeeId);
      setCurrentPayrollEmployeeFullName(employeeFullName);

      setIsPayrollModalOpen(true);
    } catch (err) {
      setError("Failed to load payroll data: " + err.message);
      setIsMandatoryPayrollSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePayrollModal = () => {
    setIsPayrollModalOpen(false);
    setIsMandatoryPayrollSetup(false);
    setExistingPayrollDataForModal(null);
  };

  const handleSavePayroll = async (
    payrollDataToSave,
    isInitialSetupFlowFromModal
  ) => {
    setIsLoading(true);
    try {
      await api.addOrUpdatePayroll(payrollDataToSave);
      setError(null);

      if (isMandatoryPayrollSetup) {
        setIsMandatoryPayrollSetup(false);
      }
      handleClosePayrollModal();

      const message = isInitialSetupFlowFromModal
        ? "Initial payroll data saved successfully!"
        : "Payroll data updated successfully!";
      alert(message);
    } catch (err) {
      console.error("Failed to save payroll:", err);
      setError("Failed to save payroll: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployeeData = useMemo(() => {
    if (!searchTerm) return employeeData;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return employeeData.filter((item) =>
      allProfileFields.some((field) => {
        const value = item[field.key];
        return (
          value !== undefined &&
          value !== null &&
          String(value).toLowerCase().includes(lowerSearchTerm)
        );
      })
    );
  }, [employeeData, allProfileFields, searchTerm]);

  const columnsToDisplay = useMemo(() => {
    return allProfileFields.filter(
      (field) => visibleColumnKeys.includes(field.key) && !field.isHidden
    );
  }, [allProfileFields, visibleColumnKeys]);

  const activeEmployeeCount = useMemo(
    () => employeeData.filter((emp) => emp.status === "Active").length,
    [employeeData]
  );
  const onLeaveEmployeeCount = useMemo(
    () => employeeData.filter((emp) => emp.status === "On Leave").length,
    [employeeData]
  );
  const terminatedEmployeeCount = useMemo(
    () => employeeData.filter((emp) => emp.status === "Terminated").length,
    [employeeData]
  );

  const totalPages = Math.ceil(filteredEmployeeData.length / ROWS_PER_PAGE);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (currentPage < 1 && totalPages > 0) setCurrentPage(1);
    else if (totalPages === 0 && filteredEmployeeData.length === 0)
      setCurrentPage(1);
  }, [currentPage, totalPages, filteredEmployeeData.length]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredEmployeeData.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredEmployeeData, currentPage, ROWS_PER_PAGE]);

  if (isLoading && allProfileFields.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-100">
        Loading System...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
          Employee Profile Management
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

      <StatsDisplay
        totalCount={employeeData.length}
        activeCount={activeEmployeeCount}
        onLeaveCount={onLeaveEmployeeCount}
        terminatedCount={terminatedEmployeeCount}
      />

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto sm:flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsColumnTogglerModalOpen(true)}
              title="Show/Hide Columns"
              className="flex items-center px-3 py-2 sm:px-4 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600"
            >
              <Eye size={18} className="mr-0 sm:mr-2" />{" "}
              <span className="hidden sm:inline">Columns</span>
            </button>
            <button
              onClick={() => handleOpenEmployeeModal()}
              title="Add New Employee"
              className="flex items-center px-3 py-2 sm:px-4 text-sm font-medium text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600"
            >
              <Plus size={18} className="mr-0 sm:mr-2" />{" "}
              <span className="hidden sm:inline">Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading && allProfileFields.length > 0 && (
        <div className="text-center text-gray-500 py-4">Processing...</div>
      )}

      {!isLoading && (
        <>
          <DynamicTable
            columns={columnsToDisplay}
            data={paginatedData}
            onEdit={handleOpenEmployeeModal}
            onDelete={handleDeleteEmployee}
            // onManagePayroll={(empId, empName) =>
            //   handleOpenPayrollModal(empId, empName, null)
            // }
            idKey="internalId"
            moduleType="employee"
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {isEmployeeModalOpen && (
        <EmployeeRecordModal
          isOpen={isEmployeeModalOpen}
          onClose={handleCloseEmployeeModal}
          onSave={handleSaveEmployee}
          currentRecord={currentEmployeeRecord}
          allFields={allProfileFields}
          nextEmployeeId={nextEmployeeIdToUse}
        />
      )}

      {isPayrollModalOpen && payrollSchema.length > 0 && (
        <PayrollRecordModal
          isOpen={isPayrollModalOpen}
          onClose={handleClosePayrollModal}
          onSave={handleSavePayroll}
          employeeId={currentPayrollEmployeeId}
          employeeFullName={currentPayrollEmployeeFullName}
          existingPayrollData={existingPayrollDataForModal}
          payrollSchema={payrollSchema}
          isMandatoryInitialSetup={isMandatoryPayrollSetup}
        />
      )}

      {isColumnTogglerModalOpen && (
        <ColumnTogglerModal
          isOpen={isColumnTogglerModalOpen}
          onClose={() => setIsColumnTogglerModalOpen(false)}
          allColumns={allProfileFields.filter((f) => !f.isHidden)}
          visibleColumnKeys={visibleColumnKeys}
          onVisibilityChange={handleColumnVisibilityChange}
        />
      )}
    </div>
  );
};
export default HomePage;
