import { useEffect, useState } from "react";
import { TrainFront, ArrowLeft, Send, MessageSquare } from "lucide-react";
import "./Complaint.css";

function Complaint({ onBack }) {
  const [complaintType, setComplaintType] = useState("");
  const [description, setDescription] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("railsahay_token");

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/complaints/my-complaints",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setComplaints(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/complaints/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            complaint_type: complaintType,
            description,
            train_number: trainNumber
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Complaint submitted successfully!");
        setComplaintType("");
        setDescription("");
        setTrainNumber("");
        fetchComplaints();
      } else {
        setMessage(data.message || "Failed to submit complaint.");
      }
    } catch (error) {
      setMessage("Server connection failed.");
    }
  };

  return (
    <div className="complaint-page">
      <header className="complaint-navbar">
        <div className="complaint-brand">
          <TrainFront size={27} />
          <span>Rail<span>Sahay</span></span>
        </div>

        <button onClick={onBack}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </header>

      <main className="complaint-container">
        <section className="complaint-heading">
          <span>PASSENGER SUPPORT</span>
          <h1>My Complaints</h1>
          <p>Submit and track your railway complaints.</p>
        </section>

        <section className="complaint-form-card">
          <h2><MessageSquare size={22} /> Submit a Complaint</h2>

          <form onSubmit={handleSubmit}>
            <label>Complaint Type</label>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value)}
              required
            >
              <option value="">Select complaint type</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Food Quality">Food Quality</option>
              <option value="Staff Behaviour">Staff Behaviour</option>
              <option value="Train Delay">Train Delay</option>
              <option value="Seat Issue">Seat Issue</option>
              <option value="Other">Other</option>
            </select>

            <label>Train Number (Optional)</label>
            <input
              type="text"
              placeholder="Enter train number"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
            />

            <label>Complaint Description</label>
            <textarea
              placeholder="Describe your complaint..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="5"
            />

            <button type="submit">
              <Send size={18} /> Submit Complaint
            </button>

            {message && <p className="complaint-message">{message}</p>}
          </form>
        </section>

        <section className="complaint-history">
          <h2>My Complaint History</h2>

          {complaints.length === 0 ? (
            <p>No complaints submitted yet.</p>
          ) : (
            complaints.map((item) => (
              <article className="complaint-history-card" key={item.id}>
                <h3>{item.complaint_type}</h3>
                <p>{item.description}</p>
                <p>Train: {item.train_number || "Not provided"}</p>
                <strong>Status: {item.status || "Pending"}</strong>
              </article>
            ))
          )}
        </section>
      </main>

      <footer className="complaint-footer">
        © 2026 RailSahay. Passenger Assistance Platform.
      </footer>
    </div>
  );
}

export default Complaint;