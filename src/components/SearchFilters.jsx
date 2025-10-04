// src/components/SearchFilters.jsx
import { FiSearch } from "react-icons/fi";

const SearchFilters = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, policy ID, or vehicle..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition shadow-sm hover:shadow-md"
          />
        </div>

        {/* Status Filter */}
        <select className="w-full md:w-48 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition shadow-sm hover:shadow-md">
          <option>All Status</option>
          <option>Active</option>
          <option>Expired</option>
        </select>

        {/* Type Filter */}
        <select className="w-full md:w-48 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition shadow-sm hover:shadow-md">
          <option>All Types</option>
          <option>Third Party</option>
          <option>Comprehensive</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilters;
