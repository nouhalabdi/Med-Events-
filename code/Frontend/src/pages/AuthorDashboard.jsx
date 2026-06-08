import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css"; 

export default function AuthorDashboard({ user }) {
  if (!user) {
  return <p className="loading-text">Loading...</p>;
}


  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("my-submissions");

  useEffect(() => {
    // Fetch user's submissions
    axios.get("http://localhost:5005/my-submissions", { withCredentials: true })
      .then(res => setSubmissions(res.data))
      .catch(err => console.error(err));
  }, []);


  return (
    <div className="dashboard-page">
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/files/bg3.mp4" type="video/mp4" />
      </video>
      <div className="dashboard-overlay"></div>
      <div className="dashboard-card">

        <header className="dash-header">
          <h1>Author Dashboard</h1>
          <div className="user-pill">👤 {user.username}</div>
        </header>

        <div className="dashboard-tabs">
          <button className={activeTab === "status" ? "tab active" : "tab"} onClick={() => setActiveTab("status")}>
            Submission Status
          </button>
        </div>

       
         {activeTab === "status" && (
          <section>
            <h2>Submission Status</h2>
            <div className="events-grid">
             
             {submissions.length === 0 && <p>No submissions yet.</p>}
               {submissions.map(s => (
               <div key={s.id} className="event-card-dark">
               <h3>{s.title}</h3>
               <p>Event: {s.event.title}</p>
               <p>Status: {s.status}</p>
               <p>
               <b>Score:</b>{" "}
               {s.average_score !== null
               ? `${s.average_score} / 20`
               : "Not reviewed yet"}
               </p>


                

               {s.pdf_path && (
                <a
                href={`http://localhost:5005/uploads/submissions/${s.pdf_path}`}
                target="_blank"
                rel="noopener noreferrer"
                >
                 View PDF
                </a>
               )}
                </div> 
               ))}


             
            </div>
          </section>
        )}
        {activeTab === "marks" && (
                  
          <section>
            <div className="events-grid">
             
             
            </div>
          </section>
        )}

      </div>
    </div>
  );
}