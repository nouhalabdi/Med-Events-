import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import './SubmissionForm.css';

export default function SubmissionForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    abstract: "",
    contribution_type: "lecture",
    pdf: null
  });

  const handleChange = (e) => {
    if (e.target.name === "pdf") {
      setForm({ ...form, pdf: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const submit = async () => {
  const data = new FormData();
  data.append("title", form.title);
  data.append("abstract", form.abstract);
  data.append("contribution_type", form.contribution_type);
  data.append("payment_status", "unpaid");
  data.append("pdf", form.pdf);

  try {
    await api.post(
      `/event/${id}/submission`,
      data,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    alert("Submission sent");
    navigate("/dashboard");

  } catch (err) {
    console.error(err);
    alert("Submission failed");
  }
};


  return (
    <div className="auth-page">
      {/* Background Video */}
  <video className="bg-video" autoPlay muted loop playsInline>
    <source src="/files/bg3.mp4" type="video/mp4" />
  </video>

  {/* Overlay */}
  <div className="auth-overlay"></div>
      <div className="auth-card">
    <h2>Submit Research Paper</h2>

    <div className="auth-form">
      <input
        name="title"
        placeholder="Title"
        onChange={handleChange}
      />
      <textarea
        name="abstract"
        placeholder="Abstract"
        onChange={handleChange}
      />

      <select name="contribution_type"  onChange={handleChange}>
        <option value="lecture">Lecture</option>
        <option value="poster">Poster</option>
        <option value="oral">Oral</option>
      </select>

      <input
        type="file"
        name="pdf"
        accept=".pdf"
        onChange={handleChange}
      />

      <button className="auth-btn" onClick={submit}>
        Submit
      </button>
    </div>
  </div>
</div>
  );
}
