import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from "./components/Footer";
import Home from './pages/Home'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Admindashboard from './pages/Admindashboard'
import  GuestDashboard from './pages/GuestDashboard'
import ParticipantDashboard from './pages/ParticipantDashboard'
import EventRegister from "./pages/EventRegister";
import Account from './pages/Account'
import Login from './pages/Login'
import Register from './pages/Register'
import SubmissionForm from './pages/SubmissionForm'
import ReviewerDashboard from './pages/ReviewerDashboard'
import AuthorDashboard from './pages/AuthorDashboard'
import EventDetails from "./pages/EventDetails";
import './App.css'
import { useState, useEffect } from 'react'
import api from './services/api'; 

const App = () => {

  const [user, setUser] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/check-auth');
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch {
      setUser(null);
    }
  };


  const checkParticipant = async () => {
    try {
      const res = await api.get("/api/is-participant");
      setIsParticipant(res.data.isParticipant);
    } catch {
      setIsParticipant(false);
    }
  };


  useEffect(() => {
    if (user) {
      checkParticipant();
    } else {
      setIsParticipant(false);
    }
  }, [user]);


  useEffect(()=>{
    checkAuth()
  },[])

  return (
    <div className="app">
      <Navbar user={user} isParticipant={isParticipant} setUser={setUser} />

      <main className="page-container">
        

          <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />

  {/* role*/}
  <Route
    path="/dashboard"
    element={
      !user ? (
        <Navigate to="/" />
      ) : user.role === "organizer" ? (
        <Dashboard user={user} />
      ) : user.role === "guest" ? (
        <GuestDashboard user={user} />
      ) : user.role === "reviewer" ? (
        <ReviewerDashboard user={user} />
        
      ) :user.role === "author" ? (
        <AuthorDashboard user={user} />
      ) : user.role === "participant" ? (  
      <ParticipantDashboard user={user} />
      ) :
      
       (
        <Navigate to="/" />
      )
    }
  />

  <Route
    path="/admindashboard"
    element={
      user && user.role === "admin"
        ? <Admindashboard user={user} />
        : <Navigate to="/" />
    }
  />

  <Route
    path="/participant"
    element={
      user && isParticipant
        ? <ParticipantDashboard />
        : <Navigate to="/" />
    }
  />

  <Route path="/event/:id/register" element={<EventRegister />} />
  <Route path="/event/:id" element={<EventDetails />} />
  <Route path="/account" element={<Account user={user} />} />
  <Route path="/login" element={<Login setUser={setUser} />}
   />
   <Route path="/event/:id/submit" element={<SubmissionForm />} />

  <Route path="/register" element={<Register />} />
  <Route path="/authordashboard" element={<AuthorDashboard user={user} />} />
  
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>


      </main>
       <Footer />
    </div>
  );
};

export default App;
