import "./About.css";

const About = () => (
  <div className="about-page">
    <video className="bg-video" autoPlay muted loop playsInline>
      <source src="/files/bg3.mp4" type="video/mp4" />
    </video>

    <div className="about-overlay"></div>

    <div className="about-content">
      <h1 className="about-title">About Medical Events</h1>

      <p className="about-text">
        Medical Events is a digital platform designed to gather and organize the
        latest medical and scientific events across various specialties. Our mission
        is to provide a unified space that connects professionals, students, and
        healthcare enthusiasts with accurate information about workshops, courses,
        conferences, and seminars. We aim to support knowledge sharing, strengthen
        scientific communication, and help every user discover upcoming events with
        ease and clarity.
      </p>

      <p className="about-text">
        Our vision is to build an active medical community that shares expertise,
        enhances skills, and stays up-to-date with the newest scientific and medical
        advancements. At Medical Events, we believe that progress happens when
        knowledge is accessible to everyone.
      </p>
    </div>
  </div>
);

export default About;

