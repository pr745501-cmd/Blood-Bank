import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Droplets, Heart, ChevronRight } from "lucide-react";
import bgImage from "../assets/blood-bag-hero.jpg";

const BLOOD_GROUPS = ["Select blood group", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function Login() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [bloodGroup, setBloodGroup]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({ ...res.data.user, _id: res.data.user._id || res.data.user.id }));
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT HERO PANEL ── */}
      <div className="relative lg:w-[55%] min-h-[280px] lg:min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Background image */}
        <img
          src={bgImage}
          alt="Blood donation"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/90 via-red-900/75 to-rose-800/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl" />

        {/* Floating stat cards — hidden on small screens */}
        <div className="absolute top-8 right-8 hidden xl:flex flex-col gap-3">
          {[
            { val: "50K+", label: "Lives Saved" },
            { val: "5K+",  label: "Active Donors" },
          ].map(({ val, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white text-right">
              <p className="text-2xl font-black leading-none">{val}</p>
              <p className="text-xs text-white/70 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Main hero content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-8 sm:px-14 py-12 lg:py-0">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:mb-16">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
              <Droplets size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Blood<span className="text-red-300">Connect</span>
            </span>
          </div>

          <div>
            <p className="text-red-300 text-sm font-bold tracking-[0.25em] uppercase mb-3">Donate Blood · Save Life</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-5">
              Every Drop<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-rose-200">
                Counts.
              </span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-sm">
              Sign in to track your donations, respond to emergency requests, and keep saving lives.
            </p>
          </div>

          {/* Pulse line decoration */}
          <div className="mt-10 hidden sm:block">
            <svg viewBox="0 0 300 50" className="w-64 opacity-40" fill="none">
              <polyline
                points="0,25 40,25 55,10 70,40 85,15 100,25 140,25 155,5 170,45 185,20 200,25 300,25"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 px-8 sm:px-14 pb-8 hidden lg:flex items-center gap-2">
          <Heart size={14} className="text-red-400 fill-red-400" />
          <p className="text-white/40 text-xs font-semibold">© 2026 BloodConnect · Saving lives together</p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50/30 px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Droplets size={18} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">
              Blood<span className="text-red-600">Connect</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-400 mt-2 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Username / Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all shadow-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 pr-12 bg-white border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Blood Group
              </label>
              <div className="relative">
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-500 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all shadow-sm appearance-none cursor-pointer"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g === "Select blood group" ? "" : g}>{g}</option>
                  ))}
                </select>
                <Droplets size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full flex items-center justify-center gap-2 py-4 mt-2 rounded-2xl text-white font-black text-sm shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(135deg, #c0392b 0%, #e74c3c 50%, #c0392b 100%)" }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-300 font-bold">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-sm font-black text-red-600 hover:text-red-700 transition-colors"
            >
              Register Now <ChevronRight size={14} />
            </Link>
          </div>

          <p className="text-center text-xs text-slate-300 mt-8">
            By signing in you agree to our{" "}
            <a href="#" className="underline hover:text-slate-500 transition-colors">Terms</a>
            {" & "}
            <a href="#" className="underline hover:text-slate-500 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
