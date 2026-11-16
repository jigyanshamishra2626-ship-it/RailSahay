import { useState } from "react";
import axios from "axios";
import { ShieldCheck, Lock, Mail, ArrowLeft } from "lucide-react";
import "./AdminLogin.css";

function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/login",
        { email, password }
      );

      localStorage.setItem("railsahay_admin_token", response.data.token);
      localStorage.setItem(
        "railsahay_admin",
        JSON.stringify(response.data.admin)
      );

      onLogin(response.data.admin);

    } catch (error) {
      setError(
        error.response?.data?.message || "Admin login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <button className="admin-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="admin-login-icon">
          <ShieldCheck size={38} />
        </div>

        <h2>Railway Admin Login</h2>
        <p>Authorized administration access only</p>

        <form onSubmit={handleLogin}>
          <label>Admin Email</label>
          <div className="admin-input-group">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Admin Password</label>
          <div className="admin-input-group">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="admin-error">{error}</div>}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Secure Admin Login"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default AdminLogin;