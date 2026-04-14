import React, { useState } from "react";
import "./About.css";

function About() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-rose-500 selection:text-white">
      {/* ============ PROFESSIONAL NAV-BRANDING ============ */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Blood <span className="text-rose-600">Connect</span></span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> System Live</span>
            <span className="h-4 w-[1px] bg-slate-200"></span>
            <span>MERN Stack Verified</span>
          </div>
        </div>
      </div>

      {/* ============ HEADER ============ */}
      <header className="relative py-32 bg-[#0f172a] overflow-hidden">
        {/* Decorative elements for professional feel */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-900/20 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 animate-fade-in">
            About Blood <span className="text-rose-600 underline decoration-rose-500/30">Connect</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed">
            Understanding Our Mission, Technology, and Impact
          </p>
        </div>
      </header>

      {/* ============ INTRODUCTION ============ */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
              What is <span className="text-rose-600">Blood Connect?</span>
            </h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900 font-bold">Blood Connect Portal</strong> is a MERN Stack-based web application designed to bridge the critical gap 
                between blood donors and patients in need of blood transfusions. In emergency medical situations, 
                time is literally a matter of life and death. Traditional methods of finding blood donors—calling 
                hospitals, searching social media, or relying on personal networks—can waste precious minutes that 
                could mean the difference between survival and tragedy.
              </p>
              <p>
                Our platform eliminates this friction by creating a centralized, secure ecosystem where registered 
                blood donors can connect with patients instantly. Whether someone needs an emergency transfusion 
                after an accident, is preparing for surgery, or is undergoing cancer treatment, Blood Connect makes 
                finding compatible blood donors as simple as a few clicks.
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
             <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center text-xl">🚀</div>
                  <div><p className="font-bold text-slate-900">Instant Search</p><p className="text-xs text-slate-500">MERN Optimized Engine</p></div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">🛡️</div>
                  <div><p className="font-bold text-slate-900">Secure Data</p><p className="text-xs text-slate-500">JWT & Bcrypt Encrypted</p></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM STATEMENT ============ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 mb-16 text-center tracking-tight">The Problem We Solve</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Time Loss", desc: "Searching for blood donors manually can take 2-4 hours. In critical situations, this delay can be fatal.", icon: "⏱️" },
              { title: "Lack of Transparency", desc: "There's no centralized way to know which donors are available in your area or which blood types are in stock.", icon: "🚫" },
              { title: "Poor Coordination", desc: "Patients, families, and hospitals struggle to coordinate with potential donors across different channels.", icon: "🔄" },
              { title: "Unreliable Data", desc: "Information about donor availability is often outdated or inaccurate, leading to wasted efforts.", icon: "⚠️" }
            ].map((item, i) => (
              <div key={i} className="group p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-rose-500 hover:shadow-2xl transition-all duration-500">
                <div className="text-5xl mb-8 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SOLUTION ============ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="bg-[#0f172a] rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600 opacity-20 blur-[100px]"></div>
            <h2 className="text-4xl font-bold mb-8 relative z-10">Our Professional Solution</h2>
            <p className="text-xl text-slate-300 font-light mb-12 relative z-10">
              Blood Connect Portal provides a real-time, secure platform where:
            </p>
            <ul className="grid md:grid-cols-2 gap-8 relative z-10">
              {[
                { bold: "Donors register their blood type and location", text: "making themselves discoverable to those in need." },
                { bold: "Patients can search by blood group and city", text: "finding compatible donors within seconds instead of hours." },
                { bold: "Direct communication", text: "enables quick coordination between donors and patients without intermediaries." },
                { bold: "Real-time updates", text: "ensure that donor availability is always current and accurate." },
                { bold: "Secure authentication", text: "protects user data and ensures only verified individuals can donate." },
                { bold: "Hospital integration", text: "allows medical professionals to manage requests and verify donation quality." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 items-start group">
                  <span className="mt-1 flex-shrink-0 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] group-hover:scale-125 transition-transform">✓</span>
                  <p className="text-slate-300 leading-relaxed"><strong className="text-white font-semibold">{item.bold}</strong>, {item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-20 text-slate-900 uppercase tracking-widest">Platform Features</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Donors */}
            <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-200">
              <h3 className="text-2xl font-bold text-rose-600 mb-10 flex items-center gap-4">
                <span className="w-12 h-[2px] bg-rose-600"></span> For Blood Donors
              </h3>
              <div className="space-y-10">
                {[
                  { t: "Create & Manage Profile", d: "Register your blood type, location, and availability with secure authentication." },
                  { t: "Donation History", d: "Track all your donations and see the lives you've impacted." },
                  { t: "Real-Time Requests", d: "Receive instant notifications when someone in your area needs your blood type." },
                  { t: "Direct Communication", d: "Connect directly with patients to coordinate donation logistics." },
                  { t: "Impact Tracking", d: "See certificates and recognition for your lifesaving donations." }
                ].map((f, i) => (
                  <div key={i} className="group border-l-2 border-slate-200 pl-6 hover:border-rose-600 transition-all">
                    <h4 className="font-bold text-lg text-slate-900 mb-2">{f.t}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Patients */}
            <div className="p-10 bg-white shadow-2xl shadow-slate-200 rounded-[3rem] border border-slate-100">
              <h3 className="text-2xl font-bold text-blue-600 mb-10 flex items-center gap-4">
                <span className="w-12 h-[2px] bg-blue-600"></span> For Blood Patients
              </h3>
              <div className="space-y-10">
                {[
                  { t: "Search Donors", d: "Find compatible blood donors by blood group and location instantly." },
                  { t: "Send Requests", d: "Post blood requests and connect with available donors in real-time." },
                  { t: "Track Requests", d: "Monitor the status of your blood requests from submission to fulfillment." },
                  { t: "Secure Messaging", d: "Communicate privately with donors to arrange donation times and locations." },
                  { t: "Emergency Support", d: "Access 24/7 support for urgent blood needs and emergency situations." }
                ].map((f, i) => (
                  <div key={i} className="group border-l-2 border-slate-200 pl-6 hover:border-blue-600 transition-all">
                    <h4 className="font-bold text-lg text-slate-900 mb-2">{f.t}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ADMIN & TECHNOLOGY ============ */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Admin & Moderation</h2>
          <p className="text-slate-500 max-w-3xl mx-auto text-lg leading-relaxed">
            Our administrative dashboard provides hospitals and blood banks with powerful tools to manage the blood donation ecosystem:
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { t: "User Management", d: "View, verify, and manage all registered users and donors with comprehensive user profiles and activity logs." },
            { t: "Donor Registry", d: "Access complete database of blood donors with blood group distribution and real-time availability status." },
            { t: "Request Approval", d: "Review and approve blood requests before they become public, ensuring legitimacy and medical necessity." },
            { t: "Analytics Dashboard", d: "View statistics on total donors, active requests, blood group demand, and geographic distribution." },
            { t: "Fraud Prevention", d: "Remove fake profiles, inactive accounts, and users violating community guidelines to maintain trust." },
            { t: "Communication Tools", d: "Send mass notifications and coordinate with hospitals to organize blood drives and awareness campaigns." }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all">
              <h4 className="font-bold text-slate-900 mb-3">{item.t}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TECHNOLOGY STACK ============ */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-6">The MERN Infrastructure</h2>
          <p className="text-center text-slate-400 max-w-4xl mx-auto mb-16 text-lg font-light">
            Blood Connect is built using the MERN Stack—a modern, scalable, and industry-standard combination of technologies chosen for reliability, performance, and security.
          </p>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { title: "Frontend", items: ["React.js", "CSS3 & Responsive Design", "React Hooks", "Axios", "Socket.io Client"] },
              { title: "Backend", items: ["Node.js", "Express.js", "Socket.io", "JWT (JSON Web Tokens)", "Bcrypt"] },
              { title: "Database", items: ["MongoDB", "Mongoose ODM", "MongoDB Atlas", "Indexing"] }
            ].map((stack, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[2rem] hover:bg-white/10 transition-colors">
                <h4 className="text-2xl font-bold text-rose-500 mb-6 tracking-tight">{stack.title}</h4>
                <ul className="space-y-4">
                  {stack.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-300">
                      <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SECURITY ============ */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">🔒</div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Security & Privacy</h2>
          <p className="text-center text-slate-500 max-w-4xl mx-auto text-lg leading-relaxed">
            User privacy and data security are paramount. We implement enterprise-grade security measures:
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { t: "JWT Authentication", d: "All user sessions are protected with JSON Web Tokens that expire after a set duration, ensuring unauthorized access is prevented." },
            { t: "Password Encryption", d: "User passwords are encrypted using bcrypt with unique salt rounds, making them impossible to crack even if the database is compromised." },
            { t: "HTTPS/SSL", d: "All data transmitted between client and server is encrypted using HTTPS, protecting sensitive information from interception." },
            { t: "Input Validation", d: "All user inputs are validated and sanitized to prevent SQL injection, XSS attacks, and other common security vulnerabilities." },
            { t: "Role-Based Access Control", d: "Different user roles (donor, patient, admin) have different permissions, ensuring users can only access what they're authorized to see." },
            { t: "Data Privacy", d: "We comply with privacy regulations and only collect necessary information. User data is never shared with third parties without explicit consent." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xl transition-all group">
              <h4 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">{item.t}</h4>
              <p className="text-slate-500 leading-relaxed text-sm">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-20 tracking-tight text-slate-900">How Blood Connect Works</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              { i: "📋", t: "Register", d: "Create an account as a donor or patient with your basic information." },
              { i: "✅", t: "Verify", d: "Verify your email and complete your profile with location details." },
              { i: "🔍", t: "Connect", d: "Patients search for donors or donors receive requests." },
              { i: "📞", t: "Coordinate", d: "Arrange donation time and logistics through secure messaging." },
              { i: "❤️", t: "Save Lives", d: "Complete the donation and track the impact." }
            ].map((step, idx) => (
              <div key={idx} className="relative p-8 bg-white rounded-3xl border border-slate-200 group hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors">{step.i}</div>
                <h4 className="font-bold text-slate-900 mb-2">{step.t}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.d}</p>
                {idx < 4 && <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 text-slate-300 text-2xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IMPACT ============ */}
      <section className="py-24 bg-rose-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-6">Our Impact</h2>
          <p className="text-center text-rose-100 max-w-3xl mx-auto mb-16 text-lg">
            Since launch, Blood Connect has connected thousands of donors with patients in need, resulting in measurable impact:
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
            {[
              { l: "Lives Connected", v: "10,000+" },
              { l: "Active Donors", v: "5,000+" },
              { l: "Units Saved", v: "2M+" },
              { l: "Coverage Area", v: "50+ Cities" }
            ].map((m, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl md:text-6xl font-black mb-2 tracking-tighter">{m.v}</div>
                <div className="text-rose-200 uppercase tracking-widest text-xs font-bold">{m.l}</div>
              </div>
            ))}
          </div>

          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12">What People Say</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { p: "Blood Connect saved my father's life. We found a donor in just 15 minutes instead of the usual 4 hours. This platform is incredible.", s: "Rajesh M., Hyderabad" },
                { p: "As a regular donor, I love knowing exactly how many lives I've saved through this platform. It's deeply rewarding.", s: "Priya S., Bangalore" },
                { p: "Apollo Hospital uses Blood Connect because it's reliable, secure, and significantly reduces response time for urgent blood needs.", s: "Dr. Amit Patel, Apollo Hospital" }
              ].map((t, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20">
                  <p className="mb-6 text-lg font-light leading-relaxed">"{t.p}"</p>
                  <span className="not-italic font-bold text-rose-300 block text-sm">— {t.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ROADMAP ============ */}
      <section className="py-24 container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">Future Roadmap</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { phase: "Phase 1: Q1 2026", items: ["SMS & Email notifications", "Donor ratings system", "Donation certificates", "Advanced analytics"] },
            { phase: "Phase 2: Q2-Q3 2026", items: ["Real-time chat", "Google Maps integration", "Appointment scheduling", "Telemedicine consultation"] },
            { phase: "Phase 3: Q4 2026", items: ["Native iOS & Android apps", "AI recommendation engine", "Blood drive management", "Hospital partner APIs"] },
            { phase: "Phase 4: 2027+", items: ["International expansion", "AI chatbot 24/7", "Predictive demand analytics", "Government integration"] }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-white hover:shadow-xl transition-all">
              <h4 className="font-bold text-rose-600 mb-6 uppercase tracking-widest text-xs">{item.phase}</h4>
              <ul className="space-y-4">
                {item.items.map((li, idx) => <li key={idx} className="flex gap-2 text-sm text-slate-600 font-medium leading-tight"><span>•</span>{li}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-24 bg-slate-950">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How is Blood Connect different from other blood donation platforms?", a: "Blood Connect combines real-time search, direct donor-patient communication, and secure verification in one platform. Unlike traditional methods, we make finding blood donors instant and reliable, with built-in coordination tools." },
              { q: "Is my personal data safe on Blood Connect?", a: "Yes. We use military-grade encryption (HTTPS/SSL), bcrypt password hashing, and JWT authentication. Your data is never shared with third parties without consent, and we comply with all privacy regulations." },
              { q: "Can I donate blood if I have a medical condition?", a: "Our eligibility guidelines follow standard blood bank protocols. You must be 18-65 years old, weigh at least 50kg, and be in good health. Specific medical conditions may disqualify you—our medical team can advise." },
              { q: "How long does it take to find a donor through Blood Connect?", a: "Most requests are matched with donors within 15-30 minutes, compared to 2-6 hours through traditional channels. Real-time search and notifications make the process significantly faster." },
              { q: "Is Blood Connect available 24/7?", a: "Yes, our platform operates 24/7 for emergency blood requests. Donors can respond to urgent requests at any time, and we have 24/7 customer support for critical situations." },
              { q: "Can hospitals use Blood Connect?", a: "Absolutely. Hospitals can integrate with our admin dashboard to manage blood requests, verify donors, and coordinate with patients directly. We offer dedicated support for healthcare institutions." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/10">
                <button className="w-full p-8 text-left flex justify-between items-center" onClick={() => toggleFaq(idx)}>
                  <h4 className="font-bold text-white text-lg pr-8">{faq.q}</h4>
                  <span className={`text-rose-500 font-bold transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {expandedFaq === idx && (
                  <div className="px-8 pb-8 text-slate-400 text-lg leading-relaxed animate-slide-down">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONCLUSION ============ */}
      <section className="py-32 bg-white text-center border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 tracking-tight">Join the <span className="text-rose-600">Movement</span></h2>
          <div className="space-y-8 text-xl text-slate-500 font-light leading-relaxed mb-12">
            <p>
              Blood Connect Portal is more than just a web application. It's a movement
              to save lives through technology and community action. Whether you're a
              blood donor wanting to make a difference or a patient in need, you're part
              of something bigger—a network of compassionate individuals committed to
              saving lives.
            </p>
            <p>
              Every feature, every line of code is driven by our core mission: to
              eliminate the time gap that costs lives, and to create a world where no
              one dies waiting for blood.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="/contact" className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-16 py-5 rounded-full font-bold text-xl shadow-2xl shadow-rose-200 transition-all hover:-translate-y-2">
              Contact Us
            </a>
            <a href="/register" className="inline-block bg-slate-900 hover:bg-black text-white px-16 py-5 rounded-full font-bold text-xl transition-all hover:-translate-y-2">
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p>© 2026 Blood Connect Portal. All content and technology rights reserved.</p>
      </footer>
    </div>
  );
}

export default About;