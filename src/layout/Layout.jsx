// src/layout/Layout.jsx
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import PoliciesPage from "../pages/PoliciesPage/PoliciesPage";
import NewPolicyPage from "../pages/PoliciesPage/NewPolicyPage";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/new-policy" element={<NewPolicyPage />} />
            <Route path="/new-policy/:id" element={<NewPolicyPage />} />
            {/* Add other routes later */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Layout;