import { useEffect, useState } from "react";
import "./Staff.css";
import axios from "axios";
import {
  TrainFront,
  RefreshCw,
  LogOut,
  MapPin,
  Phone,
  Mail,
  UserRound,
  Image,
  Headphones
} from "lucide-react";

function StaffDashboard({ staff, onLogout }) {
  const [emergencies, setEmergencies] = useState([]);
  const [mediaUrls, setMediaUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("railsahay_staff_token");

  const loadEmergencyMedia = async (filename) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/staff/emergency-media/${encodeURIComponent(filename)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }
      );

      return URL.createObjectURL(response.data);
    } catch (err) {
      console.error("Media loading failed:", err);
      return null;
    }
  };

  const fetchEmergencies = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        "http://localhost:5000/api/staff/my-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const requests = response.data.emergencies || [];
      setEmergencies(requests);

      const mediaData = {};

      for (const item of requests) {
        mediaData[item.id] = {
          image: item.image_path
            ? await loadEmergencyMedia(item.image_path)
            : null,
          audio: item.audio_path
            ? await loadEmergencyMedia(item.audio_path)
            : null
        };
      }

      setMediaUrls((previous) => {
        Object.values(previous).forEach((media) => {
          if (media.image) URL.revokeObjectURL(media.image);
          if (media.audio) URL.revokeObjectURL(media.audio);
        });

        return mediaData;
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load assigned requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();

    return () => {
      Object.values(mediaUrls).forEach((media) => {
        if (media.image) URL.revokeObjectURL(media.image);
        if (media.audio) URL.revokeObjectURL(media.audio);
      });
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/staff/emergency-requests/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Emergency status updated successfully!");
      fetchEmergencies();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update status."
      );
    }
  };

  const handleLogout = () => {
    Object.values(mediaUrls).forEach((media) => {
      if (media.image) URL.revokeObjectURL(media.image);
      if (media.audio) URL.revokeObjectURL(media.audio);
    });

    localStorage.removeItem("railsahay_staff_token");
    localStorage.removeItem("railsahay_staff");

    onLogout();
  };

  return (
    <div className="staff-dashboard">

      <header className="staff-dashboard-header">
        <div className="staff-dashboard-brand">
          <TrainFront size={30} />
          <div>
            <h2>RailSahay Staff</h2>
            <p>Railway Assistance Dashboard</p>
          </div>
        </div>

        <button onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="staff-dashboard-content">

        <section className="staff-welcome">
          <h2>Welcome, {staff?.full_name || "Railway Staff"}</h2>
          <p>
            {staff?.designation || "Railway Assistant"} |
            {" "}{staff?.station_name || "Station"}
          </p>
        </section>

        <section className="staff-request-heading">
          <div>
            <h2>Assigned Emergency Requests</h2>
            <p>
              Total assigned requests: {emergencies.length}
            </p>
          </div>

          <button onClick={fetchEmergencies}>
            <RefreshCw size={17} /> Refresh
          </button>
        </section>

        {loading && <p>Loading emergency requests...</p>}

        {error && (
          <p className="staff-dashboard-error">{error}</p>
        )}

        {!loading && !error && emergencies.length === 0 && (
          <div className="staff-empty">
            <TrainFront size={40} />
            <h3>No Assigned Requests</h3>
            <p>New requests assigned by Admin will appear here.</p>
          </div>
        )}

        <div className="staff-emergency-list">

          {emergencies.map((item) => (
            <div className="staff-emergency-card" key={item.id}>

              <div className="staff-emergency-top">
                <h3>Emergency #{item.id}</h3>

                <span className={`status-${item.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                  {item.status}
                </span>
              </div>

              <p>
                <strong>Type:</strong> {item.emergency_type}
              </p>

              <p>
                <strong>Description:</strong> {item.description}
              </p>

              <p>
                <MapPin size={16} /> {item.location || "Location not provided"}
              </p>

              <p>
                <strong>Train:</strong> {item.train_number || "-"}
              </p>

              <p>
                <strong>Coach:</strong> {item.coach_number || "-"}
              </p>

              <p>
                <strong>Seat:</strong> {item.seat_number || "-"}
              </p>

              <hr />

              <h4>Passenger Details</h4>

              <p>
                <UserRound size={16} /> {item.passenger_name || "Passenger"}
              </p>

              <p>
                <Mail size={16} /> {item.passenger_email || "-"}
              </p>

              <p>
                <Phone size={16} /> {item.passenger_phone || "-"}
              </p>

              <hr />

              <h4>Emergency Attachments</h4>

              <div className="staff-media-section">

                <div>
                  <Image size={20} />
                  <p>Emergency Image</p>

                  {item.image_path && mediaUrls[item.id]?.image ? (
                    <a
                      href={mediaUrls[item.id].image}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={mediaUrls[item.id].image}
                        alt="Emergency"
                        style={{
                          width: "150px",
                          borderRadius: "8px"
                        }}
                      />
                    </a>
                  ) : item.image_path ? (
                    <p>Loading image...</p>
                  ) : (
                    <p>No image uploaded</p>
                  )}
                </div>

                <div>
                  <Headphones size={20} />
                  <p>Passenger Voice Recording</p>

                  {item.audio_path && mediaUrls[item.id]?.audio ? (
                    <audio
                      controls
                      src={mediaUrls[item.id].audio}
                    />
                  ) : item.audio_path ? (
                    <p>Loading audio...</p>
                  ) : (
                    <p>No audio recording</p>
                  )}
                </div>

              </div>

              <hr />

              <label>Update Emergency Status</label>

              <select
                value={item.status}
                onChange={(e) =>
                  updateStatus(item.id, e.target.value)
                }
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

            </div>
          ))}

        </div>

      </main>
    </div>
  );
}

export default StaffDashboard;