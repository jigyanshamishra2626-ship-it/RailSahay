import { useState } from "react";
import axios from "axios";
import {
  TrainFront,
  ArrowLeft,
  UserRound,
  Mail,
  Lock,
  Phone
} from "lucide-react";
import "./Auth.css";

function Auth({ onClose, onLogin, initialMode = "login" }) {
  const [isRegister, setIsRegister] = useState(
    initialMode === "register"
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            full_name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
          }
        );

        setSuccess(response.data.message);
        setIsRegister(false);

        setForm({
          name: "",
          email: form.email,
          phone: "",
          password: "",
        });

      } else {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email: form.email,
            password: form.password,
          }
        );

        localStorage.setItem(
          "railsahay_token",
          response.data.token
        );

        localStorage.setItem(
          "railsahay_passenger",
          JSON.stringify(response.data.passenger)
        );

        setSuccess(response.data.message);

        // Login successful - open Passenger Dashboard
        if (onLogin) {
          onLogin(response.data.passenger);
        } else if (onClose) {
          onClose();
        }
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="back-home" onClick={onClose}>
        <ArrowLeft size={18} /> Back to Home
      </button>

      <div className="auth-card">
        <div className="auth-logo">
          <TrainFront size={30} />
          <span>Rail<span>Sahay</span></span>
        </div>

        <h2>{isRegister ? "Create Your Account" : "Welcome Back!"}</h2>

        <p>
          {isRegister
            ? "Register to access passenger assistance services."
            : "Login to continue your railway journey."}
        </p>

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        {success && (
          <p style={{ color: "green" }}>{success}</p>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="auth-field">
              <label>Full Name</label>
              <div>
                <UserRound size={18} />
                <input
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <div>
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="auth-field">
              <label>Phone Number</label>
              <div>
                <Phone size={18} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Password</label>
            <div>
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "New to RailSahay?"}

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </div>

        <div className="auth-security">
          <Lock size={14} />
          Your passenger account will be securely managed.
        </div>
      </div>
    </div>
  );
}

export default Auth;