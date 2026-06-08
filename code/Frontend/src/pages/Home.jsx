import React, { useEffect, useState } from "react";
import "./Home.css";
import axios from "axios";



export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    axios
      .get("http://localhost:5005/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Fetch events error:", err))
      .finally(() => setLoading(false));
  }, []);

 



  return (
    <div className="home-container">
      
      {/* Background Video */}
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/files/bg3.mp4" type="video/mp4" />
      </video>

      <div className="bg-overlay"></div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="left">
            <h3 className="subtitle">Medical topics</h3>
            <h1 className="title">Events</h1>

            <p className="description">
              Access our full event calendar. View topics, dates and details easily.
            </p>

           
          </div>
        </div>
      </section>

     

      {/* EVENTS SECTION */}
     <section id="eventsSection" className="events-section">
       <h2 className="events-title">All Events</h2>

       {loading && <p className="loading-text">Loading events...</p>}

       {!loading && events.length === 0 && (
         <p className="no-event">No events yet.</p>
       )}

        <div className="events-grid">
          {events.map((ev) => (
            <div className="event-card" key={ev.id}>
              <h3>{ev.title}</h3>
              <p className="event-date">{ev.date}</p>
              <p className="event-desc">{ev.description}</p>
              <a className="view-btn" href={`/event/${ev.id}`}>
                View
              </a>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}