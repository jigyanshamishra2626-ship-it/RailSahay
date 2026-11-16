import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ArrowLeft,
  HeartPulse,
  ShieldAlert,
  Send,
  Clock,
  MapPin,
  Mic,
  Square
} from "lucide-react";

import "./Emergency.css";

function Emergency({ onBack }) {
  const [form, setForm] = useState({
    emergency_type: "Medical",
    description: "",
    location: "",
    train_number: "",
    coach_number: "",
    seat_number: ""
  });
   const [requests, setRequests] = useState([]);
   const [attachmentUrls, setAttachmentUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

const [locationLoading, setLocationLoading] = useState(false);
const [gpsCoordinates, setGpsCoordinates] = useState(null);
const [isRecording, setIsRecording] = useState(false);
const [audioBlob, setAudioBlob] = useState(null);
const [audioUrl, setAudioUrl] = useState("");
const [audioUploading, setAudioUploading] = useState(false);
const [imageFile, setImageFile] = useState(null);
const [imagePreview, setImagePreview] = useState("");
const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);
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

      setForm((previous) => ({
        ...previous,
        location: `Latitude: ${latitude}, Longitude: ${longitude}`
      }));

      setLocationLoading(false);
    },
    (error) => {
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
 // Start Voice Recording
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

// Stop Voice Recording
const stopRecording = () => {
  if (
    mediaRecorderRef.current &&
    mediaRecorderRef.current.state === "recording"
  ) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }
};

// Delete Voice Recording
const deleteRecording = () => {
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }

  setAudioBlob(null);
  setAudioUrl("");
};
  const token = localStorage.getItem("railsahay_token");

  const fetchRequests = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/emergency/my-requests",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const emergencies = response.data.emergencies || [];

    setRequests(emergencies);

    const attachmentMap = {};

    await Promise.all(
      emergencies.map(async (request) => {
        attachmentMap[request.id] = {};

        if (request.image_path) {
          try {
            const imageResponse = await axios.get(
              `http://localhost:5000/api/emergency/emergency-media/${encodeURIComponent(request.image_path)}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                },
                responseType: "blob"
              }
            );

            attachmentMap[request.id].image =
              URL.createObjectURL(imageResponse.data);

          } catch (error) {
            console.error("Unable to load emergency image:", error);
          }
        }

        if (request.audio_path) {
          try {
            const audioResponse = await axios.get(
              `http://localhost:5000/api/emergency/emergency-media/${encodeURIComponent(request.audio_path)}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                },
                responseType: "blob"
              }
            );

            attachmentMap[request.id].audio =
              URL.createObjectURL(audioResponse.data);

          } catch (error) {
            console.error("Unable to load emergency audio:", error);
          }
        }
      })
    );

    setAttachmentUrls(attachmentMap);

  } catch (err) {
    setError("Unable to load emergency requests.");
  }
};

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
     const formData = new FormData();

formData.append("emergency_type", form.emergency_type);
formData.append("description", form.description);
formData.append("location", form.location);
formData.append("train_number", form.train_number);
formData.append("coach_number", form.coach_number);
formData.append("seat_number", form.seat_number);

if (imageFile) {
  formData.append("image", imageFile);
}

if (audioBlob) {
  formData.append("audio", audioBlob, "emergency-recording.webm");
}

const response = await axios.post(
  "http://localhost:5000/api/emergency/create",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      setMessage(
        `${response.data.message} Request ID: ${response.data.emergency.id}`
      );

      setForm({
        emergency_type: "Medical",
        description: "",
        location: "",
        train_number: "",
        coach_number: "",
        seat_number: ""
      });
// Reset uploaded image
if (imagePreview) {
  URL.revokeObjectURL(imagePreview);
}

setImageFile(null);
setImagePreview("");

// Reset voice recording
if (audioUrl) {
  URL.revokeObjectURL(audioUrl);
}

setAudioBlob(null);
setAudioUrl("");
      await fetchRequests();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Emergency request failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emergency-page">

      <header className="emergency-navbar">
        <button onClick={onBack}>
          <ArrowLeft size={19} /> Back to Dashboard
        </button>

        <h2>Rail<span>Sahay</span></h2>
      </header>

      <main className="emergency-container">

        <section className="emergency-banner">
          <ShieldAlert size={38} />
          <div>
            <h1>Emergency Assistance</h1>
            <p>
              Request medical or security assistance
              during your railway journey.
            </p>
          </div>
        </section>

        <section className="emergency-form-card">

          <h2>Submit Emergency Request</h2>

          <p className="emergency-subtitle">
            Provide accurate details so your request
            can be reviewed by railway staff.
          </p>

          {message && (
            <div className="emergency-success">
              {message}
            </div>
          )}

          {error && (
            <div className="emergency-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label>Emergency Type</label>

            <div className="emergency-type-options">

              <button
                type="button"
                className={
                  form.emergency_type === "Medical"
                    ? "type-option active"
                    : "type-option"
                }
                onClick={() =>
                  setForm({
                    ...form,
                    emergency_type: "Medical"
                  })
                }
              >
                <HeartPulse size={22} />
                Medical
              </button>

              <button
                type="button"
                className={
                  form.emergency_type === "Security"
                    ? "type-option active"
                    : "type-option"
                }
                onClick={() =>
                  setForm({
                    ...form,
                    emergency_type: "Security"
                  })
                }
              >
                <ShieldAlert size={22} />
                Security
              </button>

            </div>

            <label>Problem Description *</label>
            <textarea
              name="description"
              placeholder="Describe your emergency..."
              value={form.description}
              onChange={handleChange}
              required
              rows="4"
            />

          <label>Current Location *</label>

<div className="location-input-group">
  <input
    name="location"
    placeholder="Enter station, platform or coach location"
    value={form.location}
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
{/* Emergency Image Upload */}
<div className="image-upload-section">
  <label>Upload Emergency Image (Optional)</label>

  <p>
    Upload a photo related to your emergency.
  </p>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={(e) => {
      const file = e.target.files[0];

      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          setError("Image size must be less than 10 MB.");
          e.target.value = "";
          return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError("");
      }
    }}
  />

  {imagePreview && (
    <div className="image-preview">
      <img
        src={imagePreview}
        alt="Emergency Preview"
        style={{
          width: "180px",
          marginTop: "10px",
          borderRadius: "8px"
        }}
      />

      <button
        type="button"
        onClick={() => {
          URL.revokeObjectURL(imagePreview);
          setImageFile(null);
          setImagePreview("");
        }}
      >
        Remove Image
      </button>
    </div>
  )}
</div>
{/* Voice Recording Section */}
<div className="voice-recording-section">
  <label>Voice Recording (No Time Limit)</label>

  <p>Record your emergency details using your microphone.</p>

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
            <div className="emergency-row">

              <div>
                <label>Train Number</label>
                <input
                  name="train_number"
                  placeholder="e.g. 12801"
                  value={form.train_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Coach Number</label>
                <input
                  name="coach_number"
                  placeholder="e.g. B2"
                  value={form.coach_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Seat Number</label>
                <input
                  name="seat_number"
                  placeholder="e.g. 35"
                  value={form.seat_number}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button
              className="submit-emergency"
              type="submit"
              disabled={loading}
            >
              <Send size={18} />
              {loading
                ? "Submitting..."
                : "Submit Emergency Request"}
            </button>

          </form>
        </section>

        <section className="emergency-history">

          <h2>My Emergency Requests</h2>

          {requests.length === 0 ? (
            <p className="no-requests">
              No emergency requests submitted yet.
            </p>
          ) : (
            requests.map((request) => (
              <article
                className="request-card"
                key={request.id}
              >
                <div>
                  <strong>
                    {request.emergency_type} Emergency
                  </strong>

                  <p>{request.description}</p>

                  <span>
                    <MapPin size={14} />
                    {request.location}
                  </span>

                  <span>
                    <Clock size={14} />
                    {new Date(request.created_at).toLocaleString()}
                  </span>
                  {attachmentUrls[request.id]?.image && (
  <div className="history-attachment">
    <strong>Emergency Image</strong>

    <img
      src={attachmentUrls[request.id].image}
      alt="Emergency"
      style={{
        width: "180px",
        maxWidth: "100%",
        marginTop: "8px",
        borderRadius: "8px"
      }}
    />
  </div>
)}

{attachmentUrls[request.id]?.audio && (
  <div className="history-attachment">
    <strong>Passenger Voice Recording</strong>

    <audio
      controls
      src={attachmentUrls[request.id].audio}
      style={{
        display: "block",
        marginTop: "8px",
        maxWidth: "100%"
      }}
    />
  </div>
)}
                </div>

                <div className="request-status">
                  {request.status}
                </div>
              </article>
            ))
          )}

        </section>

      </main>
    </div>
  );
}

export default Emergency;