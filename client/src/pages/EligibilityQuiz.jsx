import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, ChevronRight, ChevronLeft,
  ShieldCheck, AlertTriangle, Droplets, RotateCcw,
  Heart, ArrowRight, BadgeCheck, Sparkles,
  Info, ShieldBan, ClipboardCheck, History,
  Scale, Calendar, Activity, Zap, Star
} from "lucide-react";

const QUESTIONS = [
  {
    id: "age",
    question: "What is your current age group?",
    subtitle: "Age verification ensures physiological maturity for donation.",
    emoji: "🎂",
    icon: Calendar,
    type: "options",
    options: [
      { label: "Under 18 years", value: "under18", disqualify: true, reason: "Donors must be at least 18 years old to safely donate blood. This ensures your body is physically mature enough for the volume collected." },
      { label: "18 – 65 years",  value: "eligible" },
      { label: "Over 65 years",  value: "over65",  disqualify: true, reason: "For safety reasons, donors over 65 require a specific medical checkup and are deferred during self-screening." },
    ],
  },
  {
    id: "weight",
    emoji: "⚖️",
    icon: Scale,
    subtitle: "Weight thresholds ensure blood volume collection is safe for your body mass.",
    question: "Do you weigh 50 kg (110 lbs) or more?",
    type: "yesno",
    noDisqualify: true,
    noReason: "Blood donation volume is calibrated for a minimum body weight of 50kg. Lower weight increases the risk of fatigue and dizziness.",
  },
  {
    id: "feeling",
    emoji: "💪",
    icon: Activity,
    subtitle: "Your immune system must be at full strength to ensure safe donation and recovery.",
    question: "Are you feeling completely well today?",
    type: "yesno",
    noDisqualify: true,
    noReason: "We prioritize your safety. Donors should wait until they are 100% healthy and symptom-free for at least 7 days.",
  },
  {
    id: "recent_donation",
    emoji: "🩸",
    icon: History,
    subtitle: "Recovery gaps allow your body to replenish red cells and iron stores naturally.",
    question: "Have you donated in the last 3 months?",
    type: "yesno",
    yesDisqualify: true,
    yesReason: "The mandatory 90-day waiting period ensures your hemoglobin levels stay healthy and prevents long-term anemia.",
  },
  {
    id: "medications",
    emoji: "💊",
    icon: ShieldBan,
    subtitle: "Certain compounds in the blood can be harmful to vulnerable patients.",
    question: "Are you on any antibiotics or thinners?",
    type: "yesno",
    yesDisqualify: true,
    yesReason: "Antibiotics indicate an active infection, and blood thinners can affect the safety of the collection site.",
  },
  {
    id: "tattoo",
    emoji: "🖊️",
    icon: Sparkles,
    subtitle: "Recent skin penetration requires a window period to rule out potential infections.",
    question: "New tattoo or piercing in last 6 months?",
    type: "yesno",
    yesDisqualify: true,
    yesReason: "A 6-month deferral is standard to ensure absolute blood purity after any body modification procedural risks.",
  },
];

export default function EligibilityQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);

  const currentQ = QUESTIONS[step - 1];
  const totalSteps = QUESTIONS.length;
  const progress = step === 0 ? 0 : Math.round((step / totalSteps) * 100);

  const alreadyPassed = localStorage.getItem("quizPassed") === "true" && step === 0 && result === null;

  function handleNext() {
    if (selected === null) return;
    const q = currentQ;
    let disqualified = false;
    let reason = "";

    if (q.type === "options") {
      const opt = q.options.find((o) => o.value === selected);
      if (opt?.disqualify) { disqualified = true; reason = opt.reason; }
    } else {
      if (selected === "yes" && q.yesDisqualify) { disqualified = true; reason = q.yesReason; }
      if (selected === "no"  && q.noDisqualify)  { disqualified = true; reason = q.noReason;  }
    }

    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (disqualified) { setResult({ eligible: false, reason }); setStep(totalSteps + 1); return; }
    if (step >= totalSteps) {
      setResult({ eligible: true });
      localStorage.setItem("quizPassed", "true");
      setStep(totalSteps + 1);
      return;
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step <= 1) { setStep(0); setAnswers({}); setSelected(null); return; }
    setStep((s) => s - 1);
    setSelected(answers[QUESTIONS[step - 2]?.id] ?? null);
  }

  function restart() { setStep(0); setAnswers({}); setResult(null); setSelected(null); }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4 lg:p-12 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] -ml-24 -mb-24 opacity-40" />
      
      <div className="w-full max-w-4xl z-10">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-10 px-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <Droplets size={22} fill="currentColor" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">BloodConnect <span className="text-rose-600">Screening</span></h3>
           </div>
           {step > 0 && step <= totalSteps && (
             <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
                  <span className="text-xs font-bold text-emerald-600">SECURE ENCRYPTION ACTIVE</span>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <span className="text-sm font-black text-slate-900">{step} / {totalSteps}</span>
             </div>
           )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[500px] flex flex-col">
           
           <AnimatePresence mode="wait">
              {/* ── INTRO ── */}
              {step === 0 && !alreadyPassed && (
                <motion.div 
                   key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                   className="flex-1 flex flex-col md:flex-row"
                >
                   <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center space-y-8 bg-slate-50/50">
                      <div className="space-y-4">
                         <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-rose-600 border border-slate-100">
                            <Activity size={32} strokeWidth={2.5} />
                         </div>
                         <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                            Donor <br /> <span className="text-rose-600">Readiness</span>
                         </h1>
                      </div>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed">
                         Safety is our absolute priority. This quick screening validates your current health metrics against international donation standards.
                      </p>
                      <div className="space-y-3 pt-4">
                         {[
                           { icon: Zap, text: "Instant Result Engine", col: "text-rose-500" },
                           { icon: ShieldCheck, text: "Clinical Privacy Standards", col: "text-emerald-500" },
                           { icon: Star, text: "Official Participation Clearance", col: "text-amber-500" }
                         ].map((item, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <item.icon size={16} className={item.col} />
                              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{item.text}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center text-center bg-white">
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-8">
                         <p className="text-4xl mb-4">🩺</p>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Requirement Scan</p>
                         <p className="text-xl font-black text-slate-900">Health · Age · Weight · History</p>
                      </div>
                      <button 
                        onClick={() => setStep(1)}
                        className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-rose-600 hover:-translate-y-1 transition-all active:scale-95 group"
                      >
                        Start Scanning <ChevronRight size={18} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <p className="mt-6 text-[11px] font-bold text-slate-400 uppercase">Estimated duration: 90 Seconds</p>
                   </div>
                </motion.div>
              )}

              {/* ── ALREADY PASSED ── */}
              {alreadyPassed && (
                <motion.div 
                  key="passed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-10"
                >
                   <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                      <BadgeCheck size={48} strokeWidth={2.5} />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                         Eligibility <br /> <span className="text-emerald-500">Confirmed.</span>
                      </h2>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
                         You have already cleared the screening protocol. Your participation is highly valued in our emergency network.
                      </p>
                   </div>
                   <div className="flex gap-4 w-full max-w-sm">
                      <button 
                        onClick={() => navigate("/donor")}
                        className="flex-1 py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-lg hover:shadow-emerald-100 transition-all"
                      >
                         Register
                      </button>
                      <button 
                        onClick={() => { localStorage.removeItem("quizPassed"); restart(); }}
                        className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all"
                      >
                         Retake
                      </button>
                   </div>
                </motion.div>
              )}

              {/* ── QUESTION STEPS ── */}
              {step >= 1 && step <= totalSteps && (
                <motion.div 
                   key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                   className="flex-1 flex flex-col"
                >
                   {/* Top Progress bar for perfect feel */}
                   <div className="h-1.5 w-full bg-slate-50">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                        className="h-full bg-rose-500 shadow-sm shadow-rose-200"
                      />
                   </div>

                   <div className="flex-1 p-10 lg:p-16 flex flex-col md:flex-row gap-12 items-center">
                      <div className="md:w-1/2 space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-100 rounded-2xl text-rose-600">
                               <currentQ.icon size={28} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Module {step} Verification</span>
                         </div>
                         <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            {currentQ.question}
                         </h2>
                         <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] flex items-start gap-4">
                            <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm"><Info size={16} /></div>
                            <p className="text-xs text-indigo-900 font-bold leading-relaxed">{currentQ.subtitle}</p>
                         </div>
                      </div>

                      <div className="md:w-1/2 w-full space-y-3">
                         {currentQ.type === "options" ? (
                            currentQ.options.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setSelected(opt.value)}
                                className={`w-full group p-6 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between
                                  ${selected === opt.value 
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' 
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-rose-100 hover:bg-rose-50/10 hover:text-slate-900'}
                                `}
                              >
                                 <span className="text-base font-black tracking-tight">{opt.label}</span>
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected === opt.value ? 'bg-rose-500 border-rose-500' : 'border-slate-200 group-hover:border-rose-300'}`}>
                                    {selected === opt.value && <div className="w-2 h-2 rounded-full bg-white scale-110" />}
                                 </div>
                              </button>
                            ))
                         ) : (
                            <div className="grid grid-cols-2 gap-4">
                               {[
                                 { val: "yes", label: "Yes", icon: CheckCircle, col: "rose" },
                                 { val: "no",  label: "No",  icon: XCircle, col: "indigo" },
                               ].map(({ val, label, icon: Icon, col }) => (
                                 <button
                                   key={val}
                                   onClick={() => setSelected(val)}
                                   className={`p-10 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-4
                                     ${selected === val 
                                       ? `bg-slate-900 border-slate-900 text-white shadow-2xl translate-y-[-4px]` 
                                       : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                                     }
                                   `}
                                 >
                                    <Icon size={40} strokeWidth={2.5} className={selected === val ? `text-${col}-500` : 'text-slate-200'} />
                                    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                                 </button>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Footer Navigation */}
                   <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
                      <button 
                        onClick={handleBack}
                        className="px-8 py-4 bg-white text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:text-slate-900 transition-all active:scale-95"
                      >
                         <ChevronLeft size={16} className="inline mr-1" /> Previous
                      </button>
                      <button 
                        onClick={handleNext}
                        disabled={selected === null}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-20 disabled:shadow-none"
                      >
                         {step === totalSteps ? 'Evaluate System Status' : 'Accept & Continue'} <ChevronRight size={16} className="inline ml-1" />
                      </button>
                   </div>
                </motion.div>
              )}

              {/* ── RESULT: ELIGIBLE ── */}
              {step === totalSteps + 1 && result?.eligible && (
                <motion.div 
                   key="eligible" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                   className="flex-1 flex flex-col items-center justify-center p-12 lg:p-16 text-center space-y-12"
                >
                   <div className="relative">
                      <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[3rem] flex items-center justify-center shadow-inner relative z-10">
                         <ClipboardCheck size={60} strokeWidth={2.5} />
                      </div>
                      <div className="absolute -inset-4 border-2 border-dashed border-emerald-200 rounded-[3.5rem] animate-[spin_20s_linear_infinite]" />
                   </div>
                   
                   <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                         <ShieldCheck size={12} /> Verification Successful
                      </div>
                      <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                         Clearence <br /> <span className="text-emerald-500">Granted.</span>
                      </h2>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
                        Based on your clinical metrics, you are eligible to participate in the upcoming donation cycle.
                      </p>
                   </div>

                   <div className="grid grid-cols-2 gap-4 w-full max-w-lg pt-4">
                      <button 
                         onClick={() => navigate("/donor")}
                         className="flex-1 py-6 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-rose-600 transition-all active:scale-95"
                      >
                         Become Donor
                      </button>
                      <button 
                         onClick={() => navigate("/camps")}
                         className="flex-1 py-6 bg-white text-slate-900 border border-slate-200 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                      >
                         Find Camps
                      </button>
                   </div>
                </motion.div>
              )}

              {/* ── RESULT: NOT ELIGIBLE ── */}
              {step === totalSteps + 1 && result && !result.eligible && (
                <motion.div 
                   key="deferred" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                   className="flex-1 flex flex-col items-center justify-center p-12 lg:p-16 text-center"
                >
                   <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner">
                      <ShieldBan size={48} strokeWidth={2.5} />
                   </div>
                   <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                      Protocol <br /> <span className="text-rose-600">Deferred.</span>
                   </h2>
                   <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto mb-10 leading-relaxed">
                      Safety requirements have deferred your eligibility for this cycle. Please review the official note below.
                   </p>
                   
                   <div className="w-full max-w-lg p-8 bg-rose-50/50 border border-rose-100 rounded-[2.5rem] text-left mb-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={60} /></div>
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">System Deferral Output</p>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{result.reason}</p>
                   </div>

                   <button 
                     onClick={restart}
                     className="w-full max-w-sm py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 shadow-xl transition-all active:scale-95"
                   >
                     Reset Screening
                   </button>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Footer info/Tip */}
        <div className="mt-8 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Final eligibility is always determined by medical staff on the day of donation.</p>
        </div>
      </div>
    </div>
  );
}
