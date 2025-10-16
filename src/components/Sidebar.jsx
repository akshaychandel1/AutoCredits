// src/components/Sidebar.jsx
import { NavLink, useLocation } from "react-router-dom";
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
  FiChevronRight
} from "react-icons/fi";
import { useState, useEffect } from "react";
import logo from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const [activeHover, setActiveHover] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <FiHome className="text-lg" />, badge: null },
    { name: "Policies", path: "/policies", icon: <FiFileText className="text-lg" /> },
    { name: "Customers", path: "/customers", icon: <FiUsers className="text-lg" />},
    { name: "Quotations", path: "/quotations", icon: <FiFile className="text-lg" />},
    { name: "Payments", path: "/payments", icon: <FiDollarSign className="text-lg" />},
    { name: "Renewals", path: "/renewals", icon: <FiRefreshCw className="text-lg" />},
    { name: "Documents", path: "/documents", icon: <FiFolder className="text-lg" />},
  ];

  // Get user data from localStorage or your auth context
  const getUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    return {
      id: "USER_" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: "Alex Johnson",
      role: "Senior Agent",
      email: "alex.johnson@autocredit.com"
    };
  };

  const user = getUserData();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative group ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-600 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 hover:scale-110"
      >
        <FiChevronRight className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Logo/Header */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Auto Credit" 
            className={`transition-all duration-300 ${
              isCollapsed ? 'w-16 h-10' : 'w-62 h-52'
            }`}
          />
          <div className={`transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          }`}>
            {/* <h1 className="text-gray-800 font-bold text-lg">AUTO CREDIT</h1>
            <p className="text-gray-500 text-xs">Insurance Portal</p> */}
          </div>
        </div>
      </div>

      {/* Menu - Scrollable area */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onMouseEnter={() => setActiveHover(item.name)}
            onMouseLeave={() => setActiveHover(null)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
              }`
            }
          >
            {/* Icon */}
            <span className={`transition-transform duration-200 ${
              location.pathname === item.path 
                ? 'text-white' 
                : 'text-gray-500 group-hover:text-purple-600'
            }`}>
              {item.icon}
            </span>
            
            {/* Menu Text */}
            <span className={`transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              {item.name}
            </span>
            
            {/* Badge */}
            {item.badge && !isCollapsed && (
              <span className={`ml-auto px-2 py-1 text-xs font-bold rounded-full ${
                location.pathname === item.path
                  ? 'bg-white text-purple-600'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {item.badge}
              </span>
            )}
            
            {/* Collapsed Badge */}
            {item.badge && isCollapsed && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 border-t border-gray-200 bg-gray-50">
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <FiUser className="text-white text-sm" />
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
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
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 w-full rounded-lg transition-all duration-200 group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <FiLogOut className="text-lg group-hover:scale-110 transition-transform duration-200" />
            <span className={`transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Collapsed Tooltip System */}
      {isCollapsed && (
        <div className="absolute left-full top-0 h-full pointer-events-none z-10">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className="absolute left-2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-700 shadow-xl"
              style={{ top: `calc(80px + ${menuItems.indexOf(item) * 52}px)` }}
            >
              {item.name}
              {item.badge && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;