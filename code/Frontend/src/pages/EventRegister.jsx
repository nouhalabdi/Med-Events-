import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./EventRegister.css";

const EventRegister = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/api/check-auth")
      .then((res) => {
        if (res.data.authenticated) {
          setUser(res.data.user);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const submit = async () => {
    try {
      setLoading(true);
      await api.post(`/event/${id}/register`);
      alert("Registration submitted");
      navigate("/participant");
    } catch {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="event-page">
      <video className="bg-video" autoPlay muted loop playsInline>
         <source src="/files/bg3.mp4" type="video/mp4" />
      </video>
      <div className="dashboard-overlay"></div>
      <div className="auth-card">
    
        <h2 className="title">Event Registration</h2>

        <input value={user.username} disabled />
        <input value={user.email} disabled />

        <button onClick={submit} disabled={loading}>
          {loading ? "Submitting..." : "Confirm Registration"}
        </button>
      </div>
    </div>
  );
};

export default EventRegister;