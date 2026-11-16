import {
  TrainFront,
  ShieldAlert,
  HeartPulse,
  PackageSearch,
  MessageSquare,
  UserRound,
  LogOut
} from "lucide-react";

import "./PassengerDashboard.css";
import { useState } from "react";
import Emergency from "./Emergency";
import LostFound from "./LostFound";
import Complaint from "./Complaint";
import TrainSearch from "./TrainSearch";
function PassengerDashboard({ passenger, onLogout }) {
  const [showEmergency, setShowEmergency] = useState(false);
  const [showLostFound, setShowLostFound] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
const [showComplaint, setShowComplaint] = useState(false);
const [showTrainSearch, setShowTrainSearch] = useState(false);
  const services = [
    {
      icon: <TrainFront size={30} />,
      title: "Search Trains",
      desc: "Find train information and journey details.",
      color: "blue"
    },
    {
      icon: <HeartPulse size={30} />,
      title: "Medical Assistance",
      desc: "Request medical help during your journey.",
      color: "green"
    },
    {
      icon: <ShieldAlert size={30} />,
      title: "Emergency SOS",
      desc: "Request urgent security assistance.",
      color: "red"
    },
    {
      icon: <PackageSearch size={30} />,
      title: "Lost & Found",
      desc: "Report lost or found belongings.",
      color: "orange"
    },
    {
      icon: <MessageSquare size={30} />,
      title: "My Complaints",
      desc: "Submit and track railway complaints.",
      color: "purple"
    },
    {
      icon: <UserRound size={30} />,
      title: "My Profile",
      desc: "View your passenger account details.",
      color: "blue"
    }
  ];

  // MY PROFILE PAGE
  if (showProfile) {
    return (
      <div className="passenger-dashboard">
        <header className="dashboard-navbar">
          <div className="dashboard-brand">
            <TrainFront size={28} />
            <span>Rail<span>Sahay</span></span>
          </div>

          <button
            className="dashboard-logout"
            onClick={() => setShowProfile(false)}
          >
            <LogOut size={18} /> Back to Dashboard
          </button>
        </header>

        <main className="dashboard-main">
          <section className="dashboard-welcome">
            <span>PASSENGER PROFILE</span>
            <h1>My Profile 👤</h1>
            <p>Your registered passenger account details.</p>
          </section>

          <section className="dashboard-profile">
            <UserRound size={35} />
            <div>
              <strong>{passenger?.full_name || "Passenger"}</strong>
              <p>{passenger?.email || "Email not available"}</p>
            </div>
          </section>
        </main>

        <footer className="dashboard-footer">
          © 2026 RailSahay. Passenger Assistance Platform.
        </footer>
      </div>
    );
  }

  // EMERGENCY PAGE
  if (showEmergency) {
    return (
      <Emergency
        onBack={() => setShowEmergency(false)}
        passenger={passenger}
      />
    );
  }

  // LOST AND FOUND PAGE
  if (showLostFound) {
    return (
      <LostFound
        onBack={() => setShowLostFound(false)}
      />
    );
  }
// MY COMPLAINTS PAGE
if (showComplaint) {
  return (
    <Complaint
      onBack={() => setShowComplaint(false)}
    />
  );
}
if (showTrainSearch) {
  return (
    <TrainSearch
      onBack={() => setShowTrainSearch(false)}
    />
  );
}
  return (
    <div className="passenger-dashboard">
      <header className="dashboard-navbar">
        <div className="dashboard-brand">
          <TrainFront size={28} />
          <span>Rail<span>Sahay</span></span>
        </div>

        <button className="dashboard-logout" onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <span>PASSENGER PORTAL</span>
          <h1>
            Welcome, {passenger?.full_name || "Passenger"}! 👋
          </h1>
          <p>
            Your journey, our priority. How can we help you today?
          </p>
        </section>

        <section className="dashboard-profile">
          <UserRound size={25} />
          <div>
            <strong>{passenger?.full_name}</strong>
            <p>{passenger?.email}</p>
          </div>
        </section>

        <section className="dashboard-services">
          <div className="dashboard-heading">
            <h2>Passenger Services</h2>
            <p>Choose a service for your journey.</p>
          </div>

          <div className="dashboard-grid">
            {services.map((service, index) => (
              <article className="dashboard-card" key={index}>
                <div className={`dashboard-service-icon ${service.color}`}>
                  {service.icon}
                </div>

                <h3>{service.title}</h3>
                <p>{service.desc}</p>

                <button
                  onClick={() => {
                    if (
                      service.title === "Emergency SOS" ||
                      service.title === "Medical Assistance"
                    ) {
                      setShowEmergency(true);
                    } else if (service.title === "Lost & Found") {
                      setShowLostFound(true);
                  } else if (service.title === "My Complaints") {
  setShowComplaint(true);
} else if (service.title === "My Profile") {
  setShowProfile(true);
} else if (service.title === "Search Trains") {
  setShowTrainSearch(true);
} else {
  alert(
    `${service.title} module will be developed next.`
  );
}
                  }}
                >
                  Open Service →
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        © 2026 RailSahay. Passenger Assistance Platform.
      </footer>
    </div>
  );
}

export default PassengerDashboard;