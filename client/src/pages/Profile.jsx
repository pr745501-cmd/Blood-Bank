import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import { 
  User, Mail, Phone, MapPin, HeartPulse, Calendar, 
  Save, ShieldAlert, BriefcaseMedical, Camera, CheckCircle, 
  Activity, AlertCircle, HardDrive
} from "lucide-react";

export default function Profile() {

  const token = localStorage.getItem("token");
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [isDonor, setIsDonor] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isOwner, setIsOwner] = useState(true); // 🔥 NEW

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodGroup: "",
    lastDonation: "",
    address: "",
    emergencyName: "",
    emergencyContact: "",
    allergies: "",
    medications: "",
    conditions: "",
    surgery: ""
  });

  /* ================= FETCH LOGIC ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        const userId = loggedUser?._id || loggedUser?.id;

        // 🔥 OWNER CHECK
        if (id) {
          setIsOwner(userId === id);
        } else {
          setIsOwner(true);
        }

        /* ================= OTHER USER PROFILE ================= */
        if (id) {
          const res = await axios.get(
            `http://localhost:5000/api/donor/${id}`
          );

          const data = res.data;

          setUser(data);

          setForm({
            fullName: data.name || "",
            email: data.email || "",
            phone: data.mobile || "",
            bloodGroup: data.bloodGroup || "",
            lastDonation: data.lastDonationDate
              ? data.lastDonationDate.slice(0, 10)
              : "",
            address: data.address || "",
            emergencyName: data.emergencyName || "",
            emergencyContact: data.emergencyContact || "",
            allergies: data.allergies || "",
            medications: data.medications || "",
            conditions: data.conditions || "",
            surgery: data.surgery || ""
          });

          setIsDonor(true);
          setAvailability(data.availability ?? false);

          return;
        }

        /* ================= OWN PROFILE ================= */
        const [userRes, donorRes] = await Promise.all([
          axios.get("http://localhost:5000/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          userId
            ? axios
                .get(`http://localhost:5000/api/donor/user/${userId}`)
                .catch(() => null)
            : Promise.resolve(null)
        ]);

        const userData = userRes.data;
        const donorData = donorRes?.data;

        setUser(userData);

        setForm({
          fullName: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          bloodGroup: userData.bloodGroup || "",
          lastDonation: donorData?.lastDonationDate
            ? donorData.lastDonationDate.slice(0, 10)
            : "",
          address: userData.address || "",
          emergencyName: userData.emergencyName || "",
          emergencyContact: userData.emergencyContact || "",
          allergies: userData.allergies || "",
          medications: userData.medications || "",
          conditions: userData.conditions || "",
          surgery: userData.surgery || ""
        });

        if (donorData) {
          setIsDonor(true);
          setAvailability(donorData.availability ?? false);
        } else {
          setIsDonor(false);
          setAvailability(false);
        }

      } catch (err) {
        // silently ignore
      }
    };

    fetchData();
  }, [token, id]);

  /* ================= SAVE ================= */
  const handleSubmit = async () => {
    if (!isOwner) return; // 🔥 BLOCK EDIT

    try {
      setLoading(true);

      await axios.put(
        "http://localhost:5000/api/user/profile",
        form,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= AVAILABILITY ================= */
  const toggleAvailability = async () => {
    if (!isOwner) return; // 🔥 BLOCK

    try {
      const newStatus = !availability;

      await axios.patch(
        "http://localhost:5000/api/donor/status",
        { availability: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAvailability(newStatus);

    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  const handleChange = (e) => {
    if (!isOwner) return; // 🔥 BLOCK EDIT
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-red-100 overflow-x-hidden">
      
      {/* ANIMATION ENGINE */}
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-emerald { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .animate-slide-up { animation: slideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 1.2s ease forwards; }
        .status-pulse { animation: pulse-emerald 2s infinite; }
      `}</style>

      {/* 1. HERO ARCHIVE HEADER */}
      <div className="relative h-80 md:h-[450px] bg-[#881337] overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-red-500 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-6 pt-20 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 animate-slide-up">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="text-red-400" size={24} />
                <span className="text-red-300 font-black tracking-[0.4em] text-xs uppercase">Encrypted Database</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
                Donor <span className="text-red-500">Archive</span>
              </h1>
              <p className="text-red-100/70 text-lg font-medium mt-4 max-w-xl border-l-2 border-red-500/30 pl-6">
                Official medical registry for verified blood donors. All data is synchronized with the central hematology network.
              </p>
            </div>

            {isOwner ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`group flex items-center gap-4 px-10 py-5 rounded-[2rem] font-black shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${
                  saveSuccess ? "bg-emerald-500 text-white" : "bg-white text-rose-900 hover:scale-105"
                }`}
              >
                {loading ? (
                  <div className="animate-spin h-6 w-6 border-3 border-rose-900 border-t-transparent rounded-full" />
                ) : saveSuccess ? (
                  <CheckCircle size={24} className="animate-bounce" />
                ) : (
                  <Save size={22} className="group-hover:rotate-12 transition-transform"/>
                )}
                <span className="tracking-widest">{loading ? "SYNCING..." : saveSuccess ? "DATA SECURED" : "SYNC ARCHIVE"}</span>
              </button>
            ) : (
              <span className="flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black bg-white/20 text-white/70 border border-white/30 text-sm tracking-widest cursor-default select-none">
                VIEW ONLY
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN PROFILE INTERFACE */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 md:-mt-32 relative z-20 pb-24">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 p-6 md:p-14">
          
          {/* HEADER INFO SECTION */}
          <div className="flex flex-col lg:flex-row items-center gap-12 border-b border-slate-100 pb-14">
            <div className="relative group cursor-pointer">
              <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-red-600 via-rose-700 to-rose-950 rounded-[3.5rem] flex items-center justify-center text-7xl font-black text-white shadow-2xl transition-all duration-1000 group-hover:rotate-6 group-hover:scale-110">
                {form.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-4 rounded-3xl shadow-xl border border-slate-100 text-red-600 group-hover:bg-red-50 transition-colors">
                <Camera size={28} />
              </div>
            </div>

            <div className="text-center lg:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-5 mb-6">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                  {form.fullName || "Unregistered Account"}
                </h2>
                {isDonor && (
                   <span className="inline-flex items-center px-5 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-emerald-100 animate-fade-in">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5 status-pulse"></div>
                    Verified Registry
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <StatBadge icon={<HeartPulse size={18}/>} label={form.bloodGroup || "Pending Lab"} color="bg-red-50 text-red-600 border-red-100" />
                <StatBadge icon={<Calendar size={18}/>} label={form.lastDonation ? `Cycle: ${form.lastDonation}` : "No Entry"} color="bg-slate-50 text-slate-600 border-slate-200" />
                <StatBadge icon={<Mail size={18}/>} label={form.email} color="bg-blue-50 text-blue-600 border-blue-100" />
              </div>
            </div>

            {/* LIVE STATUS INTERFACE */}
             {isDonor && (
        <div className="bg-slate-50/50 p-7 rounded-[3rem] border border-slate-100 text-center min-w-[260px] shadow-inner">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5">
            Broadcasting Status
          </p>

          <button
            onClick={isOwner ? toggleAvailability : undefined}
            disabled={!isOwner}
            className={`w-full py-5 rounded-2xl font-black text-[11px] tracking-[0.2em] transition-all duration-700 ${
              availability 
              ? "bg-emerald-500 text-white status-pulse" 
              : "bg-slate-200 text-slate-500"
            } ${!isOwner ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
          >
            {availability ? "● ARCHIVE LIVE" : "○ ARCHIVE OFFLINE"}
          </button>
        </div>
      )}

    </div>


          {/* FORM GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 mt-16 animate-slide-up">
            
            <div className="lg:col-span-2 space-y-20">
              {/* PRIMARY INFO */}
              <section className="space-y-12">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-red-100 rounded-2xl text-red-600 shadow-sm"><User size={28}/></div>
                  <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Identity Matrix</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <InputBox label="Full Legal Name" name="fullName" value={form.fullName} onChange={handleChange} icon={<User size={18}/>} isOwner={isOwner} />
                  <InputBox label="Primary Communication" name="email" value={form.email} onChange={handleChange} icon={<Mail size={18}/>} isOwner={isOwner} />
                  <InputBox label="Mobile Link" name="phone" value={form.phone} onChange={handleChange} icon={<Phone size={18}/>} isOwner={isOwner} />
                  
                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2 group-focus-within:text-red-500 transition-colors">Hematology Group</label>
                    <div className="relative">
                       <select 
                        name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                        disabled={!isOwner}
                        className={`w-full bg-slate-50/50 border-2 border-transparent rounded-[1.5rem] p-5 font-bold text-slate-700 outline-none transition-all appearance-none shadow-inner ${isOwner ? "focus:bg-white focus:border-red-500 cursor-pointer" : "cursor-default opacity-80"}`}
                      >
                        <option value="">Matrix Pending</option>
                        {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                      <HeartPulse className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputBox label="Residential Geolocation" name="address" value={form.address} onChange={handleChange} icon={<MapPin size={18}/>} isOwner={isOwner} />
                  </div>
                </div>
              </section>

              {/* EMERGENCY SECTION */}
              <section className="space-y-10 p-10 bg-rose-50/50 border border-rose-100 rounded-[3rem] relative overflow-hidden">
                <AlertCircle className="absolute -bottom-4 -right-4 text-rose-200 opacity-20" size={120} />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="p-4 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-200"><ShieldAlert size={28}/></div>
                  <h3 className="text-3xl font-black text-rose-900 uppercase tracking-tighter italic">Emergency Protocols</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                   <InputBox label="Emergency Contact Name" name="emergencyName" value={form.emergencyName} onChange={handleChange} icon={<User size={18}/>} isOwner={isOwner} />
                   <InputBox label="Emergency Direct Line" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} icon={<Phone size={18}/>} isOwner={isOwner} />
                </div>
              </section>
            </div>

            {/* CLINICAL SIDEBAR */}
            <div className="space-y-10">
              <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                <div className="absolute -top-16 -right-16 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 group-hover:scale-150 group-hover:rotate-12">
                  <BriefcaseMedical size={350} className="text-slate-900" />
                </div>

                <div className="flex items-center gap-5 mb-12 relative z-10">
                  <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl"><Activity size={26} /></div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Clinical Log</h3>
                </div>

                <div className="space-y-10 relative z-10">
                  <MedicalArea label="Hematologic Allergies" name="allergies" value={form.allergies} onChange={handleChange} color="bg-rose-50/30 border-rose-100 focus:border-red-400 text-rose-950" isOwner={isOwner} />
                  <MedicalArea label="Active Medications" name="medications" value={form.medications} onChange={handleChange} color="bg-blue-50/30 border-blue-100 focus:border-blue-400 text-blue-950" isOwner={isOwner} />
                  <MedicalArea label="Chronic Observations" name="conditions" value={form.conditions} onChange={handleChange} color="bg-amber-50/30 border-amber-100 focus:border-amber-400 text-amber-950" isOwner={isOwner} />
                  <MedicalArea label="Surgical Archives" name="surgery" value={form.surgery} onChange={handleChange} color="bg-slate-50 border-slate-200 focus:border-slate-500" isOwner={isOwner} />
                </div>
              </div>

              <div className="text-center p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-loose">
                  Data Protection: ISO 27001 Compliant <br /> 
                  <span className="text-red-500">Centralized Security Enabled</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatBadge({ icon, label, color }) {
  return (
    <span className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black border ${color} transition-all hover:-translate-y-2 hover:shadow-2xl cursor-default`}>
      {icon} {label}
    </span>
  );
}

function InputBox({ label, name, value, onChange, icon, isOwner = true }) {
  return (
    <div className="space-y-4 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-3 group-focus-within:text-red-600 transition-colors">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-all duration-500 group-focus-within:scale-110">{icon}</div>}
        <input
          name={name} value={value} onChange={onChange}
          readOnly={!isOwner}
          className={`w-full bg-slate-50/50 border-2 border-transparent rounded-[1.75rem] p-6 ${icon ? 'pl-16' : 'px-8'} font-bold text-slate-700 outline-none transition-all duration-500 shadow-inner ${isOwner ? "focus:bg-white focus:border-red-500 group-hover:shadow-md" : "cursor-default select-text"}`}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      </div>
    </div>
  );
}

function MedicalArea({ label, name, value, onChange, color, isOwner = true }) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-3">{label}</label>
      <textarea
        name={name} value={value} onChange={onChange} rows="2"
        readOnly={!isOwner}
        className={`w-full border-2 ${color} rounded-[1.5rem] p-6 text-sm font-bold outline-none transition-all duration-500 resize-none shadow-inner ${isOwner ? "focus:ring-[15px] focus:ring-opacity-5" : "cursor-default select-text"}`}
        placeholder={`Awaiting clinical data...`}
      />
    </div>
  );
}