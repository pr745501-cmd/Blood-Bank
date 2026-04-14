import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { registerForCamp } from "../services/campService";
import { X, Calendar, Droplets, Phone, StickyNote, AlertCircle, CheckCircle2, ShieldCheck, User } from "lucide-react";

export default function CampRegisterModal({ camp, onClose }) {

  if (!camp) return null;

  const [user, setUser] = useState(null);
  const [eligible, setEligible] = useState(true);
  const [nextDate, setNextDate] = useState(null);

  const [form, setForm] = useState({
    bloodGroup: "",
    phone: "",
    lastDonationDate: "",
    notes: ""
  });

  /* ================= RESET ================= */
  useEffect(() => {
    setEligible(true);
    setNextDate(null);
    setForm({
      bloodGroup: "",
      phone: "",
      lastDonationDate: "",
      notes: ""
    });
  }, [camp]);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!camp) return;

    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?._id || storedUser?.id;

        if (!storedUser) return;

        setUser(storedUser);

        let donorData = null;

        try {
          const res = await axios.get(
            `http://localhost:5000/api/donor/user/${userId}`
          );
          donorData = res.data;
        } catch { }

        const formatDate = (date) => {
          if (!date) return "";
          const d = new Date(date);
          return d.toISOString().split("T")[0];
        };

        /* ELIGIBILITY */
        if (userId) {
          const nextRes = await axios.get(
            `http://localhost:5000/api/donor/next/${userId}`
          );

          if (nextRes.data?.nextEligible) {
            const next = new Date(nextRes.data.nextEligible);
            next.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            setNextDate(formatDate(next));
            setEligible(today >= next);
          } else {
            setEligible(true);
          }
        }

        /* PREFILL */
        setForm({
          bloodGroup: storedUser?.bloodGroup || "",
          phone: storedUser?.phone || "",
          lastDonationDate: formatDate(donorData?.lastDonationDate),
          notes: ""
        });

      } catch (err) {
        // silently ignore
      }
    };

    fetchData();
  }, [camp]);

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value || ""
    }));
  };

  /* ================= 🔥 FIXED SUBMIT ================= */
  const handleSubmit = async () => {
    if (!form.bloodGroup || !form.phone) {
      alert("Please fill required fields");
      return;
    }

    if (!eligible) {
      alert("You are not eligible");
      return;
    }

    try {
      // ✅ STEP 1: Register
      await registerForCamp(camp._id, form);

      // ✅ STEP 2: Get logged user
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?._id || storedUser?.id;

      // ✅ STEP 3: Get donor
      const donorRes = await axios.get(
        `http://localhost:5000/api/donor/user/${userId}`
      );

      const donorId = donorRes.data._id;

      // ✅ STEP 4: Approve donation (MAIN FIX)
      await axios.patch(
        `http://localhost:5000/api/donor/approve/${donorId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert("Donation successful! Certificate generated 🎉");

      handleClose();

    } catch (err) {
      alert(err.response?.data?.message || "Process failed");
    }
  };

  /* ================= CLOSE ================= */
  const handleClose = () => {
    setUser(null);
    setForm({
      bloodGroup: "",
      phone: "",
      lastDonationDate: "",
      notes: ""
    });

    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-[550px] rounded-[3rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >

        {/* MODERN HEADER WITH GRADIENT (REDIZED) */}
        <div className="bg-slate-900 text-white p-10 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Tactical Enrollment</span>
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                Register <span className="text-red-600">Authorization</span>
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white active:scale-90"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar bg-[#FDFDFD]">

          {/* CAMP INFO CARD (TACTICAL STYLE) */}
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] relative overflow-hidden group shadow-sm">
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
              <Calendar size={120} className="rotate-12" />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-2xl italic mb-2">{camp?.title}</h3>
            <div className="flex flex-wrap gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <MapPin size={14} className="text-red-600" />
                {camp?.location?.city}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={14} className="text-red-600" />
                {new Date(camp?.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* USER PROFILE BREADCRUMB */}
          {user && (
            <div className="flex items-center gap-5 px-2">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-900 border border-slate-200">
                <User size={32} />
              </div>
              <div>
                <p className="font-black text-slate-900 text-xl tracking-tighter italic uppercase leading-none mb-1">{user.name}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">{user.email}</p>
              </div>
            </div>
          )}

          {/* ELIGIBILITY ALERT */}
          {!eligible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-rose-200 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle className="text-rose-600" size={24} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-rose-900 mb-2 italic">Eligibility Restriction</p>
                <p className="text-sm text-rose-800 font-medium leading-relaxed">
                  System analysis confirms a recovery phase. Authorized deployment window opens on <b className="text-rose-950 font-black">{nextDate}</b>.
                </p>
              </div>
            </motion.div>
          )}

          {/* MODERN FORM FIELDS (ENHANCED) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 italic">Genetic Group</label>
              <div className="relative">
                <Droplets className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className="w-full pl-14 pr-10 py-5 bg-white border-2 border-slate-100 rounded-3xl focus:border-slate-900 transition-all outline-none text-slate-900 font-black text-sm appearance-none cursor-pointer italic"
                >
                  <option value="" disabled>Select Type</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                <X className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none rotate-45" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 italic">Contact Channel</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91-XXXXX-XXXXX"
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl focus:border-slate-900 transition-all outline-none text-slate-900 font-black text-sm italic placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 italic">Last Deployment Cycle</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  name="lastDonationDate"
                  value={form.lastDonationDate}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl focus:border-slate-900 transition-all outline-none text-slate-900 font-black text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 italic">Medical Context / Notes</label>
              <div className="relative">
                <StickyNote className="absolute left-5 top-6 w-5 h-5 text-slate-400" />
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any relevant health specifications for the medical officers..."
                  className="w-full pl-14 pr-6 py-6 bg-white border-2 border-slate-100 rounded-3xl focus:border-slate-900 transition-all outline-none text-slate-900 font-medium text-sm min-h-[140px] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STICKY FOOTER */}
        <div className="p-10 border-t border-slate-100 bg-white flex gap-6 shrink-0">
          <button
            onClick={handleClose}
            className="px-8 py-5 border-2 border-slate-100 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all active:scale-95"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!eligible}
            className={`flex-1 px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] text-white shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 italic ${eligible
              ? "bg-slate-900 hover:bg-red-600 shadow-slate-200 hover:shadow-red-200"
              : "bg-slate-200 cursor-not-allowed shadow-none"
              }`}
          >
            {eligible ? (
              <>Authorize <CheckCircle2 size={18} /></>
            ) : "Locked"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
