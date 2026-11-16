import { useState } from "react";
import {
  TrainFront,
  Search,
  ShieldAlert,
  HeartPulse,
  PackageSearch,
  UserRound,
  Menu,
  MapPin,
  Clock,
  ArrowRight,
  Headphones,
} from "lucide-react";
import "./App.css";
import Auth from "./Auth";
import PassengerDashboard from "./PassengerDashboard";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import StaffLogin from "./StaffLogin";
import StaffDashboard from "./StaffDashboard";
import Emergency from "./Emergency";
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trainNumber, setTrainNumber] = useState("");
const [authMode, setAuthMode] = useState(null);
const [currentPage, setCurrentPage] = useState("home");
const [loggedInPassenger, setLoggedInPassenger] = useState(null);
const [loggedInAdmin, setLoggedInAdmin] = useState(null);
const [loggedInStaff, setLoggedInStaff] = useState(null);
const [showStaffLogin, setShowStaffLogin] = useState(false);
const [showAdminLogin, setShowAdminLogin] = useState(false);
  const services = [
    {
      icon: <HeartPulse size={28} />,
      title: "Medical Assistance",
      desc: "Request medical help during your journey.",
      color: "blue",
    },
    {
      icon: <ShieldAlert size={28} />,
      title: "Security Assistance",
      desc: "Report safety concerns and request help.",
      color: "red",
    },
    {
      icon: <PackageSearch size={28} />,
      title: "Lost & Found",
      desc: "Report or search for lost belongings.",
      color: "orange",
    },
    {
      icon: <Headphones size={28} />,
      title: "Passenger Support",
      desc: "Get assistance with your railway journey.",
      color: "green",
    },
  ];
  // STAFF LOGIN SCREEN
if (showStaffLogin) {
  return (
    <StaffLogin
      onBack={() => setShowStaffLogin(false)}
      onLoginSuccess={(staff) => {
        setLoggedInStaff(staff);
        setShowStaffLogin(false);
        setCurrentPage("staff");
      }}
    />
  );
}
  // ADMIN LOGIN SCREEN
if (showAdminLogin) {
  return (
    <AdminLogin
      onBack={() => setShowAdminLogin(false)}
      onLogin={(admin) => {
        setLoggedInAdmin(admin);
        setShowAdminLogin(false);
        setCurrentPage("admin");
      }}
    />
  );
}

// ADMIN DASHBOARD
if (currentPage === "admin") {
  return (
    <AdminDashboard
      admin={loggedInAdmin}
      onLogout={() => {
        localStorage.removeItem("railsahay_admin_token");
        localStorage.removeItem("railsahay_admin");

        setLoggedInAdmin(null);
        setCurrentPage("home");
      }}
    />
  );
}
// LOGIN / REGISTER SCREEN
if (authMode) {
  return (
    <Auth
      onClose={() => setAuthMode(null)}
      initialMode={authMode}
      onLogin={(passenger) => {
        setLoggedInPassenger(passenger);
        setAuthMode(null);
        setCurrentPage("dashboard");
      }}
    />
  );
}
// STAFF DASHBOARD
if (currentPage === "staff") {
  return (
    <StaffDashboard
      staff={loggedInStaff}
      onLogout={() => {
        localStorage.removeItem("railsahay_staff_token");
        localStorage.removeItem("railsahay_staff");

        setLoggedInStaff(null);
        setCurrentPage("home");
      }}
    />
  );
}
// EMERGENCY PAGE
if (currentPage === "emergency") {
  return (
    <Emergency
      onBack={() => setCurrentPage("dashboard")}
    />
  );
}
// PASSENGER DASHBOARD
if (currentPage === "dashboard") {
  return (
    <PassengerDashboard
      passenger={loggedInPassenger}
      onLogout={() => {
        localStorage.removeItem("railsahay_token");
        localStorage.removeItem("railsahay_passenger");

        setLoggedInPassenger(null);
        setCurrentPage("home");
      }}
    />
  );
}
  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon"><TrainFront size={27} /></span>
          <span>Rail<span className="brand-highlight">Sahay</span></span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu />
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#train-search">Train Search</a>
          <a href="#about">About</a>
          <a href="#support">Contact</a>
        </nav>

        <div className="nav-actions">
         <button
  className="login-btn"
  onClick={() => setAuthMode("login")}
>
  Login
</button>
         <button
  className="register-btn"
  onClick={() => setAuthMode("register")}
>
  Register
</button>
        </div>
        <button
  className="login-btn"
  onClick={() => setShowAdminLogin(true)}
>
  Admin
</button>
<button
  className="login-btn"
  onClick={() => setShowStaffLogin(true)}
>
  Staff
</button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">YOUR JOURNEY, OUR PRIORITY</span>
            <h1>
              Every Railway Journey
              <span> Deserves Care.</span>
            </h1>
            <p>
              One platform for railway passenger assistance.
              Get journey information, emergency support and
              helpful services — all in one place.
            </p>

            <div className="hero-buttons">
              <a href="#services" className="primary-btn">
                Explore Services <ArrowRight size={18} />
              </a>
              <a href="#train-search" className="secondary-btn">
                Search Train
              </a>
            </div>

            <div className="hero-note">
              <ShieldAlert size={17} />
              Passenger safety and assistance matter.
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="visual-top">
                <span className="live-dot"></span>
                Passenger Assistance
                <span className="visual-status">Available</span>
              </div>
              <div className="train-illustration">
                <TrainFront size={110} strokeWidth={1.1} />
              </div>
              <div className="visual-bottom">
                <div>
                  <span className="visual-label">YOUR JOURNEY</span>
                  <strong>Safe & Supported</strong>
                </div>
                <ShieldAlert size={30} />
              </div>
            </div>
            <div className="floating-tag tag-one">
              <HeartPulse size={20} /> Medical Help
            </div>
            <div className="floating-tag tag-two">
              <PackageSearch size={20} /> Lost & Found
            </div>
          </div>
        </section>

        <section className="search-section" id="train-search">
          <div className="search-heading">
            <div>
              <span className="section-kicker">PLAN YOUR JOURNEY</span>
              <h2>Find Your Train</h2>
            </div>
            <TrainFront size={35} />
          </div>

          <div className="train-search-box">
            <div className="search-field">
              <label>TRAIN NUMBER / NAME</label>
              <div className="field-input">
                <TrainFront size={19} />
                <input
                  type="text"
                  placeholder="Enter train number or name"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                />
              </div>
            </div>
            <button
              className="search-btn"
              onClick={() =>
                alert(
                  trainNumber.trim()
                    ? "Train search will be connected to verified railway data in a later step."
                    : "Please enter a train number or name."
                )
              }
            >
              <Search size={19} /> Search Train
            </button>
          </div>
          <p className="search-disclaimer">
            Train information will be connected to a verified data source.
          </p>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <span className="section-kicker">HOW CAN WE HELP YOU?</span>
            <h2>Passenger Assistance Services</h2>
            <p>Useful support for a safer and more comfortable journey.</p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article className="service-card" key={index}>
                <div className={`service-icon ${service.color}`}>
                  {service.icon}
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <a href="#support">
                  Get Assistance <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="emergency-section">
          <div className="emergency-icon">
            <ShieldAlert size={34} />
          </div>
          <div>
            <span>NEED URGENT HELP?</span>
            <h2>Emergency Assistance</h2>
            <p>
              Access the emergency assistance section to submit a request
              for medical or security support.
            </p>
          </div>
          <button onClick={() => alert("Emergency request module will be developed next.")}>
            Request Help <ArrowRight size={18} />
          </button>
        </section>

        <section className="info-strip" id="about">
          <div>
            <MapPin size={25} />
            <strong>Journey Support</strong>
            <span>Helpful travel assistance</span>
          </div>
          <div>
            <Clock size={25} />
            <strong>Easy Access</strong>
            <span>Simple passenger experience</span>
          </div>
          <div>
            <UserRound size={25} />
            <strong>Passenger First</strong>
            <span>Designed for everyone</span>
          </div>
        </section>
      </main>

      <footer id="support">
        <a className="brand footer-brand" href="#home">
          <TrainFront size={25} />
          <span>Rail<span className="brand-highlight">Sahay</span></span>
        </a>
        <p>Making railway journeys more helpful, safer and easier.</p>
        <span className="copyright">
          © 2026 RailSahay. Passenger Assistance Platform.
        </span>
      </footer>
    </div>
  );
}

export default App;