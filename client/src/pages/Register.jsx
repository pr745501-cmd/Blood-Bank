import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Droplets, Heart, ChevronRight, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import bgImage from "../assets/community-donors.jpg";

const BLOOD_GROUPS = ["Select blood group", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

function validate(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = "Full name is required.";
  else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters.";

  if (!form.email.trim()) errs.email = "Email is required.";
  else if (!EMAIL_RE.test(form.email)) errs.email = "Enter a valid email address.";

  if (!form.phone.trim()) errs.phone = "Phone number is required.";
  else if (!PHONE_RE.test(form.phone)) errs.phone = "Enter a valid phone number.";

  if (!form.bloodGroup) errs.bloodGroup = "Please select a blood group.";

  if (!form.password) errs.password = "Password is required.";
  else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
    errs.password = "Password must contain letters and numbers.";

  if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password.";
  else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";

  return errs;
}

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", bloodGroup: "", password: "", confirmPassword: "",
  });
  const [touched, setTouched]           = useState({});
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError]   = useState("");
  const navigate = useNavigate();

  const fieldErrors = validate(form);

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const err = (field) => touched[field] && fieldErrors[field];

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError("");
    // Mark all fields touched to show all errors
    setTouched({ name: true, email: true, phone: true, bloodGroup: true, password: true, confirmPassword: true });
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name: form.name, email: form.email, phone: form.phone,
        bloodGroup: form.bloodGroup, password: form.password,
      });
      navigate("/login");
    } catch (e) {
      setServerError(e.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const perks = [
    { icon: CheckCircle2, text: "Digital donation certificates" },
    { icon: Heart,        text: "Emergency blood request alerts" },
    { icon: Users,        text: "Connect with 500+ hospitals" },
    { icon: ShieldCheck,  text: "100% secure & HIPAA compliant" },
  ];

  const passwordsMatch   = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT HERO PANEL ── */}
      <div className="relative lg:w-[45%] min-h-[260px] lg:min-h-screen flex flex-col justify-between overflow-hidden">
        <img src={bgImage} alt="Community donors" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/92 via-red-900/80 to-rose-800/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-red-500/25 blur-3xl" />
        <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-rose-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center flex-1 px-8 sm:px-12 py-12 lg:py-0">
          <div className="flex items-center gap-2.5 mb-10 lg:mb-14">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
              <Droplets size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Blood<span className="text-red-300">Connect</span>
            </span>
          </div>

          <p className="text-red-300 text-sm font-bold tracking-[0.25em] uppercase mb-3">Join the Community</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.05] mb-5">
            Be a Hero.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-rose-200">Save Lives.</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs mb-10">
            One registration. Unlimited impact. Your blood can save up to 3 lives per donation.
          </p>

          <div className="space-y-3 hidden sm:block">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Icon size={14} className="text-red-300" />
                </div>
                <p className="text-white/75 text-sm font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 px-8 sm:px-12 pb-8 hidden lg:flex items-center gap-2">
          <Heart size={14} className="text-red-400 fill-red-400" />
          <p className="text-white/40 text-xs font-semibold">© 2026 BloodConnect · Saving lives together</p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50/30 px-5 py-10 sm:px-10">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Droplets size={18} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">Blood<span className="text-red-600">Connect</span></span>
          </div>

          <div className="mb-7">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Create account</h2>
            <p className="text-slate-400 mt-2 text-sm">Fill in your details to get started</p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleRegister} noValidate className="space-y-4">

            {/* Row 1: Name + Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  type="text" placeholder="John Doe" value={form.name}
                  onChange={set("name")} onBlur={touch("name")}
                  className={inputCls + (err("name") ? " border-red-400 focus:border-red-400 focus:ring-red-50" : "")}
                />
                {err("name") && <p className={errCls}>{fieldErrors.name}</p>}
              </div>
              <div>
                <label className={labelCls}>Blood Group</label>
                <div className="relative">
                  <select
                    value={form.bloodGroup} onChange={set("bloodGroup")} onBlur={touch("bloodGroup")}
                    className={inputCls + " appearance-none cursor-pointer pr-10" + (err("bloodGroup") ? " border-red-400 focus:border-red-400 focus:ring-red-50" : "")}
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g === "Select blood group" ? "" : g}>{g}</option>
                    ))}
                  </select>
                  <Droplets size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
                {err("bloodGroup") && <p className={errCls}>{fieldErrors.bloodGroup}</p>}
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email" placeholder="you@example.com" value={form.email}
                  onChange={set("email")} onBlur={touch("email")}
                  className={inputCls + (err("email") ? " border-red-400 focus:border-red-400 focus:ring-red-50" : "")}
                />
                {err("email") && <p className={errCls}>{fieldErrors.email}</p>}
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input
                  type="tel" placeholder="+91 9876543210" value={form.phone}
                  onChange={set("phone")} onBlur={touch("phone")}
                  className={inputCls + (err("phone") ? " border-red-400 focus:border-red-400 focus:ring-red-50" : "")}
                />
                {err("phone") && <p className={errCls}>{fieldErrors.phone}</p>}
              </div>
            </div>

            {/* Row 3: Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                    value={form.password} onChange={set("password")} onBlur={touch("password")}
                    className={inputCls + " pr-11" + (err("password") ? " border-red-400 focus:border-red-400 focus:ring-red-50" : "")}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {err("password") && <p className={errCls}>{fieldErrors.password}</p>}
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"} placeholder="Repeat password"
                    value={form.confirmPassword} onChange={set("confirmPassword")} onBlur={touch("confirmPassword")}
                    className={`${inputCls} pr-11
                      ${err("confirmPassword") ? "border-red-400 focus:border-red-400 focus:ring-red-50" : ""}
                      ${!err("confirmPassword") && passwordsMatch ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-50" : ""}
                    `}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {err("confirmPassword")
                  ? <p className={errCls}>{fieldErrors.confirmPassword}</p>
                  : form.confirmPassword && (
                    <p className={`text-xs mt-1.5 font-semibold flex items-center gap-1 ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? "bg-emerald-500" : "bg-red-500"}`} />
                      {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                    </p>
                  )
                }
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full flex items-center justify-center gap-2 py-4 mt-1 rounded-2xl text-white font-black text-sm shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(135deg, #c0392b 0%, #e74c3c 50%, #c0392b 100%)" }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-300 font-bold">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Already have an account?</p>
            <Link to="/login" className="inline-flex items-center gap-1 text-sm font-black text-red-600 hover:text-red-700 transition-colors">
              Login Now <ChevronRight size={14} />
            </Link>
          </div>

          <p className="text-center text-xs text-slate-300 mt-6">
            By registering you agree to our{" "}
            <a href="#" className="underline hover:text-slate-500 transition-colors">Terms</a>
            {" & "}
            <a href="#" className="underline hover:text-slate-500 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2";
const inputCls = "w-full px-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all shadow-sm";
const errCls   = "text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500 before:flex-shrink-0";
