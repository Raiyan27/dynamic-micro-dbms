import { Users, UserCheck, UserX, UserMinus } from "lucide-react";

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

export default StatsDisplay;
