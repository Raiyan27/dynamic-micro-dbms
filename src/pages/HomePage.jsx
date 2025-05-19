import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  Users,
  UserCheck,
  UserX,
  UserMinus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  generateInternalId,
  generateNextEmployeeId,
} from "../utils/employeeUtils";

import ColumnTogglerModal from "../modals/ColumnTogglerModal";
import RecordModal from "../modals/RecordModal";

const api = {
  fetchEmployeeSchema: async () => {
    console.log("API: Fetching employee schema...");
    return Promise.resolve([
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
    ]);
  },
  fetchEmployees: async () => {
    console.log("API: Fetching employees...");
    const savedData = localStorage.getItem("simulatedEmployeeData_v5");
    return Promise.resolve(savedData ? JSON.parse(savedData) : []);
  },
  addEmployee: async (employeeData) => {
    console.log("API: Adding employee...", employeeData);
    const newEmployeeWithInternalId = {
      ...employeeData,
      id: generateInternalId(),
    };
    const employees = await api.fetchEmployees();
    const updatedEmployees = [...employees, newEmployeeWithInternalId];
    localStorage.setItem(
      "simulatedEmployeeData_v5",
      JSON.stringify(updatedEmployees)
    );
    return Promise.resolve(newEmployeeWithInternalId);
  },
  updateEmployee: async (internalId, employeeData) => {
    console.log(
      "API: Updating employee by internal ID...",
      internalId,
      employeeData
    );
    const employees = await api.fetchEmployees();
    const updatedEmployees = employees.map((emp) =>
      emp.id === internalId ? { ...emp, ...employeeData } : emp
    );
    localStorage.setItem(
      "simulatedEmployeeData_v5",
      JSON.stringify(updatedEmployees)
    );
    return Promise.resolve({ ...employeeData, id: internalId });
  },
  deleteEmployee: async (internalId) => {
    console.log("API: Deleting employee by internal ID...", internalId);
    const employees = await api.fetchEmployees();
    const updatedEmployees = employees.filter((emp) => emp.id !== internalId);
    localStorage.setItem(
      "simulatedEmployeeData_v5",
      JSON.stringify(updatedEmployees)
    );
    return Promise.resolve({ success: true });
  },
};

const StatsDisplay = ({
  totalCount,
  activeCount,
  onLeaveCount,
  terminatedCount,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="bg-indigo-50 p-4 rounded-lg shadow flex items-center justify-start space-x-3">
      <Users className="text-indigo-600 flex-shrink-0" size={32} />
      <div>
        <p className="text-2xl font-bold text-indigo-700">{totalCount}</p>
        <p className="text-xs text-indigo-500">Total Employees</p>
      </div>
    </div>
    <div className="bg-green-50 p-4 rounded-lg shadow flex items-center justify-start space-x-3">
      <UserCheck className="text-green-600 flex-shrink-0" size={32} />
      <div>
        <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        <p className="text-xs text-green-500">Active</p>
      </div>
    </div>
    <div className="bg-yellow-50 p-4 rounded-lg shadow flex items-center justify-start space-x-3">
      <UserMinus className="text-yellow-600 flex-shrink-0" size={32} />
      <div>
        <p className="text-2xl font-bold text-yellow-700">{onLeaveCount}</p>
        <p className="text-xs text-yellow-500">On Leave</p>
      </div>
    </div>
    <div className="bg-red-50 p-4 rounded-lg shadow flex items-center justify-start space-x-3">
      <UserX className="text-red-600 flex-shrink-0" size={32} />
      <div>
        <p className="text-2xl font-bold text-red-700">{terminatedCount}</p>
        <p className="text-xs text-red-500">Terminated</p>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let badgeClasses =
    "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ";
  switch (status) {
    case "Active":
      badgeClasses += "bg-green-100 text-green-800";
      break;
    case "On Leave":
      badgeClasses += "bg-yellow-100 text-yellow-800";
      break;
    case "Terminated":
      badgeClasses += "bg-red-100 text-red-800";
      break;
    default:
      badgeClasses += "bg-gray-100 text-gray-800";
  }
  return <span className={badgeClasses}>{status || "N/A"}</span>;
};

const DynamicTable = ({ columns, data, onEdit, onDelete, onViewPayroll }) => {
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
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
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
                colSpan={columns.length + 1}
                className="px-6 py-10 text-center text-gray-500"
              >
                No employees found.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {(() => {
                      const val = item[col.key];
                      if (col.key === "status") {
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
                      return val === undefined ||
                        val === null ||
                        String(val).trim() === ""
                        ? "N/A"
                        : String(val);
                    })()}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                  <button
                    onClick={() => onEdit(item)}
                    title="Edit Employee"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    title="Delete Employee"
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => onViewPayroll(item.employeeId)}
                    title="View Payroll (External)"
                    className="text-green-600 hover:text-green-900"
                  >
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="mt-6 flex items-center justify-between">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <ChevronLeft size={16} className="mr-1" /> Previous
      </button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        Next <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  );
};

const HomePage = () => {
  const [allProfileFields, setAllProfileFields] = useState([]);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
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
        const schema = await api.fetchEmployeeSchema();
        setAllProfileFields(schema);

        const savedVisibleKeys = localStorage.getItem(
          "visibleEmployeeColumns_v5"
        );
        if (savedVisibleKeys) {
          setVisibleColumnKeys(JSON.parse(savedVisibleKeys));
        } else {
          const defaultKeys = schema
            .filter((f) =>
              ["employeeId", "fullName", "department", "status"].includes(f.key)
            )
            .map((f) => f.key);
          setVisibleColumnKeys(
            defaultKeys.length > 0
              ? defaultKeys
              : schema.slice(0, Math.min(schema.length, 4)).map((f) => f.key)
          );
        }

        const data = await api.fetchEmployees();
        setEmployeeData(data);
        setNextEmployeeIdToUse(generateNextEmployeeId(data));
        setError(null);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load system data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (allProfileFields.length > 0 && visibleColumnKeys.length > 0) {
      localStorage.setItem(
        "visibleEmployeeColumns_v5",
        JSON.stringify(visibleColumnKeys)
      );
    }
  }, [visibleColumnKeys, allProfileFields]);

  const handleColumnVisibilityChange = (key) => {
    setVisibleColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleOpenRecordModal = (record = null) => {
    setCurrentRecord(record);
    if (!record) {
      setNextEmployeeIdToUse(generateNextEmployeeId(employeeData));
    }
    setIsRecordModalOpen(true);
  };

  const handleCloseRecordModal = () => {
    setIsRecordModalOpen(false);
    setCurrentRecord(null);
  };

  const handleSaveEmployee = async (recordDataToSave) => {
    setIsLoading(true);
    try {
      let savedRecord;
      let updatedEmployeeList;

      if (currentRecord && currentRecord.id) {
        savedRecord = await api.updateEmployee(
          currentRecord.id,
          recordDataToSave
        );
        updatedEmployeeList = employeeData.map((emp) =>
          emp.id === savedRecord.id ? savedRecord : emp
        );
      } else {
        savedRecord = await api.addEmployee(recordDataToSave);
        updatedEmployeeList = [...employeeData, savedRecord];
      }

      setEmployeeData(updatedEmployeeList);
      setNextEmployeeIdToUse(generateNextEmployeeId(updatedEmployeeList));
      setError(null);
      handleCloseRecordModal();
    } catch (err) {
      console.error("Failed to save employee:", err);
      setError("Failed to save employee. Check data and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (internalIdToDelete) => {
    const employeeToDelete = employeeData.find(
      (emp) => emp.id === internalIdToDelete
    );

    if (
      employeeToDelete &&
      (employeeToDelete.status === "Active" ||
        employeeToDelete.status === "On Leave")
    ) {
      alert(
        `Cannot delete employee ${employeeToDelete.fullName} (${employeeToDelete.employeeId}). They are currently ${employeeToDelete.status}. Please change their status to 'Terminated' first if you intend to remove them from the system.`
      );
      return;
    }

    let confirmMessage =
      "Are you sure you want to delete this employee? This action cannot be undone.";
    if (employeeToDelete) {
      confirmMessage = `Are you sure you want to delete employee ${employeeToDelete.fullName} (${employeeToDelete.employeeId})? This action cannot be undone.`;
    }

    if (window.confirm(confirmMessage)) {
      setIsLoading(true);
      try {
        await api.deleteEmployee(internalIdToDelete);
        const updatedData = employeeData.filter(
          (emp) => emp.id !== internalIdToDelete
        );
        setEmployeeData(updatedData);
        setNextEmployeeIdToUse(generateNextEmployeeId(updatedData));
        setError(null);
      } catch (err) {
        console.error("Failed to delete employee:", err);
        setError("Failed to delete employee. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleViewPayroll = (employeeSystemId) => {
    alert(
      `Navigate to Payroll for Employee ID: ${employeeSystemId} (Not implemented).`
    );
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
    return allProfileFields.filter((field) =>
      visibleColumnKeys.includes(field.key)
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
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (
      currentPage === 0 &&
      totalPages === 0 &&
      filteredEmployeeData.length === 0
    ) {
      setCurrentPage(1);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    } else if (
      currentPage > totalPages &&
      totalPages === 0 &&
      filteredEmployeeData.length === 0
    ) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, filteredEmployeeData.length]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return filteredEmployeeData.slice(startIndex, endIndex);
  }, [filteredEmployeeData, currentPage, ROWS_PER_PAGE]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading && allProfileFields.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-100">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading System...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
          Employee Profile Management
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Manage employee details efficiently.
        </p>
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
          <div className="w-full sm:w-auto sm:flex-grow">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsColumnTogglerModalOpen(true)}
              title="Show/Hide Columns"
              className="flex items-center px-3 py-2 sm:px-4 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            >
              <Eye size={18} className="mr-0 sm:mr-2" />{" "}
              <span className="hidden sm:inline">Columns</span>
            </button>
            <button
              onClick={() => handleOpenRecordModal()}
              title="Add New Employee"
              className="flex items-center px-3 py-2 sm:px-4 text-sm font-medium text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
            >
              <Plus size={18} className="mr-0 sm:mr-2" />{" "}
              <span className="hidden sm:inline">Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading && allProfileFields.length > 0 && (
        <div className="text-center text-gray-500 py-4">
          <svg
            className="animate-spin h-6 w-6 text-indigo-600 mx-auto mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      )}

      {!isLoading && !error && (
        <>
          <DynamicTable
            columns={columnsToDisplay}
            data={paginatedData}
            onEdit={handleOpenRecordModal}
            onDelete={handleDeleteEmployee}
            onViewPayroll={handleViewPayroll}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={handleCloseRecordModal}
        onSave={handleSaveEmployee}
        currentRecord={currentRecord}
        allFields={allProfileFields}
        nextEmployeeId={nextEmployeeIdToUse}
      />
      <ColumnTogglerModal
        isOpen={isColumnTogglerModalOpen}
        onClose={() => setIsColumnTogglerModalOpen(false)}
        allColumns={allProfileFields}
        visibleColumnKeys={visibleColumnKeys}
        onVisibilityChange={handleColumnVisibilityChange}
      />

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} HR Management System.</p>
      </footer>
    </div>
  );
};

export default HomePage;
