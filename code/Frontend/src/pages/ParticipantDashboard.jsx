import { useEffect, useState } from "react";
import axios from "axios";
import './ParticipantDashboard.css';

function ParticipantDashboard() {

  const [regs, setRegs] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5005/api/my-registrations", {
      withCredentials: true
    })
      .then(res => setRegs(res.data));
  }, []);

  return (
    <div className="participant-dashboard">
      <video className="bg-video" autoPlay muted loop playsInline>
         <source src="/files/bg3.mp4" type="video/mp4" />
      </video>
      <div className="dashboard-overlay"></div>
      

      {regs.length === 0 && <p>No registrations yet.</p>}

      {regs.map((r, index) => (
        <div key={index} className="participant-card">
          <h3>{r.event}</h3>
          <p>Status: <strong>{r.status}</strong></p>
          <p>Payment: <strong>{r.payment}</strong></p>
        </div>
      ))}
    </div>
  );
}
export default ParticipantDashboard;
