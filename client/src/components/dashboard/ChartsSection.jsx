import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell,
} from "recharts";
import { Droplets, TrendingUp } from "lucide-react";
import API from "../../services/api.jsx";

const BAR_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-bold text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-black" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function ChartsSection() {
  const [donationData, setDonationData] = useState([]);
  const [bloodData, setBloodData]       = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/analytics/donations"),
      API.get("/analytics/blood-groups"),
    ])
      .then(([d, b]) => {
        setDonationData(d.data);
        setBloodData(b.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDonations = donationData.reduce((s, d) => s + d.donations, 0);
  const totalDonors    = bloodData.reduce((s, d) => s + d.units, 0);

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10">
          <h2 className="text-4xl font-black text-[#0F172A] mb-2">Analytics Overview</h2>
          <p className="text-slate-500">Live donation insights from our database</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3">
            <div className="w-8 h-8 border-4 border-red-100 border-t-red-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-semibold">Loading charts…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Monthly Donations Line Chart */}
            <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg text-[#0F172A]">Monthly Donations</h3>
                <span className="flex items-center gap-1 text-xs bg-red-50 text-red-500 font-bold px-3 py-1 rounded-full border border-red-100">
                  <TrendingUp size={11} /> {totalDonations} total
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-5">Number of donations recorded — last 6 months</p>

              {totalDonations === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-300 gap-2">
                  <TrendingUp size={32} />
                  <p className="text-sm text-slate-400">No donations recorded yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={donationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip content={<ChartTip />} />
                    <Line type="monotone" dataKey="donations" name="Donations"
                      stroke="#E11D48" strokeWidth={3}
                      dot={{ r: 5, fill: "#E11D48", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#E11D48", stroke: "#fff", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Blood Group Distribution Bar Chart */}
            <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg text-[#0F172A]">Blood Group Distribution</h3>
                <span className="flex items-center gap-1 text-xs bg-red-50 text-red-500 font-bold px-3 py-1 rounded-full border border-red-100">
                  <Droplets size={11} /> {totalDonors} donors
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-5">Registered donors by blood type</p>

              {totalDonors === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-300 gap-2">
                  <Droplets size={32} />
                  <p className="text-sm text-slate-400">No donor data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={bloodData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="group" axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="units" name="Donors" radius={[6, 6, 0, 0]} barSize={28}>
                      {bloodData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
