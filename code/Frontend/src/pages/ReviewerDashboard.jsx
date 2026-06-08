import { useEffect, useState } from "react";
import axios from "axios";
import './ReviewerDashboard.css';

export default function ReviewerDashboard({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5005/reviewer/submissions", {
      withCredentials: true,
    }).then(res => setSubmissions(res.data));
  }, []);

  const submitScore = (id) => {
  if (scores[id] === undefined || scores[id] === "") {
    alert("Please enter a score first");
    return;
  }

  axios.post(
    `http://localhost:5005/submission/${id}/review`,
    { score: Number(scores[id]) },
    { withCredentials: true }
  ).then(() => {
    alert("Score submitted");
    setSubmissions(submissions.filter(s => s.id !== id));
  }).catch(() => {
    alert("Error submitting score");
  });
};


  return (
    <div className="dashboard">
      <video className="bg-video" autoPlay muted loop playsInline>
         <source src="/files/bg3.mp4" type="video/mp4" />
      </video>
      <div className="dashboard-overlay"></div>
      
      {submissions.map(s => (
        <div key={s.id} className="card">
          <h3>{s.title}</h3>
          <p><b>Author:</b> {s.author}</p>
          <p><b>Event:</b> {s.event.title}</p>
          {s.pdf_path && (
  <a
    href={`http://localhost:5005/uploads/submissions/${s.pdf_path}`}
    target="_blank"
    rel="noreferrer"
  >
    📄 View PDF
  </a>
)}

          <p>{s.abstract}</p>

          <input
            type="number"
            min="0"
            max="20"
            placeholder="Score /20"
            onChange={e =>
              setScores({ ...scores, [s.id]: e.target.value })
            }
          />

          <button onClick={() => submitScore(s.id)}>
            Submit
          </button>
        </div>
      ))}
    </div>
  );
}
