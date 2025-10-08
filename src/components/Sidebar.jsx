// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiFile,
  FiDollarSign,
  FiRefreshCw,
  FiFolder,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: <FiHome className="text-lg" /> },
    { name: "Policies", path: "/policies", icon: <FiFileText className="text-lg" /> },
    { name: "Customers", path: "/customers", icon: <FiUsers className="text-lg" /> },
    { name: "Quotations", path: "/quotations", icon: <FiFile className="text-lg" /> },
    { name: "Payments", path: "/payments", icon: <FiDollarSign className="text-lg" /> },
    { name: "Renewals", path: "/renewals", icon: <FiRefreshCw className="text-lg" /> },
    { name: "Documents", path: "/documents", icon: <FiFolder className="text-lg" /> },
  ];

  // Get user data from localStorage or your auth context
  const getUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    return {
      id: "USER_" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: "User",
      role: "Admin"
    };
  };

  const user = getUserData();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">AC</span>
          </div>
          <div>
            <h1 className="text-gray-800 font-bold text-xl">AUTO CREDIT</h1>
            <p className="text-gray-500 text-xs">Insurance Portal</p>
          </div>
        </div>
      </div>

      {/* Menu - Scrollable area */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-small rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/25"
                  : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
              }`
            }
          >
            <span className={`transition-transform duration-200 group-hover:scale-110 ${
              ({ isActive }) => isActive ? "text-white" : "text-gray-500 group-hover:text-purple-700"
            }`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Fixed Bottom Section - Always stays at bottom */}
      <div className="shrink-0 border-t border-gray-200 bg-gray-50">
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <FiUser className="text-white text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-semibold text-sm truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.id}</p>
              <p className="text-purple-600 text-xs font-medium bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-1">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 w-full rounded-xl transition-all duration-200 group border border-transparent hover:border-red-200"
          >
            <FiLogOut className="text-lg group-hover:scale-110 transition-transform duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;