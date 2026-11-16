import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Users,
  Clock
} from "lucide-react";
import "./AdminDashboard.css";

function AdminDashboard({ admin, onLogout }) {
  const [emergencies, setEmergencies] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [lostFoundReports, setLostFoundReports] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError] = useState("");

  const [lostFoundLoading, setLostFoundLoading] = useState(false);
  const [lostFoundError, setLostFoundError] = useState("");
  const [lostFoundMediaUrls, setLostFoundMediaUrls] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mediaUrls, setMediaUrls] = useState({});

  // Fetch Staff
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("railsahay_admin_token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/staff",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStaffList(response.data.staff || []);
    } catch (error) {
      console.error("Unable to fetch staff:", error);
    }
  };

  // Assign Staff
  const assignStaff = async (emergencyId, staffId) => {
    if (!staffId) {
      alert("Please select Railway Staff.");
      return;
    }

    try {
      const token = localStorage.getItem("railsahay_admin_token");

      await axios.put(
        `http://localhost:5000/api/admin/emergency-requests/${emergencyId}/assign`,
        { staff_id: staffId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Emergency assigned successfully!");
      fetchEmergencies();

    } catch (error) {
      alert(error.response?.data?.message || "Staff assignment failed.");
    }
  };

  // Update Emergency Status
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("railsahay_admin_token");

      await axios.put(
        `http://localhost:5000/api/admin/emergency-requests/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchEmergencies();
      alert("Emergency status updated successfully!");

    } catch (error) {
      alert(error.response?.data?.message || "Status update failed.");
    }
  };

  // Load Emergency Media
  const loadEmergencyMedia = async (filename) => {
    try {
      const token = localStorage.getItem("railsahay_admin_token");

      const response = await axios.get(
        `http://localhost:5000/api/admin/emergency-media/${encodeURIComponent(filename)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }
      );

      return URL.createObjectURL(response.data);

    } catch (error) {
      console.error("Media loading failed:", error);
      return null;
    }
  };

  // Fetch Emergencies
  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("railsahay_admin_token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/emergency-requests",
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

      setMediaUrls(mediaData);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load emergency requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load Lost & Found Media
  const loadLostFoundMedia = async (filename) => {
    try {
      const token = localStorage.getItem("railsahay_admin_token");

      const response = await axios.get(
        `http://localhost:5000/api/admin/lost-found-media/${encodeURIComponent(filename)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }
      );

      return URL.createObjectURL(response.data);

    } catch (error) {
      console.error("Lost Found Media Error:", error);
      return null;
    }
  };

  // Fetch Lost & Found Reports
  const fetchLostFoundReports = async () => {
    try {
      setLostFoundLoading(true);
      setLostFoundError("");

      const token = localStorage.getItem("railsahay_admin_token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/lost-found-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const reports = response.data.reports || [];
      setLostFoundReports(reports);

      const mediaData = {};

      for (const item of reports) {
        mediaData[item.id] = {
          image: item.image_path
            ? await loadLostFoundMedia(item.image_path)
            : null,

          audio: item.audio_path
            ? await loadLostFoundMedia(item.audio_path)
            : null
        };
      }

      setLostFoundMediaUrls(mediaData);

    } catch (error) {
      console.error("Lost Found Fetch Error:", error);

      setLostFoundError(
        error.response?.data?.message ||
        "Failed to load Lost & Found reports."
      );

    } finally {
      setLostFoundLoading(false);
    }
  };

  // Update Lost & Found Status
  const updateLostFoundStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("railsahay_admin_token");

      await axios.patch(
        `http://localhost:5000/api/lost-found/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setLostFoundReports((prev) =>
        prev.map((report) =>
          report.id === id ? { ...report, status } : report
        )
      );

      alert("Lost & Found status updated successfully!");

    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status.");
    }
  };

  // Fetch Complaints
  const fetchComplaints = async () => {
    try {
      setComplaintLoading(true);
      setComplaintError("");

      const token = localStorage.getItem("railsahay_admin_token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/complaints",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComplaints(response.data.complaints || []);

    } catch (error) {
      console.error("Admin Complaints Fetch Error:", error);

      setComplaintError(
        error.response?.data?.message || "Failed to load complaints."
      );

    } finally {
      setComplaintLoading(false);
    }
  };

  // Update Complaint Status
  const updateComplaintStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("railsahay_admin_token");

      await axios.put(
        `http://localhost:5000/api/admin/complaints/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComplaints((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );

      alert("Complaint status updated successfully!");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update complaint status."
      );
    }
  };

  // Load Dashboard Data
  useEffect(() => {
    fetchEmergencies();
    fetchStaff();
    fetchLostFoundReports();
    fetchComplaints();
  }, []);

  return (
    <div className="admin-dashboard">
    <header className="admin-navbar">
        <div className="admin-brand">
          <ShieldCheck size={27} />
          <span>RailSahay Admin</span>
        </div>

        <div className="admin-profile">
          <span>{admin?.full_name || "Administrator"}</span>
          <button onClick={onLogout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage railway passenger assistance requests.</p>
          </div>

          <button
            className="refresh-admin-btn"
            onClick={fetchEmergencies}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Dashboard Statistics */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <AlertTriangle size={25} />
            <div>
              <h3>{emergencies.length}</h3>
              <p>Total Emergency Requests</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <Clock size={25} />
            <div>
              <h3>
                {emergencies.filter(
                  (item) => item.status === "Pending"
                ).length}
              </h3>
              <p>Pending Requests</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <Users size={25} />
            <div>
              <h3>
                {new Set(
                  emergencies.map((item) => item.passenger_id)
                ).size}
              </h3>
              <p>Passengers Requiring Help</p>
            </div>
          </div>
        </div>

        {/* Emergency Requests */}
        <section className="admin-requests">
          <h2>Passenger Emergency Requests</h2>

          {error && (
            <p className="admin-dashboard-error">{error}</p>
          )}

          {loading && emergencies.length === 0 ? (
            <p>Loading emergency requests...</p>
          ) : emergencies.length === 0 ? (
            <p>No emergency requests found.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Passenger</th>
                    <th>Emergency</th>
                    <th>Train</th>
                    <th>Coach</th>
                    <th>Seat</th>
                    <th>Location</th>
                    <th>Emergency Image</th>
                    <th>Voice Recording</th>
                    <th>Assign Staff</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {emergencies.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>

                      <td>
                        {item.passenger_name || "Unknown"}
                        <br />
                        <small>{item.passenger_phone || ""}</small>
                      </td>

                      <td>{item.emergency_type}</td>
                      <td>{item.train_number || "-"}</td>
                      <td>{item.coach_number || "-"}</td>
                      <td>{item.seat_number || "-"}</td>
                      <td>{item.location || "-"}</td>

                      <td>
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
                                width: "100px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "8px"
                              }}
                            />
                          </a>
                        ) : item.image_path ? (
                          "Loading image..."
                        ) : (
                          "No image"
                        )}
                      </td>

                      <td>
                        {item.audio_path && mediaUrls[item.id]?.audio ? (
                          <audio
                            controls
                            src={mediaUrls[item.id].audio}
                            style={{ width: "180px" }}
                          />
                        ) : item.audio_path ? (
                          "Loading audio..."
                        ) : (
                          "No audio"
                        )}
                      </td>

                      <td>
                        <select
                          id={`staff-${item.id}`}
                          defaultValue={item.assigned_staff_id || ""}
                        >
                          <option value="">Select Staff</option>

                          {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.full_name} - {staff.designation}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => {
                            const selectedStaff =
                              document.getElementById(
                                `staff-${item.id}`
                              ).value;

                            assignStaff(item.id, selectedStaff);
                          }}
                        >
                          Assign
                        </button>
                      </td>

                      <td>
                        <select
                          value={item.status || "Pending"}
                          onChange={(e) =>
                            updateStatus(item.id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {/* Passenger Complaints */}
        <section className="admin-requests">
          <div className="admin-heading">
            <div>
              <h2>Passenger Complaints</h2>
              <p>Review and manage passenger complaints.</p>
            </div>

            <button
              className="refresh-admin-btn"
              onClick={fetchComplaints}
              disabled={complaintLoading}
            >
              <RefreshCw size={17} />
              {complaintLoading ? "Loading..." : "Refresh Complaints"}
            </button>
          </div>

          {complaintError && (
            <p className="admin-dashboard-error">
              {complaintError}
            </p>
          )}

          {complaintLoading && complaints.length === 0 ? (
            <p>Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p>No passenger complaints found.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Passenger</th>
                    <th>Complaint Type</th>
                    <th>Description</th>
                    <th>Train</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>

                      <td>
                        {item.passenger_name || "Unknown"}
                        <br />
                        <small>
                          {item.passenger_phone ||
                            item.passenger_email ||
                            ""}
                        </small>
                      </td>

                      <td>{item.complaint_type}</td>
                      <td>{item.description}</td>
                      <td>{item.train_number || "-"}</td>

                      <td>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        <select
                          value={item.status || "Pending"}
                          onChange={(e) =>
                            updateComplaintStatus(
                              item.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Lost & Found Reports */}
        <section className="admin-requests">
          <div className="admin-heading">
            <div>
              <h2>Passenger Lost & Found Reports</h2>
              <p>Manage passenger lost and found item reports.</p>
            </div>

            <button
              className="refresh-admin-btn"
              onClick={fetchLostFoundReports}
              disabled={lostFoundLoading}
            >
              <RefreshCw size={17} />
              {lostFoundLoading ? "Loading..." : "Refresh Reports"}
            </button>
          </div>

          {lostFoundError && (
            <p className="admin-dashboard-error">
              {lostFoundError}
            </p>
          )}

          {lostFoundLoading && lostFoundReports.length === 0 ? (
            <p>Loading Lost & Found reports...</p>
          ) : lostFoundReports.length === 0 ? (
            <p>No Lost & Found reports found.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Passenger</th>
                    <th>Report Type</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Train</th>
                    <th>Coach</th>
                    <th>Seat</th>
                    <th>Journey Date</th>
                    <th>Location</th>
                    <th>Image</th>
                    <th>Voice Recording</th>
                  </tr>
                </thead>

                <tbody>
                  {lostFoundReports.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>

                      <td>
                        {item.passenger_name || "Unknown"}
                        <br />
                        <small>{item.passenger_phone || ""}</small>
                      </td>

                      <td>{item.report_type || "-"}</td>
                      <td>{item.item_name || "-"}</td>
                      <td>{item.category || "-"}</td>
                      <td>{item.description || "-"}</td>
                      <td>{item.train_number || "-"}</td>
                      <td>{item.coach_number || "-"}</td>
                      <td>{item.seat_number || "-"}</td>

                      <td>
                        {item.journey_date
                          ? new Date(item.journey_date).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>{item.location || "-"}</td>

                      <td>
                        {lostFoundMediaUrls[item.id]?.image ? (
                          <a
                            href={lostFoundMediaUrls[item.id].image}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={lostFoundMediaUrls[item.id].image}
                              alt="Lost and found item"
                              style={{
                                width: "100px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "8px"
                              }}
                            />
                          </a>
                        ) : item.image_path ? (
                          "Loading image..."
                        ) : (
                          "No image"
                        )}
                      </td>

                      <td>
                        {lostFoundMediaUrls[item.id]?.audio ? (
                          <audio
                            controls
                            src={lostFoundMediaUrls[item.id].audio}
                            style={{ width: "180px" }}
                          />
                        ) : item.audio_path ? (
                          "Loading audio..."
                        ) : (
                          "No audio"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;