import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

export const isScrollToTopVisible = (scrollY) => scrollY > 300;

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(isScrollToTopVisible(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-8 z-50 bg-red-500 hover:bg-black text-white rounded-full p-4"
      style={{ display: visible ? "block" : "none" }}
      aria-label="Scroll to top"
    >
      <FaArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTopButton;
