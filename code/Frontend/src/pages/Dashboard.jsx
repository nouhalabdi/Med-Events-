import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [submissions, setSubmissions] = useState([]); // submissions

  const acceptedSubmissions = submissions.filter(
  s => s.status === "accepted"
);


  // Reviewers 
  const [reviewers, setReviewers] = useState([]);
  const [reviewerEventId, setReviewerEventId] = useState("");

  //Programme Scientifique 
  const [sessions, setSessions] = useState([]);

  //  Dashboard Tabs
  const [activeTab, setActiveTab] = useState("create"); // create | participants | reviewers | programme | submissions

  // Participants section 
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);

  // Forms 
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    details: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  //  Scientific Committee Form 
  const [reviewerForm, setReviewerForm] = useState({
    event_id: "",
    username: "",
    email: "",
    password: ""
  });

  // Session Form 
  const [sessionForm, setSessionForm] = useState({
    event_id: "",
    title: "",
    location: "",
    time: "",
    guest_name: "",
    guest_email: "",
    guest_password: "",
    submission_id: ""
  });

  // Fetch Events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    axios
      .get("http://localhost:5005/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Fetch events error:", err))
      .finally(() => setLoading(false));
  };

  // Event CRUD 
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        "http://localhost:5005/event",
        form,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      setForm({ title: "", description: "", date: "", details: "" });
      fetchEvents();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create event");
    }
  };

  const startEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description || "",
      details: ev.details || "",
      date: ev.date || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.put(`http://localhost:5005/event/${editingId}`, form, {
        withCredentials: true
      });

      setEditingId(null);
      setForm({ title: "", description: "", date: "", details: "" });
      fetchEvents();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await axios.delete(`http://localhost:5005/event/${id}`, {
        withCredentials: true
      });

      setEvents((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete event");
    }
  };

  // Participants 
  const loadParticipants = (eventId) => {
    if (!eventId) return;
    setSelectedEventId(eventId);
    axios
      .get(`http://localhost:5005/event/${eventId}/participants`, {
        withCredentials: true
      })
      .then((res) => setParticipants(res.data))
      .catch(() => setParticipants([]));
  };

  const approve = (regId) => {
    axios
      .put(`http://localhost:5005/registration/${regId}/approve`, {}, { withCredentials: true })
      .then(() => loadParticipants(selectedEventId));
  };
  const reject = (regId) => {
    axios
      .put(`http://localhost:5005/registration/${regId}/reject`, {}, { withCredentials: true })
      .then(() => loadParticipants(selectedEventId));
  };

  //Reviewers (Scientific Committee) 
  const loadReviewers = (eventId) => {
    if (!eventId) {
      setReviewers([]);
      setReviewerEventId("");
      return;
    }

    setReviewerEventId(eventId);
    axios
      .get(`http://localhost:5005/event/${eventId}/reviewers`, {
        withCredentials: true
      })
      .then((res) => setReviewers(res.data || []))
      .catch((err) => {
        console.error("Error loading reviewers:", err);
        setReviewers([]);
      });
  };

  const addReviewer = () => {
    if (!reviewerForm.event_id) {
      alert("Select event first");
      return;
    }

    axios
      .post(
        `http://localhost:5005/event/${reviewerForm.event_id}/create-reviewer`,
        {
          username: reviewerForm.username,
          email: reviewerForm.email,
          password: reviewerForm.password
        },
        { withCredentials: true }
      )
      .then((res) => {
        alert(res.data.message || "Reviewer added");
        setReviewerForm({ event_id: "", username: "", email: "", password: "" });
        
        if (reviewerEventId === reviewerForm.event_id) {
          loadReviewers(reviewerEventId);
        }
      })
      .catch(() => alert("Error adding reviewer"));
  };

  // Programme Scientifique 
  const loadSessions = (eventId) => {
    if (!eventId) {
      setSessions([]);
      return;
    }
    axios
      .get(`http://localhost:5005/event/${eventId}/sessions`)
      .then((res) => setSessions(res.data || []))
      .catch(() => setSessions([]));
  };

  const createSession = () => {
    if (!sessionForm.event_id) {
      alert("Select event");
      return;
    }

    axios
      .post(
        `http://localhost:5005/event/${sessionForm.event_id}/create-session`,
        sessionForm,
        { withCredentials: true }
      )
      .then(() => {
        alert("Session created successfully");
        loadSessions(sessionForm.event_id);
        setSessionForm({
          event_id: "",
          title: "",
          location: "",
          time: "",
          guest_name: "",
          guest_email: "",
          guest_password: ""
        });
      })
      .catch(() => alert("Error creating session"));
  };

  // Submissions
  const loadSubmissions = (eventId) => {
    if (!eventId) return;
    setSelectedEventId(eventId);
    axios
  .get(
    `http://localhost:5005/organizer/event/${eventId}/submissions`,
    { withCredentials: true }
  )
  .then((res) => setSubmissions(res.data || []))
  .catch(() => setSubmissions([]));

  };

  const approveSub = (subId) => {
    axios
      .put(`http://localhost:5005/submission/${subId}/approve`, {}, { withCredentials: true })
      .then(() => loadSubmissions(selectedEventId));
  };

  const rejectSub = (subId) => {
    axios
      .put(`http://localhost:5005/submission/${subId}/reject`, {}, { withCredentials: true })
      .then(() => loadSubmissions(selectedEventId));
  };

  return (
    <div className="dashboard-page">
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/files/bg3.mp4" type="video/mp4" />
      </video>

      <div className="dashboard-overlay"></div>

      <div className="dashboard-card">
        {/* Header */}
        <header className="dash-header">
          <h1>Dashboard</h1>
          <div className="user-pill">
            {user ? `👤 ${user.username}` : "Guest"}
          </div>
        </header>

        {/* TABS */}
        <div className="dashboard-tabs">
          <button
            className={activeTab === "create" ? "tab active" : "tab"}
            onClick={() => setActiveTab("create")}
          >
            Create Event
          </button>
          <button
            className={activeTab === "participants" ? "tab active" : "tab"}
            onClick={() => setActiveTab("participants")}
          >
            Participation Requests
          </button>

          <button
            className={activeTab === "reviewers" ? "tab active" : "tab"}
            onClick={() => setActiveTab("reviewers")}
          >
            Scientific Committee
          </button>

          <button
            className={activeTab === "programme" ? "tab active" : "tab"}
            onClick={() => setActiveTab("programme")}
          >
            Programme Scientifique
          </button>

          <button
            className={activeTab === "submissions" ? "tab active" : "tab"}
            onClick={() => setActiveTab("submissions")}
          >
            Submissions Requests
          </button>
        </div>

        <hr className="sep" />

        {/*  TAB 1: Create Event  */}
        {activeTab === "create" && (
          <section className="create-section">
            <h2>{editingId ? "Edit Event" : "Create Event"}</h2>

            {error && <div className="error-box">{error}</div>}

            <form
              onSubmit={editingId ? handleUpdate : handleCreate}
              className="event-form"
            >
              <input
                name="title"
                placeholder="Event title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description..."
                value={form.description}
                onChange={handleChange}
                rows={3}
              />

              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />

              <textarea
                name="details"
                placeholder="More details about the event..."
                value={form.details}
                onChange={handleChange}
                rows={4}
                className="details-input"
              />

              <div className="form-actions">
                <button type="submit" className="btn primary">
                  {editingId ? "Update Event" : "Create Event"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ title: "", description: "", date: "", details: "" });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <hr className="sep" />

            {/* Events List */}
            <section>
              <h2>All Events</h2>

              {loading && <p className="muted">Loading events...</p>}

              {!loading && events.length === 0 && (
                <p className="muted">No events yet.</p>
              )}

              <div className="events-grid">
                {events.map((e) => (
                  <div key={e.id} className="event-card-dark">
                    <div className="event-head">
                      <h3>{e.title}</h3>
                      <div className="event-date">{e.date}</div>
                    </div>

                    <p className="event-desc">{e.description}</p>

                    <div className="event-actions">
                      <div>
                        <button className="btn small" onClick={() => startEdit(e)}>
                          Edit
                        </button>

                        <button
                          className="btn danger small"
                          onClick={() => handleDelete(e.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <a className="view-link" href={`/event/${e.id}`}>
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>
        )}

        {/* TAB 2: Participants  */}
        {activeTab === "participants" && (
          <section className="participants-section">
            <h2>Participation Requests</h2>

            <div className="event-select-box">
              <p className="msg">Select an event to see its registration requests:</p>

              <select onChange={(e) => loadParticipants(e.target.value)} defaultValue="">
                <option value="" disabled>
                  Select Event
                </option>

                {events
                  .filter((ev) => ev.creator_id === user.id)
                  .map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
              </select>
            </div>

            {selectedEventId && (
              <div className="participants-list">
                <h3>Requests for Event</h3>

                {participants.length === 0 && <p>No participation requests for this event.</p>}

                {participants.length > 0 && (
                  <table className="participants-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Participant</th>
                        <th>Acceptance Status</th>
                        <th>Payment Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {participants.map((p) => (
                        <tr key={p.id}>
                          <td>
                            {events.find((e) => e.id === Number(selectedEventId))?.title}
                          </td>

                          <td>{p.username}</td>

                          <td>
                            <span className={`status ${p.status}`}>{p.status}</span>
                          </td>

                          <td>
                            <select
                              value={p.payment}
                              onChange={(e) =>
                                axios
                                  .put(
                                    `http://localhost:5005/registration/${p.id}/payment`,
                                    { payment_status: e.target.value },
                                    { withCredentials: true }
                                  )
                                  .then(() => loadParticipants(selectedEventId))
                              }
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </select>
                          </td>

                          <td>
                            {p.status === "pending" ? (
                              <>
                                <button className="btn small primary" onClick={() => approve(p.id)}>
                                  Accept
                                </button>
                                <button className="btn small danger" onClick={() => reject(p.id)}>
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="muted">No actions</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>
        )}
        {/*  TAB 3: Scientific Committee  */}
        {activeTab === "reviewers" && (
          <section className="participants-section">
            <h2>Scientific Committee</h2>

            {/* Select Event to View Reviewers */}
            <div className="event-select-box">
              <p className="msg">Select event:</p>

              <select
                onChange={(e) => loadReviewers(e.target.value)}
                value={reviewerEventId}
              >
                <option value="" disabled>
                  Select Event
                </option>

                {events
                  .filter((ev) => ev.creator_id === user?.id)
                  .map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Reviewers List */}
            {reviewerEventId && (
              <>
                {reviewers.length === 0 ? (
                  <p className="muted">No reviewers for this event.</p>
                ) : (
                  <table className="participants-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reviewers.map((r) => (
                        <tr key={r.id || r.email}>
                          <td>{r.username}</td>
                          <td>{r.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            <hr className="sep" />

            {/* Add Reviewer */}
            <h2>Add Scientific Committee Member</h2>

            <select
              value={reviewerForm.event_id}
              onChange={(e) =>
                setReviewerForm({ ...reviewerForm, event_id: e.target.value })
              }
            >
              <option value="">Select Event</option>
              {events
                .filter((ev) => ev.creator_id === user?.id)
                .map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
            </select>

            <input
              placeholder="Username"
              value={reviewerForm.username}
              onChange={(e) =>
                setReviewerForm({ ...reviewerForm, username: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={reviewerForm.email}
              onChange={(e) =>
                setReviewerForm({ ...reviewerForm, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={reviewerForm.password}
              onChange={(e) =>
                setReviewerForm({ ...reviewerForm, password: e.target.value })
              }
            />

            <button className="btn primary" onClick={addReviewer}>
              Add Reviewer
            </button>
          </section>
        )}

        {/* TAB 4: Programme Scientifique  */}
        {activeTab === "programme" && (
          <section className="create-section">
            <h2>Programme Scientifique</h2>

            <select
              value={sessionForm.event_id}
              onChange={(e) => {
                const id = e.target.value;
                setSessionForm({ ...sessionForm, event_id: id });
                loadSessions(id);
              }}
            >
              <option value="">Select Event</option>
              {events
                .filter((ev) => ev.creator_id === user.id)
                .map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
            </select>

            <input
              placeholder="Session title"
              onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
            />

            <input
              placeholder="Location"
              onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
            />

            <input
              type="time"
              onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
            />

            <h2>Guest Speaker</h2>
            <input
              placeholder="Guest name"
              onChange={(e) => setSessionForm({ ...sessionForm, guest_name: e.target.value })}
            />

            <input
              placeholder="Guest email"
              onChange={(e) => setSessionForm({ ...sessionForm, guest_email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Guest password"
              onChange={(e) => setSessionForm({ ...sessionForm, guest_password: e.target.value })}
            />

            {/*  Select Accepted Paper (EXACT PLACE)  */}
{acceptedSubmissions.length > 0 && (
  <>
    <h4>Select Accepted Paper</h4>

    <select
      value={sessionForm.submission_id}
      onChange={(e) =>
        setSessionForm({
          ...sessionForm,
          submission_id: e.target.value
        })
      }
      required
    >
      <option value="">Select accepted paper </option>

      {acceptedSubmissions.map((s) => (
        <option key={s.id} value={s.id}>
          {s.title} | {s.user_username} | Score: {s.average}
        </option>
      ))}
    </select>
  </>
)}

<button
  className="btn primary"
  onClick={createSession}
  disabled={!sessionForm.submission_id}
>
  Create Session
</button>


            {/* Sessions Table */}
            {sessions.length > 0 && (
              <table className="participants-table">
                <thead>
  <tr>
    <th>Session</th>
    <th>Author</th>
    <th>Score</th>
    <th>guest</th>
    <th>email</th>
    <th>PDF</th>
    <th>time</th>
    <th>location</th>
  </tr>
</thead>

                <tbody>
  {sessions.map((s) => (
    <tr key={s.id}>
      <td>{s.title}</td>
      <td>{s.paper ? s.paper.author : "—"}</td>
      <td>{s.paper ? s.paper.score : "—"}</td>
      <td>{s.guest?.username || "—"}</td>
      <td>{s.guest?.email || "—"}</td>
      <td>
        {s.paper?.pdf ? (
          <a
            href={`http://localhost:5005/uploads/submissions/${s.paper.pdf}`}
            target="_blank"
            rel="noreferrer"
          >
            View PDF
          </a>
        ) : (
          "—"
        )}
      </td>
      <td>{s.time}</td>
      <td>{s.location}</td>
    </tr>
  ))}
</tbody>


              </table>
            )}
          </section>
        )}

        {/* TAB 5: Submissions */}
        {activeTab === "submissions" && (
          <section>
            <h2>Submissions Requests</h2>

            <select onChange={(e) => loadSubmissions(e.target.value)} defaultValue="">
              <option value="">Select Event</option>
              {events
              .filter((ev) => ev.creator_id === user.id)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            
            
<table className="participants-table">
  <thead>
    <tr>
      <th>Author</th>
      <th>Title</th>
      <th>Type</th>
      <th>PDF</th>
      <th>Payment</th>
      <th>Status</th>
      <th>Review Result</th>

    </tr>
  </thead>
        <tbody>
  {submissions.map((s) => (
    <tr key={s.id}>
      <td>{s.author}</td>
      <td>{s.title}</td>
      <td>{s.email}</td>

      <td>
        <a
          href={`http://localhost:5005/uploads/submissions/${s.pdf_path}`}
          target="_blank"
          rel="noreferrer"
        >
          View PDF
        </a>
      </td>

      <td>
        <select
          value={s.payment_status || "unpaid"}
          onChange={(e) =>
            axios
              .put(
                `http://localhost:5005/submission/${s.id}/payment`,
                { payment_status: e.target.value },
                { withCredentials: true }
              )
              .then(() => loadSubmissions(selectedEventId))
          }
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </td>

      <td>
        {!s.organizer_approved && (
          <>
            <button className="btn small primary" onClick={() => approveSub(s.id)}>
              Accept
            </button>
            <button className="btn small danger" onClick={() => rejectSub(s.id)}>
              Reject
            </button>
          </>
        )}
      </td>

      {/*Review Result */}
      <td>
        {s.status === "accepted" && (
          <span className="status accepted">Accepted by reviewers</span>
        )}
        {s.status === "rejected" && (
          <span className="status rejected">Rejected by reviewers</span>
        )}
        {s.status === "pending" && (
          <span className="status pending">Under review</span>
        )}
      </td>
    </tr>
  ))}
</tbody>
</table>    
          </section>
        )}
      </div>
    </div>
  );
}