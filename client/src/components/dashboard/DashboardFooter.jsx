import { Droplets, Mail, Phone, ArrowUpRight } from "lucide-react";

export default function DashboardFooter() {
  return (
    <footer className="bg-[#0F172A] text-white py-16 px-4 md:px-8">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 font-extrabold text-lg mb-4">
            <div className="w-9 h-9 bg-[#E11D48] rounded-xl flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Droplets size={16} fill="currentColor" />
            </div>
            BloodConnect<span className="text-[#E11D48]">.</span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            The global standard for medical donor logistics and emergency coordination.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-slate-300">
            Quick Links
          </h4>

          <ul className="space-y-3 text-sm text-slate-400">
            {["Nearest Centers", "Medical FAQ", "Privacy Policy", "Terms"].map((link) => (
              <li
                key={link}
                className="hover:text-white cursor-pointer transition flex items-center gap-1 group"
              >
                {link}
                <ArrowUpRight
                  size={12}
                  className="opacity-0 group-hover:opacity-100 transition"
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-slate-300">
            Support
          </h4>

          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2 hover:text-white transition">
              <Mail size={14} /> help@bloodconnect.com
            </li>
            <li className="flex items-center gap-2 hover:text-white transition">
              <Phone size={14} /> +91 80000 00000
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-slate-300">
            Newsletter
          </h4>

          <input
            type="email"
            placeholder="your@email.com"
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] mb-3"
          />

          <button className="w-full bg-[#E11D48] text-white rounded-xl px-4 py-3 text-sm font-bold hover:bg-rose-700 transition shadow-lg">
            Join Network
          </button>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto mt-14 pt-8 border-t border-white/10">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 text-center">
          © 2026 BloodConnect. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}