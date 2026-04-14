import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav style={{
      padding: "15px",
      background: "#b30000",
      color: "white",
      display: "flex",
      gap: "20px"
    }}>
      <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>
      <Link to="/donor" style={{ color: "white" }}>Become Donor</Link>
      <Link to="/request" style={{ color: "white" }}>Request Blood</Link>

      {role === "admin" && (
        <Link to="/admin" style={{ color: "white" }}>Admin</Link>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginLeft: "auto",
          background: "white",
          color: "#b30000",
          border: "none",
          padding: "5px 10px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;