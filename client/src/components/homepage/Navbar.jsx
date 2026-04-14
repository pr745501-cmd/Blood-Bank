import { useState } from "react";

const NAV_LINKS = [
  { label: "About Us",  href: "#about" },
  { label: "Volunteer", href: "#volunteers" },
  { label: "Donate",    href: "#donate" },
  { label: "Get Help",  href: "#contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Logo — top left */}
      <div className="absolute z-50" style={{ top: "9%", left: "5%", transform: "translate(-50%, -50%)" }}>
        <a href="#home">
          <img
            src="/Images/bb_logo(white).png"
            alt="Blood Buddy"
            style={{ width: "70px" }}
          />
        </a>
      </div>

      {/* Nav links — top center/right */}
      <div
        className="absolute z-50 w-[90%]"
        style={{
          top: "10%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "'Neuton', serif",
          lineHeight: "50px",
        }}
      >
        {/* Desktop links */}
        <ul
          className="hidden md:flex justify-end list-none m-0 p-0 gap-2"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label} className="relative px-4 group">
              <a
                href={href}
                className="text-black no-underline"
                style={{ fontFamily: "'Fredoka One', cursive", fontSize: "24px" }}
              >
                {label}
              </a>
              {/* underline hover effect */}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#cd5c5c] transition-all duration-500 group-hover:w-full" />
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <div className="md:hidden flex justify-end">
          <button
            className="text-white text-2xl focus:outline-none"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <i className="fa fa-bars" />
          </button>
        </div>
      </div>

      {/* Mobile slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-52 z-[100] flex flex-col pt-6 px-6 transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#fa8072" }}
      >
        <button
          className="self-end text-white text-2xl mb-8 focus:outline-none"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <i className="fa fa-times" />
        </button>
        <ul className="list-none m-0 p-0 flex flex-col gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-white text-xl no-underline"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
