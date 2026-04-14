import { useState, useEffect } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, MapPin, Phone, AlertTriangle,
  Calendar, MessageSquare, Activity, ArrowRight,
  CheckCircle2, Loader2, ChevronRight, Clock,
  HeartPulse, ShieldCheck, AlertCircle, ArrowLeft,
  Shield, Building2, Info, Plus, Minus
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const URGENCY_CONFIG = {
  Normal:   { color: "text-blue-700 bg-blue-50 border-blue-200",  dot: "bg-blue-500",  ring: "focus:ring-blue-500/20" },
  Urgent:   { color: "text-amber-700 bg-amber-50 border-amber-200",  dot: "bg-amber-500",  ring: "focus:ring-amber-500/20" },
  Critical: { color: "text-rose-700 bg-rose-50 border-rose-200",   dot: "bg-rose-500",  ring: "focus:ring-rose-500/20" },
};

const STEPS = [
  { id: 0, label: "Clinical Details", desc: "Patient and facility info" },
  { id: 1, label: "Logistics", desc: "Point of contact & urgency" },
  { id: 2, label: "Review & Submit", desc: "Final verification" },
];

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: "easeOut" }
};

export default function Request() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patientName: "", bloodGroup: "", units: "1",
    hospital: "", city: "",
    contactName: "", contactPhone: "",
    urgency: "Normal", requiredDate: "", notes: ""
  });

  // Pre-fill contact from logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) {
      setForm(prev => ({
        ...prev,
        contactName: user.name || "",
        contactPhone: user.phone || "",
        city: user.city || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.patientName.trim()) return "Patient name is required.";
      if (!form.bloodGroup) return "Blood group is required.";
      if (!form.units || Number(form.units) < 1) return "Units must be at least 1.";
      if (!form.hospital.trim()) return "Facility name is required.";
      if (!form.city.trim()) return "City is required.";
    }
    if (step === 1) {
      if (!form.contactName.trim()) return "Primary contact name is required.";
      if (!form.contactPhone.trim()) return "Contact phone number is required.";
      if (!form.urgency) return "Urgency classification is required.";
      if (!form.requiredDate) return "Target date is required.";
    }
    return "";
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/request/create", form);
      setSuccess(res.data.request);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to broadcast request. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS STATE ──
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg border border-slate-200 p-10 md:p-14 max-w-lg w-full text-center"
        >
          <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
             <Activity size={40} className="text-blue-600" strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Priority Request Active</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Your clinical blood request has been successfully registered and is currently broadcasting to local compatible donors in <span className="font-semibold text-slate-700">{form.city}</span>.
          </p>
          
          <div className="bg-slate-50 rounded-lg p-5 mb-8 text-left border border-slate-100">
             <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Transmission Data</h4>
             <div className="space-y-3">
               {[
                 { label: "Patient Record", value: form.patientName },
                 { label: "Compatibility", value: form.bloodGroup },
                 { label: "Target Volume", value: `${form.units} Unit(s)` },
                 { label: "Receiving Node", value: form.hospital },
                 { label: "Status Level", value: form.urgency },
               ].map((row, i) => (
                 <div key={i} className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">{row.label}</span>
                   <span className="font-semibold text-slate-900">{row.value}</span>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/my-requests"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Activity size={16} /> Track Status
            </a>
            <button onClick={() => { setSuccess(null); setStep(0); setForm(f => ({ ...f, patientName: "", bloodGroup: "", units: "1", hospital: "", notes: "" })); }}
              className="flex-1 bg-white text-slate-700 border border-slate-300 py-2.5 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-colors">
              Submit Another
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
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-xs font-semibold mb-5">
                <HeartPulse size={14} className="animate-pulse" /> Emergency Procurement
             </div>
             <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
               Clinical Blood Request
             </h1>
             <p className="text-slate-500 text-lg">
               Initiate a priority dispatch request. The system will automatically route your requirements to compatible verified donors within your operational radius.
             </p>
           </div>
           
           <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              {[
                { label: "Immediate Broadcast", desc: "Donors alerted in seconds", icon: Activity },
                { label: "Geo-Fenced Matching", desc: "City-based precision", icon: MapPin },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-md flex items-center justify-center shrink-0">
                     <item.icon size={18} className="text-slate-600" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-900">{item.label}</p>
                     <p className="text-xs font-medium text-slate-500 mt-0.5">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── Left Sidebar (Progress) ── */}
          <div className="lg:w-1/3 xl:w-1/4 shrink-0 mt-2">
             <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-8">
               <h3 className="text-sm font-semibold text-slate-900 mb-6">Dispatch Timeline</h3>
               
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
                 <ShieldCheck size={16} className="text-slate-400 shrink-0 mt-0.5" />
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
                   All requests undergo automated validation against registered hospital databases to prevent fraudulent dispatches.
                 </p>
               </div>
             </div>
          </div>

          {/* ── Main Form Canvas ── */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
             
             {/* Dynamic Alerts */}
             <AnimatePresence>
                {error && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-rose-50 border-b border-rose-100">
                    <div className="p-4 px-6 flex items-start gap-3">
                      <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-rose-800">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-8 md:p-10 flex-1 relative">
                 <AnimatePresence mode="wait">
                    
                    {/* ── STEP 0: Patient Info ── */}
                    {step === 0 && (
                      <motion.div key="step0" {...PAGE_TRANSITION} className="space-y-8">
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">Clinical Data</h2>
                           <p className="text-slate-500 text-sm mt-1">Specify target patient parameters and receiving facility.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <InputGroup label="Patient Legal Name" required>
                             <InputField icon={User} name="patientName" value={form.patientName} onChange={handleChange} placeholder="First Last" />
                           </InputGroup>

                           <InputGroup label="Blood Group Classification" required>
                             <div className="relative">
                               <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                                 className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-4 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none shadow-sm transition-shadow">
                                 <option value="">Select compatible type</option>
                                 {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                               </select>
                               <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                             </div>
                           </InputGroup>

                           <InputGroup label="Target Volume (Units)" required>
                             <div className="flex items-center gap-3">
                               <button type="button" onClick={() => setForm(p => ({ ...p, units: String(Math.max(1, Number(p.units || 1) - 1)) }))}
                                 className="w-11 h-11 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm active:scale-95">
                                 <Minus size={18} />
                               </button>
                               <input type="number" min="1" max="20" name="units" value={form.units} onChange={handleChange}
                                 className="flex-1 text-center bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-base font-semibold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm transition-shadow" />
                               <button type="button" onClick={() => setForm(p => ({ ...p, units: String(Number(p.units || 0) + 1) }))}
                                 className="w-11 h-11 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm active:scale-95">
                                 <Plus size={18} />
                               </button>
                             </div>
                           </InputGroup>

                           <InputGroup label="Receiving Facility" required>
                             <InputField icon={Building2} name="hospital" value={form.hospital} onChange={handleChange} placeholder="General Hospital" />
                           </InputGroup>

                           <InputGroup label="Operational Sector (City)" required>
                             <InputField icon={MapPin} name="city" value={form.city} onChange={handleChange} placeholder="e.g. New York Region" />
                           </InputGroup>

                           <div className="md:col-span-2">
                             <InputGroup label="Clinical Notes / Department">
                               <div className="relative">
                                 <MessageSquare size={18} className="absolute left-3.5 top-3 text-slate-400" />
                                 <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                                   placeholder="Ward number, building, critical protocols..."
                                   className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-shadow shadow-sm placeholder:text-slate-400" />
                               </div>
                             </InputGroup>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                           <button onClick={nextStep}
                             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                             Proceed to Logistics <ArrowRight size={16} />
                           </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ── Step 1: Logistics ── */}
                    {step === 1 && (
                      <motion.div key="step1" {...PAGE_TRANSITION} className="space-y-8">
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">Logistics & Communication</h2>
                           <p className="text-slate-500 text-sm mt-1">Define point of contact and dispatch urgency.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <InputGroup label="Primary Contact Name" required>
                             <InputField icon={User} name="contactName" value={form.contactName} onChange={handleChange} placeholder="Attending officer/relative" />
                           </InputGroup>
                           <InputGroup label="Contact Number" required>
                             <InputField icon={Phone} name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+1 555-0123" />
                           </InputGroup>
                           <InputGroup label="Target Need Date" required>
                             <InputField icon={Calendar} type="date" name="requiredDate" value={form.requiredDate} onChange={handleChange} />
                           </InputGroup>
                        </div>

                        <div className="pt-4">
                           <InputGroup label="Classification Level" required>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                               {["Normal", "Urgent", "Critical"].map(level => {
                                 const cfg = URGENCY_CONFIG[level];
                                 const active = form.urgency === level;
                                 return (
                                   <button key={level} type="button"
                                     onClick={() => { setForm(p => ({ ...p, urgency: level })); setError(""); }}
                                     className={`py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center gap-2
                                       ${active ? `${cfg.color} shadow-sm border-current ring-1 ring-current` : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"}
                                     `}>
                                     <div className={`w-2.5 h-2.5 rounded-full ${active ? cfg.dot : "bg-slate-300"}`} />
                                     {level}
                                   </button>
                                 );
                               })}
                             </div>
                           </InputGroup>
                        </div>

                        {form.urgency === "Critical" && (
                          <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 flex items-start gap-4 animate-in fade-in zoom-in duration-300">
                            <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-rose-900 mb-1">Critical Flag Applied</p>
                              <p className="text-xs text-rose-800 font-medium leading-relaxed">
                                This will bypass standard queuing and immediately alert all matching donors via push dispatch. False flagging may result in account penalties.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                           <button onClick={() => { setStep(0); setError(""); }}
                             className="text-slate-500 hover:text-slate-800 font-medium py-2.5 px-4 transition-colors flex items-center gap-2 text-sm">
                             <ArrowLeft size={16} /> Back
                           </button>
                           <button onClick={nextStep}
                             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                             Final Review <ArrowRight size={16} />
                           </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ── Step 2: Review & Submit ── */}
                    {step === 2 && (
                      <motion.div key="step2" {...PAGE_TRANSITION} className="space-y-8">
                         <div>
                           <h2 className="text-xl font-bold text-slate-900">Transmission Review</h2>
                           <p className="text-slate-500 text-sm mt-1">Audit the clinical data packet before finalizing dispatch.</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                           <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                              <h3 className="text-sm font-semibold text-slate-800">Payload Overview</h3>
                              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${URGENCY_CONFIG[form.urgency].badge}`}>
                                {form.urgency} Priority
                              </div>
                           </div>
                           <div className="p-2 space-y-0.5">
                             {[
                               { label: "Target Patient", value: form.patientName },
                               { label: "Group / Volume", value: <><span className="text-rose-600 mr-2">{form.bloodGroup}</span><span>({form.units} Units)</span></> },
                               { label: "Delivery Node", value: `${form.hospital}, ${form.city}` },
                               { label: "Liaison Officer", value: `${form.contactName} (${form.contactPhone})` },
                               { label: "Execution Date", value: form.requiredDate ? new Date(form.requiredDate).toDateString() : "—" },
                               ...(form.notes ? [{ label: "Notes", value: form.notes }] : []),
                             ].map((row, i) => (
                               <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-slate-100/50 transition-colors gap-2">
                                 <span className="text-sm text-slate-500 font-medium min-w-[140px]">{row.label}</span>
                                 <span className="text-sm font-semibold text-slate-900 sm:text-right">{row.value}</span>
                               </div>
                             ))}
                           </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 flex items-start gap-4">
                          <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Execution Clause</p>
                            <p className="text-xs text-blue-800/90 leading-relaxed font-medium">
                              Submitting this payload initiates real-time matching algorithms. Once a donor accepts, their contact protocol will be unlocked in your admin view.
                            </p>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                           <button onClick={() => { setStep(1); setError(""); }}
                             className="text-slate-500 hover:text-slate-800 font-medium py-2.5 px-4 transition-colors flex items-center gap-2 text-sm">
                             <ArrowLeft size={16} /> Edit Data
                           </button>
                           <button onClick={handleSubmit} disabled={loading}
                             className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                             {loading ? <><Loader2 size={16} className="animate-spin" /> Transmitting...</> : <><Activity size={16} /> Commit Request</>}
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

function InputField({ icon: Icon, type = "text", ...props }) {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        {...props}
        className={`w-full bg-white border border-slate-300 rounded-lg py-2.5 ${Icon ? "pl-11" : "px-4"} pr-4 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow shadow-sm placeholder:text-slate-400`}
      />
    </div>
  );
}