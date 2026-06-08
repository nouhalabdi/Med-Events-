import { useEffect, useState } from "react";
import axios from "axios";
import "./GuestDashboard.css";

export default function GuestDashboard({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5005/guest/sessions", {
        withCredentials: true
      })
      .then(res => setSessions(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <video className="bg-video" autoPlay muted loop playsInline>
         <source src="/files/bg3.mp4" type="video/mp4" />
      </video>
      <div className="dashboard-overlay"></div>
      <div className="dashboard-card">

        <header className="dash-header">
          <h1>Guest Dashboard</h1>
          <div className="user-pill">
            🎤 {user?.username}
          </div>
        </header>

        <hr className="sep" />

        <h2>Your Scientific Sessions</h2>

        {loading && <p className="muted">Loading sessions...</p>}

        {!loading && sessions.length === 0 && (
          <p className="muted">No sessions assigned to you.</p>
        )}

        {sessions.length > 0 && (
          <table className="participants-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Session Title</th>
                <th>Time</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td>{s.event_title}</td>
                  <td>{s.title}</td>
                  <td>{s.time}</td>
                  <td>{s.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
