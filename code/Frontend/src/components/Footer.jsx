import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">

        <div className="footer-copy">
          © {new Date().getFullYear()} MED Events. All rights reserved.
        </div>
    </footer>
  );
}
