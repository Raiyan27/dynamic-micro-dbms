import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const PayrollCharts = ({ payrollData, payrollSchema }) => {
  if (!payrollData)
    return (
      <p className="text-center text-gray-500">No data to display charts.</p>
    );

  const earningsLabels = [];
  const earningsValues = [];
  const earningsColors = [
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
  ];

  if (payrollData.basicSalary > 0) {
    earningsLabels.push(
      payrollSchema.find((f) => f.key === "basicSalary")?.label || "Basic"
    );
    earningsValues.push(payrollData.basicSalary);
  }
  if (payrollData.houseRentAmount > 0) {
    earningsLabels.push(
      payrollSchema.find((f) => f.key === "houseRentAmount")?.label || "HRA"
    );
    earningsValues.push(payrollData.houseRentAmount);
  }
  if (payrollData.medicalAmount > 0) {
    earningsLabels.push(
      payrollSchema.find((f) => f.key === "medicalAmount")?.label || "Medical"
    );
    earningsValues.push(payrollData.medicalAmount);
  }
  if (payrollData.conveyanceAllowanceFixed > 0) {
    earningsLabels.push(
      payrollSchema.find((f) => f.key === "conveyanceAllowanceFixed")?.label ||
        "Conveyance"
    );
    earningsValues.push(payrollData.conveyanceAllowanceFixed);
  }
  if (payrollData.telephoneAllowanceFixed > 0) {
    earningsLabels.push(
      payrollSchema.find((f) => f.key === "telephoneAllowanceFixed")?.label ||
        "Telephone"
    );
    earningsValues.push(payrollData.telephoneAllowanceFixed);
  }
  if (payrollData.specialAllowanceFixed > 0) {
    earningsLabels.push(
      payrollSchema.find((f) => f.key === "specialAllowanceFixed")?.label ||
        "Special"
    );
    earningsValues.push(payrollData.specialAllowanceFixed);
  }
  if (payrollData.otherAllowancesFixed > 0) {
    earningsLabels.push(
      payrollSchema.find((f) => f.key === "otherAllowancesFixed")?.label ||
        "Others"
    );
    earningsValues.push(payrollData.otherAllowancesFixed);
  }

  const earningsPieData = {
    labels: earningsLabels,
    datasets: [
      {
        label: "Earnings Breakdown",
        data: earningsValues,
        backgroundColor: earningsColors.slice(0, earningsValues.length),
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const deductionsLabels = [];
  const deductionsValues = [];
  const deductionsColors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7"];

  if (payrollData.incomeTaxAmount > 0) {
    deductionsLabels.push(
      payrollSchema.find((f) => f.key === "incomeTaxAmount")?.label ||
        "Income Tax"
    );
    deductionsValues.push(payrollData.incomeTaxAmount);
  }
  if (payrollData.otherDeductionsFixed > 0) {
    deductionsLabels.push(
      payrollSchema.find((f) => f.key === "otherDeductionsFixed")?.label ||
        "Other Deduct."
    );
    deductionsValues.push(payrollData.otherDeductionsFixed);
  }
  const deductionsPieData = {
    labels: deductionsLabels,
    datasets: [
      {
        label: "Deductions Breakdown",
        data: deductionsValues,
        backgroundColor: deductionsColors.slice(0, deductionsValues.length),
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const salaryBarData = {
    labels: ["Salary Components"],
    datasets: [
      {
        label: "Gross Salary",
        data: [payrollData.grossSalary || 0],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Total Deductions",
        data: [payrollData.totalDeductions || 0],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Net Salary",
        data: [payrollData.netSalary || 0],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed);
            }
            return label;
          },
        },
      },
    },
  };
  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Salary Summary (Gross, Deductions, Net)",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.x !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.x);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount (USD)",
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      {earningsValues.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-center mb-3 text-gray-700">
            Earnings Breakdown
          </h4>
          <div style={{ height: "300px", width: "100%" }}>
            <Pie
              data={earningsPieData}
              options={{
                ...pieOptions,
                plugins: {
                  ...pieOptions.plugins,
                  title: {
                    ...pieOptions.plugins.title,
                    text: "Earnings Breakdown",
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
          No significant earnings components to display.
        </div>
      )}

      {deductionsValues.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-center mb-3 text-gray-700">
            Deductions Breakdown
          </h4>
          <div style={{ height: "300px", width: "100%" }}>
            <Pie
              data={deductionsPieData}
              options={{
                ...pieOptions,
                plugins: {
                  ...pieOptions.plugins,
                  title: {
                    ...pieOptions.plugins.title,
                    text: "Deductions Breakdown",
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
          No significant deductions to display.
        </div>
      )}

      {(payrollData.grossSalary > 0 ||
        payrollData.totalDeductions > 0 ||
        payrollData.netSalary > 0) && (
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow mt-4">
          <h4 className="text-lg font-semibold text-center mb-3 text-gray-700">
            Salary Summary
          </h4>
          <div style={{ height: "250px", width: "100%" }}>
            {" "}
            <Bar data={salaryBarData} options={barOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollCharts;
