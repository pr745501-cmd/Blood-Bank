import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Droplets, MapPin, Phone, Calendar,
  CheckCircle2, HeartPulse, ArrowRight, AlertCircle,
  Clock, Shield, Award, ChevronRight, Loader2, ClipboardList,
  ChevronLeft, ArrowLeft, Info, FileText, BadgeCheck, Stethoscope
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDERS = ["Male", "Female", "Other"];
const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

function validateStep0(form) {
  const e = {};
  if (!form.name.trim()) e.name = "Full name is required.";
  if (!form.bloodGroup) e.bloodGroup = "Blood group is required.";
  if (!form.mobile.trim()) e.mobile = "Mobile number is required.";
  else if (!PHONE_RE.test(form.mobile)) e.mobile = "Enter a valid phone number.";
  if (!form.city.trim()) e.city = "City is required.";
  return e;
}

function validateStep1(form) {
  const e = {};
  if (!form.age) e.age = "Age is required.";
  else if (Number(form.age) < 18 || Number(form.age) > 65) e.age = "Age must be between 18 and 65.";
  if (!form.gender) e.gender = "Gender is required.";
  return e;
}

const STEPS = [
  { id: 0, label: "Personal Information", desc: "Contact details & location" },
  { id: 1, label: "Medical Assessment", desc: "Basic health screening parameters" },
  { id: 2, label: "Review & Confirm", desc: "Finalize registration" },
];

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: "easeOut" }
};

export default function Donor() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [cooldownMsg, setCooldownMsg] = useState("");
  const [quizGate, setQuizGate] = useState(null);
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    name: "", bloodGroup: "", city: "",
    address: "", mobile: "", gender: "",
    age: "", lastDonationDate: ""
  });

  const step0Errors = validateStep0(formData);
  const step1Errors = validateStep1(formData);
  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));
  const err0 = (f) => touched[f] && step0Errors[f];
  const err1 = (f) => touched[f] && step1Errors[f];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?._id || user?.id;
    const quizPassed = localStorage.getItem("quizPassed") === "true";

    if (quizPassed) { setQuizGate(false); }
    else if (!userId) { setQuizGate(true); }
    else {
      axios.get(`http://localhost:5000/api/donor/user/${userId}`)
        .then(() => setQuizGate(false))
        .catch(() => setQuizGate(true));
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        bloodGroup: user.bloodGroup || "",
        city: user.city || "",
        mobile: user.phone || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setServerError("");
  };

  const nextStep = () => {
    if (step === 0) {
      setTouched(t => ({ ...t, name: true, bloodGroup: true, mobile: true, city: true }));
      if (Object.keys(step0Errors).length > 0) return;
    }
    if (step === 1) {
      setTouched(t => ({ ...t, age: true, gender: true }));
      if (Object.keys(step1Errors).length > 0) return;
    }
    setServerError("");
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setCooldownMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post("http://localhost:5000/api/donor", formData, { headers });
      await axios.post("http://localhost:5000/api/donor/donate", {}, { headers });

      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || "An error occurred during submission. Please try again.";
      if (msg.toLowerCase().includes("donate after") || msg.toLowerCase().includes("cooldown")) {
        setCooldownMsg(msg);
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── LOADING STATE ──
  if (quizGate === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  // ── GATE BLOCKED STATE ──
  if (quizGate === true) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 p-8 md:p-10 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <ClipboardList size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Eligibility Screening Required</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">
            As part of our commitment to patient and donor safety, we require all new donors to complete a brief medical eligibility questionnaire before registering.
          </p>
          
          <div className="space-y-4 mb-8 text-left bg-slate-50 rounded-lg p-5 border border-slate-100">
             <div className="flex items-start gap-3">
               <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
               <p className="text-sm text-slate-700">Adheres to national health guidelines</p>
             </div>
             <div className="flex items-start gap-3">
               <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
               <p className="text-sm text-slate-700">Takes approximately 2 minutes to complete</p>
             </div>
             <div className="flex items-start gap-3">
               <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
               <p className="text-sm text-slate-700">Maintains complete medical privacy (HIPAA)</p>
             </div>
          </div>
          
          <button
            onClick={() => navigate("/eligibility-quiz")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Start Eligibility Questionnaire <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  // ── SUCCESS STATE ──
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg border border-slate-200 p-10 md:p-14 max-w-lg w-full text-center"
        >
          <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50">
             <BadgeCheck size={40} className="text-emerald-500" strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Registration Successful</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Thank you for registering as a blood donor. Your commitment plays a vital role in our healthcare system. You will be cleared for immediate donation based on your history.
          </p>
          
          <div className="bg-slate-50 rounded-lg p-5 mb-8 text-left border border-slate-100 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Next Steps</h4>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
              <span className="text-sm text-slate-700">Account status updated to Active Donor</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
              <span className="text-sm text-slate-700">Initial donation recorded in your medical history</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
              <span className="text-sm text-slate-700">Digital certificate is now available in your portal</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate("/my-donations")}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors"
            >
              View History
            </button>
            <button onClick={() => navigate("/certificates")}
              className="flex-1 bg-white text-slate-700 border border-slate-300 py-2.5 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-colors"
            >
              View Certificate
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── MAIN FORM STATE ──
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* ── Header Area ── */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-20 md:pb-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
           <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold mb-5">
                <Shield size={14} /> Official Donor Registry
             </div>
             <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
               Donor Registration
             </h1>
             <p className="text-slate-500 text-lg">
               Join our trusted network of donors. Your contribution ensures a stable, safe blood supply for medical emergencies and ongoing care.
             </p>
           </div>
           
           <div className="flex gap-4 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 min-w-[140px]">
                 <p className="text-2xl font-bold text-slate-900">10k+</p>
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Active Donors</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 min-w-[140px]">
                 <p className="text-2xl font-bold text-slate-900">30k+</p>
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Lives Saved</p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── Left Sidebar (Progress) ── */}
          <div className="lg:w-1/3 xl:w-1/4 shrink-0 mt-2">
             <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-8">
               <h3 className="text-sm font-semibold text-slate-900 mb-6">Registration Steps</h3>
               
               <div className="space-y-6">
                 {STEPS.map((s, i) => {
                   const isActive = step === s.id;
                   const isCompleted = step > s.id;
                   return (
                     <div key={s.id} className="flex relative">
                        {/* Connecting line */}
                        {i !== STEPS.length - 1 && (
                          <div className={`absolute left-3.5 top-8 bottom-[-24px] w-0.5 ${isCompleted ? 'bg-blue-600' : 'bg-slate-100'}`} />
                        )}
                        <div className="flex items-start gap-4">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 transition-colors z-10 bg-white
                            ${isActive ? 'border-blue-600 text-blue-600' : 
                              isCompleted ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-400'}`}
                          >
                             {isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : <span className="text-xs font-bold">{s.id + 1}</span>}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold transition-colors ${isActive ? 'text-blue-700' : isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                              {s.label}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 leading-snug">
                              {s.desc}
                            </p>
                          </div>
                        </div>
                     </div>
                   );
                 })}
               </div>

               <hr className="my-6 border-slate-100" />
               <div className="flex items-start gap-3">
                 <Shield size={16} className="text-slate-400 shrink-0 mt-0.5" />
                 <p className="text-xs text-slate-500 leading-relaxed">
                   Your medical data is encrypted and securely stored in compliance with standard health privacy regulations.
                 </p>
               </div>
             </div>
          </div>

          {/* ── Main Form Canvas ── */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
             
             {/* Dynamic Alerts */}
             <AnimatePresence>
                {serverError && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-rose-50 border-b border-rose-100">
                    <div className="p-4 px-6 flex items-start gap-3">
                      <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-rose-800">{serverError}</p>
                    </div>
                  </motion.div>
                )}
                {cooldownMsg && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-amber-50 border-b border-amber-100">
                    <div className="p-4 px-6 flex items-start gap-3">
                      <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Donation Deferral Notice</p>
                        <p className="text-sm text-amber-800 mt-1">{cooldownMsg}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-8 md:p-10 flex-1 relative">
                 <AnimatePresence mode="wait">
                    
                    {/* ── STEP 0: Identity ── */}
                    {step === 0 && (
                      <motion.div key="step0" {...PAGE_TRANSITION} className="space-y-8">
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                           <p className="text-slate-500 text-sm mt-1">Please provide your contact details and primary location.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <InputGroup label="Full Name" required>
                             <InputField icon={User} name="name" value={formData.name}
                               onChange={handleChange} onBlur={() => touch("name")}
                               placeholder="John Doe" hasError={!!err0("name")} />
                             {err0("name") && <FieldError msg={step0Errors.name} />}
                           </InputGroup>
                           <InputGroup label="Blood Group" required>
                             <div className="relative">
                               <select name="bloodGroup" value={formData.bloodGroup}
                                 onChange={handleChange} onBlur={() => touch("bloodGroup")}
                                 className={`w-full bg-white border rounded-lg py-2.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 outline-none appearance-none transition-shadow shadow-sm ${err0("bloodGroup") ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}>
                                 <option value="">Select blood group</option>
                                 {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                               </select>
                               <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                             </div>
                             {err0("bloodGroup") && <FieldError msg={step0Errors.bloodGroup} />}
                           </InputGroup>
                           <InputGroup label="Mobile Number" required>
                             <InputField icon={Phone} name="mobile" value={formData.mobile}
                               onChange={handleChange} onBlur={() => touch("mobile")}
                               placeholder="+1 (555) 000-0000" hasError={!!err0("mobile")} />
                             {err0("mobile") && <FieldError msg={step0Errors.mobile} />}
                           </InputGroup>
                           <InputGroup label="City" required>
                             <InputField icon={MapPin} name="city" value={formData.city}
                               onChange={handleChange} onBlur={() => touch("city")}
                               placeholder="e.g. New York" hasError={!!err0("city")} />
                             {err0("city") && <FieldError msg={step0Errors.city} />}
                           </InputGroup>
                           <div className="md:col-span-2">
                             <InputGroup label="Residential Address">
                               <textarea name="address" value={formData.address} onChange={handleChange}
                                 placeholder="Street address, apartment, suite, etc."
                                 rows={3}
                                 className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-shadow shadow-sm placeholder:text-slate-400" />
                             </InputGroup>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                           <button onClick={nextStep}
                             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                             Continue <ArrowRight size={16} />
                           </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 1: Medical ── */}
                    {step === 1 && (
                      <motion.div key="step1" {...PAGE_TRANSITION} className="space-y-8">
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">Medical Assessment</h2>
                           <p className="text-slate-500 text-sm mt-1">Provide accurate health details to ensure safe donation procedures.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <InputGroup label="Age" required>
                             <InputField icon={Calendar} type="number" name="age" min="18" max="65"
                               value={formData.age} onChange={handleChange} onBlur={() => touch("age")}
                               placeholder="e.g. 28" hasError={!!err1("age")} />
                             {err1("age") && <FieldError msg={step1Errors.age} />}
                           </InputGroup>
                           <InputGroup label="Gender" required>
                             <div className="relative">
                               <select name="gender" value={formData.gender}
                                 onChange={handleChange} onBlur={() => touch("gender")}
                                 className={`w-full bg-white border rounded-lg py-2.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 outline-none appearance-none transition-shadow shadow-sm ${err1("gender") ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}>
                                 <option value="">Select gender</option>
                                 {GENDERS.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                               </select>
                               <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                             </div>
                             {err1("gender") && <FieldError msg={step1Errors.gender} />}
                           </InputGroup>
                           <div className="md:col-span-2">
                             <InputGroup label="Last Donation Date (If applicable)">
                               <InputField icon={Clock} type="date" name="lastDonationDate" value={formData.lastDonationDate} onChange={handleChange} />
                             </InputGroup>
                           </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                           <div className="flex items-center gap-2 mb-4">
                             <Stethoscope size={18} className="text-slate-600" />
                             <p className="text-sm font-semibold text-slate-800">Pre-Donation Medical Consent</p>
                           </div>
                           <div className="space-y-3">
                             {[
                               "I have not donated blood in the last 90 days.",
                               "I am not currently taking prescribed antibiotics or blood thinners.",
                               "I feel healthy and have not experienced symptoms of illness today."
                             ].map((item, i) => (
                               <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                 <div className="relative flex items-center justify-center mt-0.5">
                                    <input type="checkbox" required className="w-4 h-4 appearance-none border border-slate-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer shadow-sm" />
                                    <CheckCircle2 size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                 </div>
                                 <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{item}</span>
                               </label>
                             ))}
                           </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                           <button onClick={() => { setStep(0); setServerError(""); }}
                             className="text-slate-500 hover:text-slate-800 font-medium py-2.5 px-4 transition-colors flex items-center gap-2 text-sm">
                             <ArrowLeft size={16} /> Back
                           </button>
                           <button onClick={nextStep}
                             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                             Review <ArrowRight size={16} />
                           </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 2: Confirm ── */}
                    {step === 2 && (
                      <motion.div key="step2" {...PAGE_TRANSITION} className="space-y-8">
                         <div>
                           <h2 className="text-xl font-bold text-slate-900">Review & Confirm</h2>
                           <p className="text-slate-500 text-sm mt-1">Please verify your information before submitting the registration.</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                           <h3 className="text-sm font-semibold text-slate-800 mb-4 px-1">Registration Summary</h3>
                           <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                             {[
                               { label: "Full Name", value: formData.name },
                               { label: "Blood Group", value: formData.bloodGroup, isHighlight: true },
                               { label: "Mobile", value: formData.mobile },
                               { label: "City", value: formData.city },
                               { label: "Age", value: formData.age ? `${formData.age} yrs` : "-" },
                               { label: "Gender", value: formData.gender }
                             ].map((row, i) => (
                               <div key={i} className={`flex items-center justify-between p-3.5 px-5 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                                 <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                                 <span className={`text-sm font-semibold ${row.isHighlight ? 'text-blue-600' : 'text-slate-900'}`}>{row.value || "-"}</span>
                               </div>
                             ))}
                           </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 flex gap-4">
                           <div className="shrink-0 mt-0.5">
                             <Info size={18} className="text-blue-600" />
                           </div>
                           <div>
                             <p className="text-sm font-semibold text-blue-900 mb-1">Acknowledgement</p>
                             <p className="text-sm text-blue-800/80 leading-relaxed">
                               By confirming, you agree to officially register your details in our donor network. A certificate of commitment will be issued upon completion.
                             </p>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                           <button onClick={() => { setStep(1); setServerError(""); }}
                             className="text-slate-500 hover:text-slate-800 font-medium py-2.5 px-4 transition-colors flex items-center gap-2 text-sm">
                             <ArrowLeft size={16} /> Edit Details
                           </button>
                           <button onClick={handleSubmit} disabled={loading}
                             className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                             {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Confirm Registration"}
                           </button>
                        </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CUSTOM COMPONENTS ── //

function InputGroup({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700 ml-0.5 flex gap-1">
        {label}
        {required && <span className="text-rose-500 font-bold" title="Required">*</span>}
      </label>
      {children}
    </div>
  );
}

function InputField({ icon: Icon, type = "text", hasError = false, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        {...props}
        className={`w-full bg-white border rounded-lg py-2.5 ${Icon ? "pl-11" : "px-4"} pr-4 text-sm font-medium text-slate-900 focus:ring-2 outline-none transition-shadow shadow-sm placeholder:text-slate-400
          ${hasError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}
      />
    </div>
  );
}

function FieldError({ msg }) {
  return (
    <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
      {msg}
    </p>
  );
}
