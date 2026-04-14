import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== "admin") return <Navigate to="/dashboard" />;

  return children;
}

export default ProtectedRoute;
