import React from "react";
import "./Account.css";

function Account({ user }) {
  return (
    <div className="account-page">
      {/* Background Video */}
      <video className="account-bg" autoPlay muted loop playsInline>
        <source src="/files/bg3.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="account-overlay"></div>

      {/* Content Card */}
      <div className="account-content">
        <h1 className="account-title">{user.username}</h1>
        <p className="account-text">{user.email}</p>
        <p className="account-text role-badge">{user.role}</p>
      </div>
    </div>
  );
}

export default Account;