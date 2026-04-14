import { useState } from "react";
import API from "../services/api";
import {
  FaUser, FaEnvelope, FaPhone, FaPaperPlane, FaTint, 
  FaLayerGroup, FaExclamationTriangle, FaClock,
  FaArrowLeft, FaShieldAlt
} from "react-icons/fa";

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", subject: "",
    category: "General Inquiry", priority: "Low", message: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await API.post("/contact/create", form);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setForm({
          name: "", email: "", mobile: "", subject: "",
          category: "General Inquiry", priority: "Low", message: ""
        });
      }, 1200);
    } catch (err) {
      setIsSubmitting(false);
      alert("❌ Failed to send message");
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-0 md:p-4">
      
      {/* MAIN CONTAINER */}
      <div className="max-w-6xl w-full grid lg:grid-cols-5 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-200/60 overflow-hidden">
        
        {/* LEFT PANEL: SYSTEM INFO */}
        <div className="lg:col-span-2 bg-[#0f172a] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Blood Drop Watermark */}
          <FaTint className="absolute -bottom-10 -right-10 text-slate-800/40 rotate-12" size={280} />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Support System Active
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none mb-6">
              How can we <br /><span className="text-red-500 text-shadow-glow">help you?</span>
            </h2>
            
            <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-xs">
              Direct access to our medical coordination team for urgent blood requirements or technical help.
            </p>

            <div className="space-y-4">
              <InfoItem icon={<FaClock/>} label="Average Response" value="Under 2 Hours" dark />
              <InfoItem icon={<FaEnvelope/>} label="Support Email" value="help@bloodconnect.com" dark />
              <InfoItem icon={<FaShieldAlt/>} label="Privacy" value="HIPAA Compliant" dark />
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Emergency Hotline</p>
            <p className="text-xl font-mono font-bold text-white mt-1">+1 (800) BLOOD-CON</p>
          </div>
        </div>

        {/* RIGHT PANEL: FORM AREA */}
        <div className="lg:col-span-3 p-6 md:p-12 bg-white flex flex-col justify-center min-h-[600px]">
          {!isSuccess ? (
            <form onSubmit={submit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Submit a Ticket</h3>
                <p className="text-sm text-slate-500">Fill in the details and our team will get back to you.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <InputBox label="Full Name" icon={<FaUser/>} name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
                <InputBox label="Contact Number" icon={<FaPhone/>} name="mobile" value={form.mobile} onChange={handleChange} placeholder="+1 (555) 000" />
              </div>

              <InputBox label="Email Address" icon={<FaEnvelope/>} name="email" value={form.email} onChange={handleChange} placeholder="name@domain.com" type="email" />

              <div className="grid md:grid-cols-2 gap-5">
                <SelectBox label="Inquiry Category" icon={<FaLayerGroup/>} name="category" value={form.category} onChange={handleChange}>
                  <option>General Inquiry</option>
                  <option>Technical Issue</option>
                  <option>Donation Help</option>
                  <option>Emergency Support</option>
                </SelectBox>

                <SelectBox label="Priority Level" icon={<FaExclamationTriangle/>} name="priority" value={form.priority} onChange={handleChange}>
                  <option className="text-green-600 font-bold">Low</option>
                  <option className="text-amber-600 font-bold">Medium</option>
                  <option className="text-red-600 font-bold">High</option>
                </SelectBox>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Message Description</label>
                <textarea 
                  name="message" 
                  value={form.message} 
                  onChange={handleChange} 
                  placeholder="Describe your request in detail..." 
                  rows="4" 
                  className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 outline-none transition-all font-medium text-slate-700 resize-none" 
                  required 
                />
              </div>

              <button 
                disabled={isSubmitting}
                className={`group relative w-full ${isSubmitting ? 'bg-slate-400' : 'bg-red-600'} text-white py-4 rounded-xl font-bold uppercase tracking-widest overflow-hidden transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Dispatch Request
                    </>
                  )}
                </span>
              </button>
            </form>
          ) : (
            /* SUCCESS STATE */
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping scale-150 opacity-20" />
                <div className="bg-red-50 text-red-600 p-10 rounded-full inline-block relative z-10">
                  <FaPaperPlane size={48} />
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-bold text-slate-900">Ticket Received!</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">
                  Your request has been logged. Check your email for a confirmation ticket number.
                </p>
              </div>

              <button 
                onClick={() => setIsSuccess(false)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <FaArrowLeft /> Create New Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* REFINED HELPER COMPONENTS */
function InfoItem({ icon, label, value, dark }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`p-3 rounded-xl transition-colors ${dark ? 'bg-slate-800 text-red-500 group-hover:bg-red-500 group-hover:text-white' : 'bg-red-50 text-red-600'}`}>
        {icon}
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-sm font-bold tracking-tight ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{value}</p>
      </div>
    </div>
  );
}

function InputBox({ label, icon, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex items-center border border-slate-200 rounded-xl px-4 bg-slate-50 focus-within:bg-white focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/5 transition-all">
        <span className="text-slate-400">{icon}</span>
        <input 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          type={type} 
          className="w-full py-3.5 px-3 outline-none bg-transparent font-semibold text-slate-700 placeholder:text-slate-300 text-sm" 
          required 
        />
      </div>
    </div>
  );
}

function SelectBox({ label, icon, name, value, onChange, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex items-center border border-slate-200 rounded-xl px-4 bg-slate-50 focus-within:bg-white focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/5 transition-all">
        <span className="text-slate-400">{icon}</span>
        <select 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="w-full py-3.5 px-3 outline-none bg-transparent font-bold text-slate-700 cursor-pointer text-sm appearance-none"
        >
          {children}
        </select>
      </div>
    </div>
  );
}

export default Contact;