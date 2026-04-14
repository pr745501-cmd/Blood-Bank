import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Menu, X, Bell } from "lucide-react";

const NAV_ITEMS = ["Process", "Impact", "Eligibility", "Nutrition"];

export default function DashboardNav() {
  const [userName] = useState("Hero");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3 font-extrabold tracking-tight text-[#E11D48]">
          <div className="w-9 h-9 bg-[#E11D48] rounded-xl flex items-center justify-center text-white shadow-md shadow-rose-200">
            <Droplets size={18} fill="currentColor" />
          </div>
          <span className="text-lg text-[#0F172A]">
            BloodConnect<span className="text-[#E11D48]">.</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition uppercase tracking-wider ${
                i === 0
                  ? "bg-slate-100 text-[#0F172A]"
                  : "text-slate-500 hover:text-[#0F172A] hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Notification */}
          <button className="relative p-2 text-slate-500 hover:text-[#0F172A] rounded-lg hover:bg-slate-100 transition">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E11D48] rounded-full border-2 border-white" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Profile */}
          <button className="flex items-center gap-2 bg-[#0F172A] text-white px-3 py-1.5 rounded-full hover:bg-[#E11D48] transition shadow-md text-sm">
            <div className="w-7 h-7 rounded-full bg-[#E11D48] flex items-center justify-center text-[11px] font-bold">
              {userName[0]}
            </div>
            <span className="hidden sm:block">{userName}</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition"
            >
              {item}
            </button>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}