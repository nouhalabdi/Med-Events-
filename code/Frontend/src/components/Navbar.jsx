import React , {useState,useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Navbar.css";
import axios from "axios";

export default function Navbar({ user, setUser, isParticipant }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <span className="med">MED</span>{" "}
          <span className="events">Events</span>
        </div>

        <nav className="main-nav">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/about" className="nav-item">About</Link>

          {user ? (
            <>
              {user.role === "admin" ? (
                <Link to="/admindashboard" className="nav-item">Admin</Link>
              ):

              user.role === "organizer" ? (
                <Link to="/dashboard" className="nav-item">Dashboard</Link>
              ):
              user.role === "reviewer" ? (
               <Link to="/dashboard" className="nav-item">
                  Reviewer
               </Link>
               ):
               user.role === "author" ? (
               <Link to="/authordashboard" className="nav-item">
                  MySubmissions
               </Link>
               ):
               user.role === "guest" ? (
               <Link to="/dashboard" className="nav-item">My sessions</Link>
               ) :


              isParticipant ? (
                <Link to="/participant" className="nav-item">My Events</Link>
              ):null}

              <Link to="/account" className="nav-item">Account</Link>
              <button onClick={handleLogout} className="nav-item btn-log">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/register" className="nav-item btn-register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
