import { FaFacebook, FaInstagram, FaGlobe } from "react-icons/fa";

const Footer = () => (
  <footer id="footer" className="bg-[#111] text-white">
    {/* Main footer content */}
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <h2
        className="text-[1.6rem] font-bold text-gray-100 mb-6 tracking-widest uppercase"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        JOIN OUR CAUSE
      </h2>

      <p className="text-gray-400 max-w-xl leading-relaxed mb-10">
        Donating blood or platelets can be intimidating and even scary. Time to put those hesitations
        and fears aside. Learn from Blood Buddy and platelet donors how simple and easy it is to roll
        up a sleeve and help save lives.
      </p>

      {/* Social icons */}
      <div className="flex gap-8">
        <a
          href="https://www.facebook.com/givebloodnhs/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="social-icon text-white transition-all duration-300"
          style={{ fontSize: "30px" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#3b5998";
            e.currentTarget.style.transform = "translateY(-20px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaFacebook className="h-7 w-7" />
        </a>

        <a
          href="https://www.instagram.com/indiablooddonation/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="social-icon text-white transition-all duration-300"
          style={{ fontSize: "30px" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(188,42,141)";
            e.currentTarget.style.transform = "translateY(-20px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaInstagram className="h-7 w-7" />
        </a>

        <a
          href="http://nbtc.naco.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Website"
          className="social-icon text-white transition-all duration-300"
          style={{ fontSize: "30px" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f0e68c";
            e.currentTarget.style.transform = "translateY(-20px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaGlobe className="h-7 w-7" />
        </a>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="bg-[#0a0a0a] py-4 text-center">
      <p className="text-gray-500 text-sm">2021 © All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
