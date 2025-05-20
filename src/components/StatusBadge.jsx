const StatusBadge = ({ status }) => {
  let badgeClasses =
    "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize inline-block ";

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
    case "Processed":
      badgeClasses += "bg-green-100 text-green-600";
      break;
    case "Paid":
      badgeClasses += "bg-green-100 text-green-800";
      break;
    case "Pending":
      badgeClasses += "bg-amber-100 text-amber-600";
      break;
    case "On Hold":
      badgeClasses += "bg-orange-100 text-orange-600";
      break;
    case "Cancelled":
      badgeClasses += "bg-red-100 text-red-800";
      break;
    default:
      badgeClasses += "bg-gray-100 text-gray-800";
  }

  return <span className={badgeClasses}>{status || "N/A"}</span>;
};

export default StatusBadge;
