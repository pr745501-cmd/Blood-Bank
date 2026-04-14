import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const Hero = () => {
  return (
    <section id="home" className="h-screen relative overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="/video/homevideo1.mp4"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Navbar rendered inside the hero */}
      <Navbar />

      {/* Hero text box — matches original: top 55%, left 21% */}
      <div className="absolute text-center" style={{ top: "55%", left: "21%", transform: "translate(-50%, -50%)", lineHeight: "50px" }}>
        <h1
          className="text-black leading-tight"
          style={{ fontFamily: "'Neuton', serif", fontSize: "70px", letterSpacing: "8px" }}
        >
          Start
        </h1>
        <h1
          className="text-black leading-tight"
          style={{ fontFamily: "'Neuton', serif", fontSize: "70px", letterSpacing: "8px" }}
        >
          Saving Lives
        </h1>
        <p
          className="text-black mt-2"
          style={{ fontFamily: "'Neuton', serif", fontSize: "26px", margin: "10px 0 40px" }}
        >
          Become a donor or request for blood And help save lives
        </p>
        <Link
          to="/register"
          className="inline-block bg-transparent text-black border-2 border-black transition-all hover:bg-[#cd5c5c] hover:border-[#cd5c5c] hover:text-white"
          style={{
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "35px",
            padding: "12px 30px",
            borderRadius: "5px 20px 5px",
            letterSpacing: "3px",
            textDecoration: "none",
          }}
        >
          Register
        </Link>
      </div>
    </section>
  );
};

export default Hero;
