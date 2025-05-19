import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

      if (currentPage - halfPagesToShow <= 2) {
        endPage = Math.min(totalPages - 1, 1 + maxPagesToShow - 1);
      }
      if (currentPage + halfPagesToShow >= totalPages - 1) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 1);
      }

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <div className="mt-6 flex items-center justify-between">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <ChevronLeft size={16} className="mr-1" /> Previous
      </button>

      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-sm text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium border rounded-md shadow-sm
                ${
                  currentPage === page
                    ? "bg-indigo-600 text-white border-indigo-600 z-10"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        Next <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  );
};

export default PaginationControls;
