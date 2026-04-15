import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, ShieldCheck, AlertTriangle, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, BadgeCheck, Heart, Clock, Scale,
  Activity, History, ShieldBan, Sparkles, Calendar, ArrowRight,
  ArrowLeft, Info, Loader2, ClipboardList
} from "lucide-react";

const QUESTIONS = [
  {
    id: "age",
    label: "Age Verification",
    question: "What is your current age group?",
    hint: "Donors must be between 18 and 65 years old.",
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
    label: "Body Weight",
    icon: Scale,
    hint: "Minimum 50 kg required for safe blood collection.",
    question: "Do you weigh 50 kg (110 lbs) or more?",
    type: "yesno",
    noDisqualify: true,
    noReason: "Blood donation volume is calibrated for a minimum body weight of 50 kg. Lower weight increases the risk of fatigue and dizziness.",
  },
  {
    id: "feeling",
    label: "Current Health",
    icon: Activity,
    hint: "You must be symptom-free for at least 7 days.",
    question: "Are you feeling completely well today?",
    type: "yesno",
    noDisqualify: true,
    noReason: "We prioritize your safety. Donors should wait until they are 100% healthy and symptom-free for at least 7 days.",
  },
  {
    id: "recent_donation",
    label: "Donation History",
    icon: History,
    hint: "A 90-day recovery gap is required between donations.",
    question: "Have you donated blood in the last 3 months?",
    type: "yesno",
    yesDisqualify: true,
    yesReason: "The mandatory 90-day waiting period ensures your hemoglobin levels stay healthy and prevents long-term anemia.",
  },
  {
    id: "medications",
    label: "Medications",
    icon: ShieldBan,
    hint: "Certain medications affect donation safety.",
    question: "Are you currently on antibiotics or blood thinners?",
    type: "yesno",
    yesDisqualify: true,
    yesReason: "Antibiotics indicate an active infection, and blood thinners can affect the safety of the collection site.",
  },
  {
    id: "tattoo",
    label: "Body Modifications",
    icon: Sparkles,
    hint: "A 6-month window is required after tattoos or piercings.",
    question: "Have you gotten a tattoo or piercing in the last 6 months?",
    type: "yesno",
    yesDisqualify: true,
    yesReason: "A 6-month deferral is standard to ensure absolute blood purity after any body modification.",
  },
];

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: "easeOut" },
};

export default function EligibilityQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);       // 0=intro, 1-6=questions, 7=result
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [checkingDonor, setCheckingDonor] = useState(true);

  const totalSteps = QUESTIONS.length;
  const currentQ   = QUESTIONS[step - 1];
  const progress   = step === 0 ? 0 : Math.round((step / totalSteps) * 100);
  const alreadyPassed = localStorage.getItem("quizPassed") === "true" && step === 0 && result === null;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?._id || user?.id;
    if (!userId) { setCheckingDonor(false); return; }
    import("axios").then(({ default: axios }) => {
      axios.get(`http://localhost:5000/api/donor/user/${userId}`)
        .then(() => navigate("/dashboard", { replace: true }))
        .catch(() => setCheckingDonor(false));
    });
  }, [navigate]);

  if (checkingDonor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={28} className="text-blue-500 animate-spin" />
      </div>
    );
  }

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

  const isQuestion = step >= 1 && step <= totalSteps;
  const isResult   = step === totalSteps + 1;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-14">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold">
              <ShieldCheck size={13} /> Donor Eligibility Screening
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Eligibility Assessment
          </h1>
          <p className="text-slate-500 text-base max-w-xl">
            Complete this brief health screening to confirm you meet the requirements for safe blood donation. Takes under 2 minutes.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 -mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:w-64 xl:w-72 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-5">Screening Steps</h3>
              <div className="space-y-4">
                {/* Intro step */}
                <div className="flex items-start gap-3 relative">
                  {step > 0 && <div className="absolute left-3 top-7 bottom-[-16px] w-0.5 bg-blue-100" />}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 z-10 bg-white transition-colors
                    ${step === 0 ? "border-blue-600 text-blue-600" : "border-blue-600 bg-blue-600 text-white"}`}>
                    {step > 0 ? <CheckCircle2 size={14} strokeWidth={3} /> : <span className="text-xs font-bold">1</span>}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${step === 0 ? "text-blue-700" : "text-slate-900"}`}>Introduction</p>
                    <p className="text-xs text-slate-400 mt-0.5">Overview & guidelines</p>
                  </div>
                </div>

                {/* Question steps */}
                {QUESTIONS.map((q, i) => {
                  const isActive    = step === i + 1;
                  const isCompleted = step > i + 1;
                  const isLast      = i === QUESTIONS.length - 1;
                  return (
                    <div key={q.id} className="flex items-start gap-3 relative">
                      {!isLast && (
                        <div className={`absolute left-3 top-7 bottom-[-16px] w-0.5 ${isCompleted ? "bg-blue-600" : "bg-slate-100"}`} />
                      )}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 z-10 bg-white transition-colors
                        ${isActive    ? "border-blue-600 text-blue-600"
                        : isCompleted ? "border-blue-600 bg-blue-600 text-white"
                        :               "border-slate-300 text-slate-400"}`}>
                        {isCompleted
                          ? <CheckCircle2 size={14} strokeWidth={3} />
                          : <span className="text-xs font-bold">{i + 2}</span>}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold transition-colors ${isActive ? "text-blue-700" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                          {q.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">{q.hint}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr className="my-5 border-slate-100" />
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={15} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your responses are private and used only to assess donation eligibility.
                </p>
              </div>

              {/* Progress */}
              {isQuestion && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── MAIN PANEL ── */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[420px] flex flex-col">

            <AnimatePresence mode="wait">

              {/* ── INTRO ── */}
              {step === 0 && !alreadyPassed && (
                <motion.div key="intro" {...PAGE_TRANSITION} className="flex-1 p-8 md:p-10 space-y-7">
                  <div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100">
                      <ClipboardList size={26} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Before You Begin</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      This screening follows WHO and national blood donation guidelines. Answer honestly — your safety and the recipient's safety depend on it.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Clock,        title: "~2 Minutes",      desc: "Quick 6-question assessment"    },
                      { icon: ShieldCheck,  title: "Confidential",    desc: "Your data stays private"        },
                      { icon: Heart,        title: "Save Lives",      desc: "One donation helps 3 patients"  },
                    ].map(({ icon: Icon, title, desc }, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-200 mb-3 shadow-sm">
                          <Icon size={17} className="text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      This is a self-screening tool. Final eligibility is always confirmed by medical staff at the donation center on the day of your visit.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setStep(1)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2 text-sm"
                    >
                      Start Screening <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── ALREADY PASSED ── */}
              {alreadyPassed && (
                <motion.div key="passed" {...PAGE_TRANSITION} className="flex-1 p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                    <BadgeCheck size={32} className="text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Already Cleared</h2>
                    <p className="text-slate-500 text-sm max-w-sm">You've already passed the eligibility screening. You can proceed to register as a donor.</p>
                  </div>
                  <div className="flex gap-3 w-full max-w-xs">
                    <button onClick={() => navigate("/donor")}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                      Register as Donor
                    </button>
                    <button onClick={() => { localStorage.removeItem("quizPassed"); restart(); }}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium text-sm transition-colors">
                      Retake
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── QUESTION ── */}
              {isQuestion && (
                <motion.div key={step} {...PAGE_TRANSITION} className="flex-1 flex flex-col">

                  {/* Question body */}
                  <div className="flex-1 p-8 md:p-10 space-y-7">
                    {/* Label + icon */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                        <currentQ.icon size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Question {step} of {totalSteps}
                        </p>
                        <p className="text-sm font-semibold text-slate-700">{currentQ.label}</p>
                      </div>
                    </div>

                    {/* Question text */}
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {currentQ.question}
                    </h2>

                    {/* Hint */}
                    <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{currentQ.hint}</p>
                    </div>

                    {/* Options */}
                    {currentQ.type === "options" ? (
                      <div className="space-y-2.5">
                        {currentQ.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSelected(opt.value)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group
                              ${selected === opt.value
                                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30"
                              }`}
                          >
                            <span className="font-medium text-sm">{opt.label}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${selected === opt.value ? "bg-white border-white" : "border-slate-300 group-hover:border-blue-400"}`}>
                              {selected === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: "yes", label: "Yes", icon: CheckCircle2,
                            active: "bg-emerald-600 border-emerald-600 text-white shadow-md",
                            idle:   "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/30" },
                          { val: "no",  label: "No",  icon: XCircle,
                            active: "bg-rose-600 border-rose-600 text-white shadow-md",
                            idle:   "bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/30" },
                        ].map(({ val, label, icon: Icon, active, idle }) => (
                          <button
                            key={val}
                            onClick={() => setSelected(val)}
                            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3
                              ${selected === val ? active : idle}`}
                          >
                            <Icon size={30} strokeWidth={2} />
                            <span className="font-semibold text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer nav */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                    <button
                      onClick={handleBack}
                      className="text-slate-500 hover:text-slate-800 font-medium py-2.5 px-4 transition-colors flex items-center gap-1.5 text-sm"
                    >
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={selected === null}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2 text-sm"
                    >
                      {step === totalSteps ? "Submit" : "Continue"} <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── ELIGIBLE ── */}
              {isResult && result?.eligible && (
                <motion.div key="eligible" {...PAGE_TRANSITION} className="flex-1 p-8 md:p-10 space-y-7">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                      <BadgeCheck size={28} className="text-emerald-500" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100 mb-2">
                        <ShieldCheck size={11} /> Eligibility Confirmed
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">You're Eligible to Donate!</h2>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                        Based on your responses, you meet all the criteria for safe blood donation.
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Screening Summary</p>
                    {["Age requirement met", "Weight requirement met", "Health status confirmed", "No recent donations", "No medication conflicts", "No body modification deferral"].map((t, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{t}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                      Final eligibility is confirmed by medical staff at the donation center. Please bring a valid ID on the day of donation.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => navigate("/donor")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-lg font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2">
                      Register as Donor <ArrowRight size={15} />
                    </button>
                    <button onClick={() => navigate("/camps")}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 px-5 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors">
                      Find Blood Camps
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── NOT ELIGIBLE ── */}
              {isResult && result && !result.eligible && (
                <motion.div key="deferred" {...PAGE_TRANSITION} className="flex-1 p-8 md:p-10 space-y-7">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 shrink-0">
                      <AlertTriangle size={26} className="text-rose-500" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-semibold border border-rose-100 mb-2">
                        Temporarily Deferred
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">Not Eligible Right Now</h2>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                        Don't worry — this is a temporary deferral. You may be eligible to donate in the future.
                      </p>
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
                    <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2">Deferral Reason</p>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{result.reason}</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                    <Clock size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      Once your deferral period ends, you're welcome to retake this screening and register as a donor.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <button onClick={restart}
                      className="flex-1 bg-slate-900 hover:bg-slate-700 text-white py-2.5 px-5 rounded-lg font-medium text-sm shadow-sm transition-colors">
                      Retake Screening
                    </button>
                    <button onClick={() => navigate("/dashboard")}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 px-5 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors">
                      Back to Dashboard
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
