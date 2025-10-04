// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./pages/Auth/Login";
import PoliciesPage from "./pages/PoliciesPage/PoliciesPage";
import NewPolicyPage from "./pages/PoliciesPage/NewPolicyPage";

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  return children; // Token exists, render children
};

// PublicRoute component (for login page)
const PublicRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    // Already logged in, redirect to dashboard
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login page - only for unauthenticated users */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Layout pages - protected */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<h1>Dashboard Home</h1>} /> {/* default / */}
          <Route path="policies" element={<PoliciesPage />} />
          <Route path="policies/new" element={<NewPolicyPage />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} /> {/* fallback */}
        </Route>
      </Routes>
    </Router>
  );
}
