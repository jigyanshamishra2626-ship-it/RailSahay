import { useState } from "react";
import axios from "axios";
import {
  Search, TrainFront, ArrowLeft, MapPin,
  Clock, ArrowRight, CalendarDays
} from "lucide-react";
import "./TrainSearch.css";

function TrainSearch({ onBack }) {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const searchTrains = async () => {
    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const response = await axios.get(
        "http://localhost:5000/api/trains",
        { params: { search, from, to } }
      );

      setTrains(response.data);
    } catch {
      setError("Unable to fetch trains. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="train-page">
      <nav className="train-nav">
        <div className="train-brand">
          <TrainFront size={30} />
          <span>Rail<span>Sahay</span></span>
        </div>
        <button className="train-back" onClick={onBack}>
          <ArrowLeft size={17} /> Back to Dashboard
        </button>
      </nav>

      <main className="train-container">
        <section className="train-hero">
          <span className="train-tag">RAILWAY PASSENGER SERVICES</span>
          <h1>Find Your <span>Perfect Train</span></h1>
          <p>Search trains and plan your journey with RailSahay.</p>
        </section>

        <section className="train-search-box">
          <h2><Search size={22} /> Search Trains</h2>

          <div className="train-fields">
            <label>
              Train Name / Number
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="e.g. 12801 or Purushottam"
              />
            </label>

            <label>
              From Station
              <input
                value={from}
                onChange={e => setFrom(e.target.value)}
                placeholder="Enter source station"
              />
            </label>

            <label>
              To Station
              <input
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="Enter destination station"
              />
            </label>
          </div>

          <button
            className="train-search-btn"
            onClick={searchTrains}
            disabled={loading}
          >
            <Search size={19} />
            {loading ? "Searching..." : "Search Trains"}
          </button>
        </section>

        {error && <p className="train-error">{error}</p>}

        <section className="train-results">
          {searched && !loading && (
            <h2>Search Results ({trains.length})</h2>
          )}

          {trains.map(train => (
            <article className="train-result-card" key={train.id}>
              <div className="train-result-heading">
                <div className="train-result-icon">
                  <TrainFront size={25} />
                </div>
                <div>
                  <h3>{train.train_name}</h3>
                  <span>Train No. {train.train_number}</span>
                </div>
              </div>

              <div className="train-route">
                <div>
                  <strong>{train.departure_time.slice(0, 5)}</strong>
                  <p><MapPin size={14} /> {train.source_station}</p>
                </div>

                <div className="train-route-line">
                  <span></span>
                  <ArrowRight size={20} />
                </div>

                <div>
                  <strong>{train.arrival_time.slice(0, 5)}</strong>
                  <p><MapPin size={14} /> {train.destination_station}</p>
                </div>
              </div>

              <div className="train-result-footer">
                <span><Clock size={15} /> Schedule information</span>
                <span><CalendarDays size={15} /> Demo timetable</span>
              </div>
            </article>
          ))}

          {searched && !loading && trains.length === 0 && (
            <p className="train-empty">No trains found. Try different stations.</p>
          )}
        </section>
      </main>

      <footer className="train-footer">
        © 2026 RailSahay | Your Journey, Our Priority
      </footer>
    </div>
  );
}

export default TrainSearch;