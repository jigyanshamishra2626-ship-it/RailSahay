import { useState } from "react";
import "./Staff.css";
import axios from "axios";
import {
  TrainFront,
  LockKeyhole,
  Mail,
  ArrowLeft
} from "lucide-react";

function StaffLogin({ onBack, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/staff/login",
        { email, password }
      );

      localStorage.setItem(
        "railsahay_staff_token",
        response.data.token
      );

      localStorage.setItem(
        "railsahay_staff",
        JSON.stringify(response.data.staff)
      );

      onLoginSuccess(response.data.staff);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login-page">
      <button className="staff-back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="staff-login-card">
        <div className="staff-login-icon">
          <TrainFront size={38} />
        </div>

        <h2>Railway Staff Login</h2>
        <p>Sign in to manage assigned passenger requests.</p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <div className="staff-input-box">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Enter staff email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="staff-input-box">
            <LockKeyhole size={18} />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="staff-login-error">{error}</p>
          )}

          <button
            type="submit"
            className="staff-login-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StaffLogin;