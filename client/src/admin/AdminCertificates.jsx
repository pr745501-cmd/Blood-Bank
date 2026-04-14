import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { 
  Award, Download, Trash2, Search, 
  Plus, ShieldCheck, Heart, Users, 
  ChevronRight, Activity, Filter,
  FileText, MapPin, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCertificates() {
  const [donors, setDonors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const [form, setForm] = useState({ donorId: "", donorName: "", bloodGroup: "" });

  /* ================= LOAD DATA (Keeping your original logic) ================= */
  const loadDonors = async () => {
    try {
      // Only fetch donors who have at least one approved donation
      const res = await axios.get("http://localhost:5000/api/admin/all-donations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const approvedDonations = (res.data || []).filter(d => d.verificationStatus === "approved");

      // Deduplicate by user id — one entry per donor
      const seen = new Set();
      const uniqueDonors = [];
      approvedDonations.forEach(d => {
        const uid = d.user?._id || d.user;
        if (uid && !seen.has(String(uid))) {
          seen.add(String(uid));
          uniqueDonors.push({
            _id: uid,
            name: d.user?.name || "Unknown",
            bloodGroup: d.bloodGroup || d.user?.bloodGroup || "",
            city: d.user?.city || "",
            donationCount: approvedDonations.filter(x => String(x.user?._id || x.user) === String(uid)).length
          });
        }
      });
      setDonors(uniqueDonors);
    } catch (err) { }
  };

  const loadCertificates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/certificates/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(res.data.certificates || []);
    } catch (err) { }
  };

  useEffect(() => {
    loadDonors();
    loadCertificates();
  }, []);

  const generateCertificate = async () => {
    if (!form.donorId) return;
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/certificates/create", 
        { ...form, donationDate: new Date() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ donorId: "", donorName: "", bloodGroup: "" });
      loadCertificates();
    } catch (err) { }
    finally { setLoading(false); }
  };

  const deleteCertificate = async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/certificates/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadCertificates();
    } catch (err) { }
  };

  const downloadCertificate = (cert) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(190, 18, 60); // Medical Red
    doc.text("Blood Donation Certificate", 60, 30);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("This certificate is proudly presented to", 50, 60);
    doc.setFontSize(18);
    doc.text(cert.donorName, 80, 80);
    doc.setFontSize(14);
    doc.text(`Blood Group : ${cert.bloodGroup}`, 20, 110);
    doc.text(`Certificate ID : ${cert.certificateId}`, 20, 130);
    doc.text(`Date : ${new Date(cert.donationDate).toDateString()}`, 20, 150);
    doc.text("Thank you for saving lives ❤️", 55, 180);
    doc.save(`certificate-${cert.certificateId}.pdf`);
  };

  const filteredDonors = useMemo(() => {
    return donors.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [donors, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-50 text-red-600 p-1.5 rounded-lg">
                <Heart size={20} fill="currentColor" />
              </span>
              <span className="text-sm font-bold text-red-600 uppercase tracking-widest">Medical Admin</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Certificate Registry</h1>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or blood type..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* KEY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Donors", val: donors.length, icon: Users, bg: "bg-blue-50", color: "text-blue-600" },
            { label: "Certificates Issued", val: certificates.length, icon: FileText, bg: "bg-red-50", color: "text-red-600" },
            { label: "System Health", val: "Optimal", icon: Activity, bg: "bg-emerald-50", color: "text-emerald-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-2xl font-bold text-slate-900">{stat.val}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* DONOR HISTORY TABLE */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">Donor Database</h3>
                <Filter size={16} className="text-slate-400 cursor-pointer hover:text-red-500" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">Donor Details</th>
                      <th className="px-6 py-4 font-bold">City</th>
                      <th className="px-6 py-4 font-bold text-center">Donations</th>
                      <th className="px-6 py-4 font-bold text-right">Selection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDonors.map((donor) => (
                      <tr key={donor._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                              {donor.bloodGroup}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{donor.name}</p>
                              <p className="text-xs text-slate-500">Member since {new Date().getFullYear()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                           <div className="flex items-center gap-1"><MapPin size={14} className="opacity-40" /> {donor.city}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                            {donor.donationCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => { setForm({ donorId: donor.user, donorName: donor.name, bloodGroup: donor.bloodGroup }); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all border border-red-100"
                          >
                            SELECT <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* GENERATE CERTIFICATE SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">
           <AnimatePresence mode="sync">
              {form.donorName ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-red-200 p-6 rounded-2xl shadow-lg shadow-red-500/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={() => setForm({donorId:"", donorName:"", bloodGroup:""})} className="text-slate-300 hover:text-slate-500">✕</button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-red-500" /> Issue Certificate
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-tight mb-1">Donor Name</p>
                      <p className="font-bold text-slate-900">{form.donorName}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-tight mb-1">Blood Group</p>
                      <p className="font-bold text-red-600">{form.bloodGroup}</p>
                    </div>
                  </div>

                  <button
                    onClick={generateCertificate}
                    disabled={loading}
                    className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Processing..." : "Generate Official Document"}
                  </button>
                </motion.div>
              ) : (
                <div className="bg-white border border-slate-200 border-dashed h-48 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-center px-6">
                  <Award size={40} className="mb-2 opacity-10" />
                  <p className="text-sm">Select a donor from the table to generate a new certificate.</p>
                </div>
              )}
            </AnimatePresence>
          </aside>
        </div>

        {/* ISSUED HISTORY */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
             <h3 className="text-xl font-bold text-slate-900">Recently Issued</h3>
             <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert._id} className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-red-200 transition-all group shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                    <Award size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => downloadCertificate(cert)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                      <Download size={18} />
                    </button>
                    <button onClick={() => deleteCertificate(cert._id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900">{cert.donorName}</h4>
                <div className="flex items-center justify-between mt-4">
                   <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 tracking-wider">{cert.bloodGroup}</span>
                   <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                     <Calendar size={12} /> {new Date(cert.donationDate).toLocaleDateString()}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}