import { useState, useRef } from "react";
import axios from "axios";
import {
  ArrowLeft,
  PackageSearch,
  Search,
  PlusCircle,
  MapPin,
  Mic,
  Square
} from "lucide-react";
import "./LostFound.css";

function LostFound({ onBack }) {
  const [reportType, setReportType] = useState("Lost");
const [formData, setFormData] = useState({
  item_name: "",
  category: "Electronics",
  description: "",
  train_number: "",
  coach_number: "",
  seat_number: "",
  journey_date: "",
  location: ""
});

const [image, setImage] = useState(null);
const token = localStorage.getItem("railsahay_token");

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [locationLoading, setLocationLoading] = useState(false);
const [gpsCoordinates, setGpsCoordinates] = useState(null);
const [isRecording, setIsRecording] = useState(false);
const [audioBlob, setAudioBlob] = useState(null);
const [audioUrl, setAudioUrl] = useState("");

const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);
const startRecording = async () => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone is not supported in this browser.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    audioChunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const audio = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || "audio/webm"
      });

      const url = URL.createObjectURL(audio);

      setAudioBlob(audio);
      setAudioUrl(url);

      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start();
    setIsRecording(true);
    setError("");

  } catch (error) {
    setError("Microphone permission denied or unavailable.");
  }
};

const stopRecording = () => {
  if (
    mediaRecorderRef.current &&
    mediaRecorderRef.current.state === "recording"
  ) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }
};

const deleteRecording = () => {
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }

  setAudioBlob(null);
  setAudioUrl("");
};
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    setError("Your browser does not support GPS location.");
    return;
  }

  setLocationLoading(true);
  setError("");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setGpsCoordinates({ latitude, longitude });

      setFormData((previous) => ({
        ...previous,
        location: `Latitude: ${latitude}, Longitude: ${longitude}`
      }));

      setLocationLoading(false);
    },
    () => {
      setError("Unable to access location. Please allow location permission.");
      setLocationLoading(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
};
const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setMessage("");
  setError("");

  try {
    const data = new FormData();

    data.append("report_type", reportType);
    data.append("item_name", formData.item_name);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("train_number", formData.train_number);
    data.append("coach_number", formData.coach_number);
    data.append("seat_number", formData.seat_number);
    data.append("journey_date", formData.journey_date);
    data.append("location", formData.location);

    if (image) {
      data.append("image", image);
    }
if (audioBlob) {
  data.append(
    "audio",
    audioBlob,
    "lost-found-recording.webm"
  );
}
    const response = await axios.post(
      "http://localhost:5000/api/lost-found/create",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setMessage(
      `${response.data.message} Report ID: ${response.data.report.id}`
    );

    setFormData({
      item_name: "",
      category: "Electronics",
      description: "",
      train_number: "",
      coach_number: "",
      seat_number: "",
      journey_date: "",
      location: ""
    });

    setImage(null);
if (audioUrl) {
  URL.revokeObjectURL(audioUrl);
}

setAudioBlob(null);
setAudioUrl("");
setIsRecording(false);
  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Lost & Found report submission failed."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="lost-found-page">

      <header className="lost-found-navbar">
        <button onClick={onBack}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <h2>Rail<span>Sahay</span></h2>
      </header>

      <main className="lost-found-container">

        <section className="lost-found-banner">
          <PackageSearch size={40} />

          <div>
            <h1>Lost & Found Assistance</h1>
            <p>
              Report your lost belongings or share
              information about items you have found.
            </p>
          </div>
        </section>

        <section className="lost-found-form-card">

          <h2>Report an Item</h2>
{message && (
  <div className="lost-found-success">
    {message}
  </div>
)}

{error && (
  <div className="lost-found-error">
    {error}
  </div>
)}
          <p>
            Select whether you have lost or found an item.
          </p>

          <div className="lost-found-options">

            <button
              type="button"
              className={
                reportType === "Lost"
                  ? "lost-found-option active"
                  : "lost-found-option"
              }
              onClick={() => setReportType("Lost")}
            >
              <Search size={20} />
              I Lost an Item
            </button>

            <button
              type="button"
              className={
                reportType === "Found"
                  ? "lost-found-option active"
                  : "lost-found-option"
              }
              onClick={() => setReportType("Found")}
            >
              <PlusCircle size={20} />
              I Found an Item
            </button>

          </div>

          <h3>{reportType} Item Report</h3>

<form
  className="lost-found-details-form"
  onSubmit={handleSubmit}
>
  <label>Item Name</label>
  <input
    type="text"
    name="item_name"
    placeholder="Example: Mobile Phone, Wallet, Bag"
    value={formData.item_name}
    onChange={handleChange}
    required
  />

  <label>Item Category</label>
  <select
    name="category"
    value={formData.category}
    onChange={handleChange}
  >
    <option value="Electronics">Electronics</option>
    <option value="Documents">Documents</option>
    <option value="Wallet">Wallet</option>
    <option value="Bag">Bag</option>
    <option value="Jewellery">Jewellery</option>
    <option value="Clothing">Clothing</option>
    <option value="Other">Other</option>
  </select>
<label>Description *</label>
  <textarea
    name="description"
    placeholder="Describe the item, its colour, brand or other details..."
    value={formData.description}
    onChange={handleChange}
    required
    rows="4"
  />
  <h3>Journey Details</h3>

<label>Train Number</label>
<input
  type="text"
  name="train_number"
  placeholder="Enter train number"
  value={formData.train_number}
  onChange={handleChange}
  required
/>

<label>Coach Number</label>
<input
  type="text"
  name="coach_number"
  placeholder="Example: B1, S2, A1"
  value={formData.coach_number}
  onChange={handleChange}
/>

<label>Seat Number</label>
<input
  type="text"
  name="seat_number"
  placeholder="Enter seat number"
  value={formData.seat_number}
  onChange={handleChange}
/>

<label>Journey Date</label>
<input
  type="date"
  name="journey_date"
  value={formData.journey_date}
  onChange={handleChange}
  required
/>

<label>Last Seen / Found Location *</label>

<div className="location-input-group">
  <input
    type="text"
    name="location"
    placeholder="Enter station, platform or coach location"
    value={formData.location}
    onChange={handleChange}
    required
  />

  <button
    type="button"
    className="get-location-btn"
    onClick={getCurrentLocation}
    disabled={locationLoading}
  >
    <MapPin size={18} />
    {locationLoading ? "Getting Location..." : "Get Current Location"}
  </button>
</div>

{gpsCoordinates && (
  <p className="gps-success">
    GPS Location captured successfully!
    <br />
    Latitude: {gpsCoordinates.latitude}
    <br />
    Longitude: {gpsCoordinates.longitude}
  </p>
)}
<div className="voice-recording-section">
  <label>Voice Recording (Optional)</label>

  <p>Record details about your lost or found item.</p>

  <div className="voice-controls">
    {!isRecording ? (
      <button
        type="button"
        className="start-recording-btn"
        onClick={startRecording}
      >
        <Mic size={18} />
        Start Recording
      </button>
    ) : (
      <button
        type="button"
        className="stop-recording-btn"
        onClick={stopRecording}
      >
        <Square size={18} />
        Stop Recording
      </button>
    )}
  </div>

  {audioUrl && (
    <div className="audio-preview">
      <audio controls src={audioUrl}></audio>

      <button
        type="button"
        onClick={deleteRecording}
      >
        Delete Recording
      </button>
    </div>
  )}
</div>
<label>Upload Item Photo (Optional)</label>

<input
  type="file"
  accept="image/*"
  onChange={(e) => setImage(e.target.files[0])}
/>

{image && (
  <p className="selected-image-name">
    Selected: {image.name}
  </p>
)}
<button
  type="submit"
  className="lost-found-submit-btn"
  disabled={loading}
>
  {loading
    ? "Submitting..."
    : `Submit ${reportType} Report`}
</button>
</form>

        </section>

      </main>
    </div>
  );
}

export default LostFound;