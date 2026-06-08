import React, { useState, useEffect } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import api from '../services/api';
import './Admindashboard.css';

function Admindashboard({ user: currentUser }) { 
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });


  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("create");
  const [organizers, setOrganizers] = useState([]);

const loadOrganizers = async () => {
  try {
    const res = await api.get("/api/admin/organizers");
    setOrganizers(res.data);
  } catch (err) {
    console.error(err);
  }
};


  const getUser = () => {
    if (currentUser) return currentUser;
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  };

  const user = getUser();


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/admin/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setMessage(response.data.message);

      if (response.data.success) {
        setFormData({
           username: '',
           email: '',
           password: '',
           confirmPassword: ''
        })
      }

    } catch (error) {
      if (error.response) setMessage(error.response.data.message);
      else setMessage('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };



  

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [currentUser, navigate]);

  

  useEffect(() => {
  if (activeTab === "list") {
    loadOrganizers();
  }
}, [activeTab]);

   return (
  <div className="auth-page">
    <video className="bg-video" autoPlay muted loop playsInline>
      <source src="/files/bg3.mp4" type="video/mp4" />
    </video>

    <div className="auth-overlay"></div>

    <div className="auth-card">

      {/*  TABS  */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "create" ? "tab active" : "tab"}
          onClick={() => setActiveTab("create")}
        >
          Create Organizer
        </button>

        <button
          className={activeTab === "list" ? "tab active" : "tab"}
          onClick={() => setActiveTab("list")}
        >
          Organizers List
        </button>
      </div>

      <hr className="sep" />

      {/* TAB 1: CREATE ORGANIZER */}
      {activeTab === "create" && (
        <>
          <h2>Create Organizer Account</h2>

          {message && (
            <div
              className={`message ${
                message.includes("successfully") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button className="auth-btn" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </form>
        </>
      )}

      {/*  TAB 2: ORGANIZERS LIST */}
      {activeTab === "list" && (
        <>
          <h2>Organizers List</h2>

          {organizers.length === 0 ? (
            <p className="muted">No organizers found.</p>
          ) : (
            <table className="participants-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((o) => (
                  <tr key={o.id}>
                    <td>{o.username}</td>
                    <td>{o.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

    </div>
  </div>
);

}

export default Admindashboard;