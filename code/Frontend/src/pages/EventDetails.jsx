import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./EventDetails.css";

function EventDetails() {
  const { id } = useParams();

  // States 
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");

  

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submissions, setSubmissions] = useState([]);

useEffect(() => {
  axios.get(`http://localhost:5005/event/${id}/public-submissions`)
    .then(res => setSubmissions(res.data));
}, [id]);


  //  Effects 
  useEffect(() => {
    axios.get(`http://localhost:5005/event/${id}`)
      .then(res => setEvent(res.data));

    axios.get(`http://localhost:5005/event/${id}/comments`)
      .then(res => setComments(res.data));
  }, [id]);

  useEffect(() => {
    axios
      .get(`http://localhost:5005/event/${id}/sessions`)
      .then(res => setSessions(res.data))
      .catch(() => setSessions([]));
  }, [id]);

  useEffect(() => {
    axios.get("http://localhost:5005/api/check-auth", { withCredentials: true })
      .then(res => {
        if (res.data.authenticated) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
        setLoadingUser(false);
      })
      .catch(() => {
        setUser(null);
        setLoadingUser(false);
      });
  }, []);

  //  Handlers 
  const submitComment = () => {
    if (!comment || !rating) {
      alert("Please write a comment and select rating");
      return;
    }

    axios.post(
      `http://localhost:5005/event/${id}/comment`,
      { text: comment, rating },
      { withCredentials: true }
    )
      .then(() => {
        setComment("");
        setRating("");
        return axios.get(`http://localhost:5005/event/${id}/comments`);
      })
      .then(res => setComments(res.data));
  };


  // Early return
  if (!event) return <p className="loading-text">Loading...</p>;


  return (
    <div className="event-page">

      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/files/bg3.mp4" type="video/mp4" />
      </video>

      <div className="event-overlay"></div>

      <div className="event-card">
        <h1 className="event-title">{event.title}</h1>
        <p className="event-date"><strong>Date:</strong> {event.date}</p>
        <p className="event-desc">{event.description}</p>
        {event.details && (
          <div className="event-details-box">
            <h2 className="details-title">Details</h2>
            <p className="event-details">{event.details}</p>
          </div>
        )}
        <hr className="sep" />




       

        {/* Comment Form */}
        <div className="comment-box">
          <h3>Leave a Comment</h3>

          <textarea
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">Select rating</option>
            <option value="1">⭐️</option>
            <option value="2">⭐️⭐️</option>
            <option value="3">⭐️⭐️⭐️</option>
            <option value="4">⭐️⭐️⭐️⭐️</option>
            <option value="5">⭐️⭐️⭐️⭐️⭐️</option>
          </select>

          <button onClick={submitComment}>Submit</button>
        </div>

        {/* Comments List */}
        <div className="comments-list">
          <h3>Comments</h3>

          {comments.length === 0 && <p>No comments yet.</p>}

          {comments.map((c, index) => (
            <div key={index} className="comment-item">
              <strong>{c.username}</strong>
              <div>{"⭐️".repeat(c.rating)}</div>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Bottom buttons */}
        <div className="event-actions-bottom">
          <button className="back-btn" onClick={() => window.history.back()}>
            ⟵ Back
          </button>

          <a href={`/event/${id}/register`} className="reg-btn">
            Register
          </a>


            
          
          <a href={`/event/${id}/submit`} className="subm-btn">
          Add Submission
          </a>

        </div>
        <h2>Research Submissions</h2>

       {submissions.length === 0 && (
       <p className="muted">No submissions yet.</p>
      )}

     {submissions.map((s, i) => (
     <div key={i} className="submission-card">
     <h4>{s.title}</h4>
     <p><b>Author:</b> {s.author}</p>

     {s.pdf && (
      <a
        href={`http://localhost:5005/uploads/submissions/${s.pdf}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 View PDF
      </a>
    )}
  </div>
))}
        <hr className="sep" />
        <h2>Programme Scientifique</h2>
        {sessions.length === 0 ? (
          <p className="muted">Programme scientifique non disponible.</p>
        ) : (
          <table className="participants-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Location</th>
                <th>Time</th>
                <th>Guest Speaker</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td>{s.title}</td>
                  <td>{s.location}</td>
                  <td>{s.time}</td>
                  <td>{s.guest ? s.guest.username : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>         
        )}
      </div>     
    </div>   
  ); 
}
export default EventDetails;