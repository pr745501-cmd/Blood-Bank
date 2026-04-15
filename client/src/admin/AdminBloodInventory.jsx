import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  Plus, AlertTriangle, Droplets, Package, Clock, X,
  ChevronRight, RefreshCcw, TrendingUp, TrendingDown,
  ShieldAlert, CheckCircle2, Search, Download, ArrowUpCircle,
  ArrowDownCircle, Activity, History, FileText
} from "lucide-react";
import jsPDF from "jspdf";

const API = "http://localhost:5000/api/blood";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const COMPONENTS = [
  { key: "wholeBlood", label: "Whole Blood", color: "text-red-500",    dot: "bg-red-400"    },
  { key: "plasma",     label: "Plasma",      color: "text-blue-500",   dot: "bg-blue-400"   },
  { key: "platelets",  label: "Platelets",   color: "text-amber-500",  dot: "bg-amber-400"  },
  { key: "rbc",        label: "RBC",         color: "text-purple-500", dot: "bg-purple-400" },
];
const SOURCES  = ["Donor", "Camp", "Hospital", "External Purchase", "Other"];
const REASONS  = ["Surgery", "Emergency", "Transfusion", "Research", "Expired Disposal", "Other"];

const STATUS_CONFIG = {
  Critical: { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     dot: "bg-red-500"     },
  Low:      { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",   dot: "bg-amber-500"   },
  Adequate: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500" },
};

const COMPONENT_COLORS = { wholeBlood: "#ef4444", plasma: "#3b82f6", platelets: "#f59e0b", rbc: "#8b5cf6" };

const EMPTY_ADD_FORM = { bloodType: "", wholeBlood: "", plasma: "", platelets: "", rbc: "", expiringSoon: "", source: "Other", notes: "" };
const EMPTY_OUT_FORM = { bloodType: "", component: "wholeBlood", units: "", issuedTo: "", reason: "Other", notes: "" };

export default function AdminBloodInventory() {
  const [inventory,     setInventory]     = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [thresholds,    setThresholds]    = useState({});
  const [activeTab,     setActiveTab]     = useState("inventory"); // inventory | transactions
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [showOutForm,   setShowOutForm]   = useState(false);
  const [editItem,      setEditItem]      = useState(null);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [txFilter,      setTxFilter]      = useState("ALL"); // ALL | IN | OUT
  const [viewMode,      setViewMode]      = useState("cards");
  const [submitting,    setSubmitting]    = useState(false);
  const [addForm,       setAddForm]       = useState(EMPTY_ADD_FORM);
  const [outForm,       setOutForm]       = useState(EMPTY_OUT_FORM);
  const [dispenseError, setDispenseError] = useState("");

  useEffect(() => { fetchInventory(); fetchTransactions(); fetchThresholds(); }, []);

  const fetchInventory = async () => {
    try { const r = await axios.get(`${API}/inventory`); setInventory(r.data); }
    catch (e) { }
  };

  const fetchTransactions = async () => {
    try { const r = await axios.get(`${API}/transactions?limit=200`); setTransactions(r.data); }
    catch (e) { }
  };

  const fetchThresholds = async () => {
    try {
      const token = localStorage.getItem("token");
      const r = await axios.get(`${API}/thresholds`, { headers: { Authorization: `Bearer ${token}` } });
      const map = {};
      r.data.forEach(t => { map[t.bloodGroup] = t.threshold; });
      setThresholds(map);
    } catch (e) {
      // Fall back to default of 10 for all groups
      const defaults = {};
      BLOOD_GROUPS.forEach(g => { defaults[g] = 10; });
      setThresholds(defaults);
    }
  };

  /* ===== ADD STOCK ===== */
  const openAdd = (item = null) => {
    setEditItem(item);
    setAddForm(item ? {
      bloodType: item.bloodType, wholeBlood: item.wholeBlood, plasma: item.plasma,
      platelets: item.platelets, rbc: item.rbc, expiringSoon: item.expiringSoon || 0,
      source: item.source || "Other", notes: ""
    } : EMPTY_ADD_FORM);
    setShowAddForm(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await axios.post(`${API}/inventory/add`, addForm);
      setShowAddForm(false); fetchInventory(); fetchTransactions(); fetchThresholds();
    } catch (err) { }
    finally { setSubmitting(false); }
  };

  /* ===== DISPENSE STOCK ===== */
  const openDispense = (item = null) => {
    setOutForm(item ? { ...EMPTY_OUT_FORM, bloodType: item.bloodType } : EMPTY_OUT_FORM);
    setDispenseError("");
    setShowOutForm(true);
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    setDispenseError("");

    // Client-side validation: check available units before hitting the API
    const available = inventory.find(i => i.bloodType === outForm.bloodType)?.[outForm.component] ?? 0;
    const requested = Number(outForm.units);
    if (requested <= 0) {
      setDispenseError("Units must be greater than 0.");
      return;
    }
    if (requested > available) {
      setDispenseError(`Only ${available} unit(s) of ${outForm.component} available for ${outForm.bloodType}.`);
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/inventory/dispense`, { ...outForm, units: requested });
      setShowOutForm(false);
      fetchInventory(); fetchTransactions(); fetchThresholds();
    } catch (err) {
      setDispenseError(err.response?.data?.message || "Error dispensing stock. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ===== DELETE ===== */
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this blood group from inventory?")) return;
    try { await axios.delete(`${API}/inventory/${id}`); fetchInventory(); }
    catch (e) { }
  };

  /* ===== PDF EXPORT ===== */
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 14;
    const now = new Date();

    const hex2rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    const statusColor = s => s === "Critical" ? "#ef4444" : s === "Low" ? "#f59e0b" : "#10b981";
    let y = 0;
    const checkPage = (needed = 20) => { if (y + needed > ph - 14) { doc.addPage(); y = 20; } };

    /* COVER HEADER */
    doc.setFillColor(185, 28, 28);
    doc.rect(0, 0, pw, 38, "F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(20); doc.setFont("helvetica","bold");
    doc.text("BloodConnect — Blood Inventory Report", margin, 16);
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text(`Generated: ${now.toLocaleString()}`, margin, 24);
    doc.text(`Total Blood Groups: ${inventory.length}`, margin, 30);

    /* SUMMARY STATS */
    y = 46;
    const stats = [
      { label: "Total Units",     value: totalUnits    },
      { label: "Critical",        value: criticalCount },
      { label: "Low Stock",       value: lowCount      },
      { label: "Expiring Soon",   value: expiringSoon  },
      { label: "Dispensed Today", value: todayOut      },
    ];
    const boxW = (pw - margin * 2 - 8) / stats.length;
    stats.forEach((s, i) => {
      const bx = margin + i * (boxW + 2);
      doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240);
      doc.roundedRect(bx, y, boxW, 18, 2, 2, "FD");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13); doc.setFont("helvetica","bold");
      doc.text(String(s.value), bx + boxW/2, y + 8, { align: "center" });
      doc.setFontSize(6.5); doc.setFont("helvetica","normal"); doc.setTextColor(100,116,139);
      doc.text(s.label.toUpperCase(), bx + boxW/2, y + 14, { align: "center" });
    });

    /* CRITICAL ALERT */
    if (criticalCount > 0) {
      y += 24;
      doc.setFillColor(254, 242, 242); doc.setDrawColor(252, 165, 165);
      doc.roundedRect(margin, y, pw - margin*2, 10, 2, 2, "FD");
      doc.setTextColor(185, 28, 28); doc.setFontSize(8); doc.setFont("helvetica","bold");
      doc.text(`!  ${criticalCount} blood group${criticalCount>1?"s are":" is"} critically low — immediate action required`, margin+4, y+6.5);
    }

    /* INVENTORY TABLE */
    y += 18;
    doc.setTextColor(15,23,42); doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text("Inventory Summary", margin, y); y += 6;
    const cols = ["Blood Group","Whole Blood","Plasma","Platelets","RBC","Total","Expiring","Source","Status"];
    const colW  = [22, 22, 18, 20, 16, 16, 18, 28, 22];
    doc.setFillColor(15,23,42); doc.rect(margin, y, pw - margin*2, 8, "F");
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont("helvetica","bold");
    let cx = margin + 2;
    cols.forEach((c, i) => { doc.text(c, cx, y+5.5); cx += colW[i]; });
    y += 8;
    inventory.forEach((item, idx) => {
      checkPage(9);
      const total = item.wholeBlood + item.plasma + item.platelets + item.rbc;
      const sc = statusColor(item.status); const [r,g,b] = hex2rgb(sc);
      doc.setFillColor(idx%2===0?248:255, idx%2===0?250:255, idx%2===0?252:255);
      doc.rect(margin, y, pw - margin*2, 8, "F");
      cx = margin + 2;
      const vals = [item.bloodType, item.wholeBlood, item.plasma, item.platelets, item.rbc, total, item.expiringSoon||0, item.source||"—"];
      vals.forEach((v, i) => {
        doc.setFont("helvetica", i===0?"bold":"normal"); doc.setTextColor(15,23,42);
        doc.setFontSize(7.5); doc.text(String(v), cx, y+5.5); cx += colW[i];
      });
      doc.setFillColor(r,g,b); doc.roundedRect(cx, y+1.5, 18, 5, 1.5, 1.5, "F");
      doc.setTextColor(255,255,255); doc.setFontSize(6.5); doc.setFont("helvetica","bold");
      doc.text(item.status, cx+9, y+5, { align:"center" }); y += 8;
    });

    /* COMPONENT BREAKDOWN CHART */
    checkPage(80); y += 8;
    doc.setTextColor(15,23,42); doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text("Component Breakdown by Blood Group", margin, y); y += 6;
    const chartH = 50; const chartW = pw - margin * 2;
    const compColors = ["#ef4444","#3b82f6","#f59e0b","#8b5cf6"];
    const compKeys   = ["wholeBlood","plasma","platelets","rbc"];
    const compLabels = ["Whole Blood","Plasma","Platelets","RBC"];
    const maxVal = Math.max(...inventory.map(i => i.wholeBlood + i.plasma + i.platelets + i.rbc), 1);
    const barGroupW = chartW / (inventory.length || 1);
    const barW = Math.min((barGroupW - 4) / 4, 8);
    doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
    doc.line(margin, y, margin, y + chartH);
    doc.line(margin, y + chartH, margin + chartW, y + chartH);
    inventory.forEach((item, gi) => {
      const gx = margin + gi * barGroupW + 2;
      compKeys.forEach((k, ci) => {
        const val = item[k] || 0; const bh = (val / maxVal) * (chartH - 4);
        const bx = gx + ci * (barW + 1); const by = y + chartH - bh;
        const [r,g2,b2] = hex2rgb(compColors[ci]);
        doc.setFillColor(r,g2,b2); doc.rect(bx, by, barW, bh, "F");
      });
      doc.setFontSize(6); doc.setTextColor(100,116,139);
      doc.text(item.bloodType, gx + (barGroupW-4)/2, y + chartH + 4, { align:"center" });
    });
    y += chartH + 10;
    compLabels.forEach((l, i) => {
      const lx = margin + i * 42; const [r,g2,b2] = hex2rgb(compColors[i]);
      doc.setFillColor(r,g2,b2); doc.rect(lx, y, 5, 3.5, "F");
      doc.setTextColor(15,23,42); doc.setFontSize(7); doc.setFont("helvetica","normal");
      doc.text(l, lx + 7, y + 3);
    });

    /* STATUS DISTRIBUTION */
    y += 12; checkPage(50);
    doc.setTextColor(15,23,42); doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text("Status Distribution", margin, y); y += 6;
    const adequate = inventory.filter(i => i.status === "Adequate").length;
    const statusData = [
      { label:"Adequate", count:adequate,      color:"#10b981" },
      { label:"Low",      count:lowCount,      color:"#f59e0b" },
      { label:"Critical", count:criticalCount, color:"#ef4444" },
    ];
    const total2 = inventory.length || 1; const barMaxW = 100;
    statusData.forEach(s => {
      const [r,g2,b2] = hex2rgb(s.color);
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(15,23,42);
      doc.text(s.label, margin, y + 4);
      doc.setFillColor(241,245,249); doc.roundedRect(margin+28, y, barMaxW, 6, 1, 1, "F");
      doc.setFillColor(r,g2,b2);
      const fw = (s.count / total2) * barMaxW;
      if (fw > 0) doc.roundedRect(margin+28, y, fw, 6, 1, 1, "F");
      doc.setTextColor(100,116,139); doc.setFontSize(7); doc.setFont("helvetica","normal");
      doc.text(`${s.count} groups`, margin+28+barMaxW+3, y+4.5); y += 10;
    });

    /* RECENT TRANSACTIONS */
    checkPage(60); y += 6;
    doc.setTextColor(15,23,42); doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text("Recent Transactions (Last 20)", margin, y); y += 6;
    const txCols = ["Type","Blood","Component","Units","Source / Issued To","Reason","Date"];
    const txColW = [14, 16, 24, 14, 46, 28, 36];
    doc.setFillColor(15,23,42); doc.rect(margin, y, pw-margin*2, 7, "F");
    doc.setTextColor(255,255,255); doc.setFontSize(6.5); doc.setFont("helvetica","bold");
    cx = margin + 2;
    txCols.forEach((c,i) => { doc.text(c, cx, y+5); cx += txColW[i]; }); y += 7;
    const compLabel = k => ({ wholeBlood:"Whole Blood", plasma:"Plasma", platelets:"Platelets", rbc:"RBC" }[k]||k);
    transactions.slice(0,20).forEach((tx, idx) => {
      checkPage(8);
      const isIn = tx.transactionType === "IN";
      doc.setFillColor(idx%2===0?248:255, idx%2===0?250:255, idx%2===0?252:255);
      doc.rect(margin, y, pw-margin*2, 7, "F");
      cx = margin + 2;
      const [tr,tg,tb] = hex2rgb(isIn?"#10b981":"#ef4444");
      doc.setFillColor(tr,tg,tb); doc.roundedRect(cx, y+1, 10, 5, 1, 1, "F");
      doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(7);
      doc.text(tx.transactionType, cx+5, y+4.8, { align:"center" }); cx += txColW[0];
      const rowVals = [tx.bloodType, compLabel(tx.component), (isIn?"+":"-")+tx.units, isIn?(tx.source||"—"):(tx.issuedTo||"—"), tx.reason||"—", new Date(tx.createdAt).toLocaleDateString("en-GB")];
      rowVals.forEach((v,i) => {
        doc.setTextColor(i===2?(isIn?5:185):15, i===2?(isIn?150:28):23, i===2?(isIn?80:28):42);
        doc.setFont("helvetica", i===2?"bold":"normal");
        const txt = String(v).length>18?String(v).slice(0,16)+"…":String(v);
        doc.text(txt, cx, y+4.8); cx += txColW[i+1];
      }); y += 7;
    });

    /* ── SECTION: MONTHLY IN/OUT TRENDS ── */
    checkPage(80); y += 8;
    doc.setTextColor(15,23,42); doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text("Monthly IN / OUT Trends (Last 6 Months)", margin, y); y += 6;

    // build monthly buckets from transactions
    const monthlyMap = {};
    const now6 = new Date(); now6.setMonth(now6.getMonth() - 5); now6.setDate(1); now6.setHours(0,0,0,0);
    transactions.forEach(tx => {
      const d = new Date(tx.createdAt);
      if (d < now6) return;
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { in: 0, out: 0 };
      if (tx.transactionType === "IN")  monthlyMap[key].in  += tx.units;
      if (tx.transactionType === "OUT") monthlyMap[key].out += tx.units;
    });
    const monthKeys = Object.keys(monthlyMap).sort();
    const monthLabels = monthKeys.map(k => {
      const [yr, mo] = k.split("-");
      return new Date(yr, mo-1).toLocaleString("default", { month:"short", year:"2-digit" });
    });
    const maxMonthVal = Math.max(...monthKeys.map(k => Math.max(monthlyMap[k].in, monthlyMap[k].out)), 1);
    const mChartH = 45; const mChartW = pw - margin*2;
    const mGroupW = monthKeys.length > 0 ? mChartW / monthKeys.length : mChartW;
    const mBarW   = Math.min((mGroupW - 6) / 2, 14);

    // axes
    doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
    doc.line(margin, y, margin, y + mChartH);
    doc.line(margin, y + mChartH, margin + mChartW, y + mChartH);

    // y-axis labels
    [0, 0.25, 0.5, 0.75, 1].forEach(pct => {
      const ly = y + mChartH - pct * (mChartH - 4);
      doc.setDrawColor(241,245,249); doc.line(margin, ly, margin + mChartW, ly);
      doc.setFontSize(5.5); doc.setTextColor(148,163,184);
      doc.text(String(Math.round(pct * maxMonthVal)), margin - 2, ly + 1.5, { align:"right" });
    });

    if (monthKeys.length === 0) {
      doc.setFontSize(8); doc.setTextColor(148,163,184); doc.setFont("helvetica","normal");
      doc.text("No transaction data available for the last 6 months", margin + mChartW/2, y + mChartH/2, { align:"center" });
    } else {
      monthKeys.forEach((k, gi) => {
        const gx = margin + gi * mGroupW + 3;
        const inH  = ((monthlyMap[k].in  || 0) / maxMonthVal) * (mChartH - 4);
        const outH = ((monthlyMap[k].out || 0) / maxMonthVal) * (mChartH - 4);
        // IN bar (green)
        doc.setFillColor(16,185,129);
        if (inH > 0) doc.rect(gx, y + mChartH - inH, mBarW, inH, "F");
        // OUT bar (red)
        doc.setFillColor(239,68,68);
        if (outH > 0) doc.rect(gx + mBarW + 2, y + mChartH - outH, mBarW, outH, "F");
        // value labels
        doc.setFontSize(5.5); doc.setTextColor(15,23,42);
        if (inH > 3)  doc.text(String(monthlyMap[k].in),  gx + mBarW/2,          y + mChartH - inH  - 1, { align:"center" });
        if (outH > 3) doc.text(String(monthlyMap[k].out), gx + mBarW + 2 + mBarW/2, y + mChartH - outH - 1, { align:"center" });
        // x label
        doc.setFontSize(6); doc.setTextColor(100,116,139);
        doc.text(monthLabels[gi], gx + mGroupW/2 - 3, y + mChartH + 4, { align:"center" });
      });
    }

    // monthly legend
    y += mChartH + 10;
    doc.setFillColor(16,185,129); doc.rect(margin, y, 5, 3.5, "F");
    doc.setTextColor(15,23,42); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("Stock IN", margin + 7, y + 3);
    doc.setFillColor(239,68,68); doc.rect(margin + 30, y, 5, 3.5, "F");
    doc.text("Stock OUT", margin + 37, y + 3);

    /* ── SECTION: BLOOD GROUP WISE ANALYSIS ── */
    y += 14; checkPage(80);
    doc.setTextColor(15,23,42); doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text("Blood Group Wise Analysis", margin, y); y += 6;

    // build per-group stats from transactions
    const groupStats = {};
    BLOOD_GROUPS.forEach(bg => { groupStats[bg] = { in: 0, out: 0, txCount: 0 }; });
    transactions.forEach(tx => {
      if (!groupStats[tx.bloodType]) groupStats[tx.bloodType] = { in:0, out:0, txCount:0 };
      if (tx.transactionType === "IN")  groupStats[tx.bloodType].in  += tx.units;
      if (tx.transactionType === "OUT") groupStats[tx.bloodType].out += tx.units;
      groupStats[tx.bloodType].txCount++;
    });

    // table header
    const bgCols = ["Blood Group","Current Stock","Total IN","Total OUT","Net Flow","Transactions","Status"];
    const bgColW = [28, 28, 22, 22, 22, 28, 28];
    doc.setFillColor(15,23,42); doc.rect(margin, y, pw-margin*2, 8, "F");
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont("helvetica","bold");
    cx = margin + 2;
    bgCols.forEach((c,i) => { doc.text(c, cx, y+5.5); cx += bgColW[i]; }); y += 8;

    inventory.forEach((item, idx) => {
      checkPage(10);
      const gs = groupStats[item.bloodType] || { in:0, out:0, txCount:0 };
      const currentStock = item.wholeBlood + item.plasma + item.platelets + item.rbc;
      const netFlow = gs.in - gs.out;
      const sc = statusColor(item.status); const [r,g2,b2] = hex2rgb(sc);

      doc.setFillColor(idx%2===0?248:255, idx%2===0?250:255, idx%2===0?252:255);
      doc.rect(margin, y, pw-margin*2, 9, "F");
      cx = margin + 2;

      // blood group badge
      const [br,bg3,bb] = hex2rgb(sc);
      doc.setFillColor(br,bg3,bb); doc.roundedRect(cx, y+1.5, 16, 6, 1.5, 1.5, "F");
      doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont("helvetica","bold");
      doc.text(item.bloodType, cx+8, y+5.8, { align:"center" }); cx += bgColW[0];

      // current stock with mini bar
      doc.setTextColor(15,23,42); doc.setFont("helvetica","bold"); doc.setFontSize(8);
      doc.text(String(currentStock), cx, y+5.5);
      const barFill = Math.min((currentStock / 200) * 20, 20);
      doc.setFillColor(241,245,249); doc.roundedRect(cx, y+6, 20, 2, 0.5, 0.5, "F");
      doc.setFillColor(br,bg3,bb);
      if (barFill > 0) doc.roundedRect(cx, y+6, barFill, 2, 0.5, 0.5, "F");
      cx += bgColW[1];

      // IN (green)
      doc.setTextColor(5,150,80); doc.setFont("helvetica","bold"); doc.setFontSize(8);
      doc.text("+" + gs.in, cx, y+5.5); cx += bgColW[2];

      // OUT (red)
      doc.setTextColor(185,28,28); doc.setFont("helvetica","bold");
      doc.text("-" + gs.out, cx, y+5.5); cx += bgColW[3];

      // net flow
      const netColor = netFlow >= 0 ? "#059650" : "#b91c1c";
      const [nr,ng,nb] = hex2rgb(netColor);
      doc.setTextColor(nr,ng,nb); doc.setFont("helvetica","bold");
      doc.text((netFlow >= 0 ? "+" : "") + netFlow, cx, y+5.5); cx += bgColW[4];

      // tx count
      doc.setTextColor(100,116,139); doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
      doc.text(String(gs.txCount) + " txns", cx, y+5.5); cx += bgColW[5];

      // status badge
      doc.setFillColor(r,g2,b2); doc.roundedRect(cx, y+1.5, 20, 6, 1.5, 1.5, "F");
      doc.setTextColor(255,255,255); doc.setFontSize(6.5); doc.setFont("helvetica","bold");
      doc.text(item.status, cx+10, y+5.5, { align:"center" }); y += 9;
    });

    /* ── SECTION: MONTHLY PER GROUP TABLE ── */
    y += 8; checkPage(60);
    doc.setTextColor(15,23,42); doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text("Monthly Transactions per Blood Group", margin, y); y += 6;

    // build month × group matrix
    const mgMap = {}; // { "2026-01": { "A+": { in:0, out:0 } } }
    transactions.forEach(tx => {
      const d = new Date(tx.createdAt);
      if (d < now6) return;
      const mk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      if (!mgMap[mk]) mgMap[mk] = {};
      if (!mgMap[mk][tx.bloodType]) mgMap[mk][tx.bloodType] = { in:0, out:0 };
      if (tx.transactionType === "IN")  mgMap[mk][tx.bloodType].in  += tx.units;
      if (tx.transactionType === "OUT") mgMap[mk][tx.bloodType].out += tx.units;
    });
    const mgMonths = Object.keys(mgMap).sort();
    const activeGroups = [...new Set(transactions.map(t => t.bloodType))].sort();

    if (mgMonths.length === 0 || activeGroups.length === 0) {
      doc.setFontSize(8); doc.setTextColor(148,163,184); doc.setFont("helvetica","normal");
      doc.text("No monthly group data available", margin, y + 6); y += 14;
    } else {
      // header row: Month | Group1 IN/OUT | Group2 IN/OUT ...
      const mgColW = 22;
      const firstColW = 24;
      doc.setFillColor(15,23,42); doc.rect(margin, y, pw-margin*2, 8, "F");
      doc.setTextColor(255,255,255); doc.setFontSize(6.5); doc.setFont("helvetica","bold");
      doc.text("Month", margin+2, y+5.5);
      activeGroups.forEach((bg, i) => {
        const gx = margin + firstColW + i * mgColW;
        if (gx + mgColW > pw - margin) return;
        doc.text(bg, gx + mgColW/2, y+5.5, { align:"center" });
      });
      y += 8;

      mgMonths.forEach((mk, ri) => {
        checkPage(10);
        const [yr, mo] = mk.split("-");
        const mLabel = new Date(yr, mo-1).toLocaleString("default", { month:"short", year:"2-digit" });
        doc.setFillColor(ri%2===0?248:255, ri%2===0?250:255, ri%2===0?252:255);
        doc.rect(margin, y, pw-margin*2, 9, "F");
        doc.setTextColor(15,23,42); doc.setFontSize(7); doc.setFont("helvetica","bold");
        doc.text(mLabel, margin+2, y+5.5);
        activeGroups.forEach((bg, i) => {
          const gx = margin + firstColW + i * mgColW;
          if (gx + mgColW > pw - margin) return;
          const cell = mgMap[mk]?.[bg] || { in:0, out:0 };
          doc.setTextColor(5,150,80); doc.setFont("helvetica","normal"); doc.setFontSize(6.5);
          doc.text(`+${cell.in}`, gx + 2, y+4);
          doc.setTextColor(185,28,28);
          doc.text(`-${cell.out}`, gx + 2, y+8);
        });
        y += 9;
      });
    }

    /* FOOTER */
    const pages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFillColor(248,250,252); doc.rect(0, ph-10, pw, 10, "F");
      doc.setTextColor(148,163,184); doc.setFontSize(7); doc.setFont("helvetica","normal");
      doc.text("BloodConnect — Confidential Blood Bank Report", margin, ph-4);
      doc.text(`Page ${p} of ${pages}`, pw-margin, ph-4, { align:"right" });
    }
    doc.save(`BloodInventory_Report_${now.toISOString().slice(0,10)}.pdf`);
  };

  /* ===== DERIVED ===== */
  const filtered = inventory
    .filter(i => i.bloodType?.toLowerCase().includes(search.toLowerCase()))
    .filter(i => filterStatus === "All" || i.status === filterStatus);

  const totalUnits    = inventory.reduce((s, i) => s + i.wholeBlood + i.plasma + i.platelets + i.rbc, 0);
  const criticalCount = inventory.filter(i => i.status === "Critical").length;
  const lowCount      = inventory.filter(i => i.status === "Low").length;
  const expiringSoon  = inventory.reduce((s, i) => s + (i.expiringSoon || 0), 0);
  const todayOut      = transactions.filter(t => t.transactionType === "OUT" && new Date(t.createdAt).toDateString() === new Date().toDateString()).reduce((s, t) => s + t.units, 0);

  const filteredTx = transactions.filter(t => txFilter === "ALL" || t.transactionType === txFilter);

  const barData = inventory.map(i => ({
    name: i.bloodType,
    "Whole Blood": i.wholeBlood, Plasma: i.plasma, Platelets: i.platelets, RBC: i.rbc,
  }));

  const componentLabel = (key) => COMPONENTS.find(c => c.key === key)?.label || key;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-50 text-red-600 p-1.5 rounded-lg"><Droplets size={18} fill="currentColor" /></span>
              <span className="text-xs font-black text-red-600 uppercase tracking-widest">Blood Bank Management</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Blood Inventory</h1>
            <p className="text-slate-500 text-sm">Real-time stock monitoring · IN/OUT tracking · Transaction history</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { fetchInventory(); fetchTransactions(); }}
              className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm text-sm">
              <RefreshCcw size={15} /> Refresh
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all shadow-sm text-sm">
              <FileText size={15} /> Export PDF
            </button>
            <button onClick={() => openDispense()}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all text-sm">
              <ArrowDownCircle size={18} /> Dispense Blood
            </button>
            <button onClick={() => openAdd()}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200 transition-all text-sm">
              <ArrowUpCircle size={18} /> Add Stock
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<Package size={22}/>}         value={totalUnits}    label="Total Units"     color="text-blue-600 bg-blue-50"     trend={null} />
          <StatCard icon={<ShieldAlert size={22}/>}     value={criticalCount} label="Critical Stock"  color="text-red-600 bg-red-50"       trend="down" />
          <StatCard icon={<AlertTriangle size={22}/>}   value={lowCount}      label="Low Stock"       color="text-amber-600 bg-amber-50"   trend={null} />
          <StatCard icon={<Clock size={22}/>}           value={expiringSoon}  label="Expiring Soon"   color="text-purple-600 bg-purple-50" trend={null} />
          <StatCard icon={<ArrowDownCircle size={22}/>} value={todayOut}      label="Dispensed Today" color="text-slate-600 bg-slate-100"  trend={null} />
        </div>

        {/* CRITICAL ALERT BANNER */}
        {criticalCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <ShieldAlert size={20} className="text-red-600 shrink-0" />
            <p className="text-sm font-bold text-red-700">
              {criticalCount} blood group{criticalCount > 1 ? "s are" : " is"} critically low. Consider broadcasting an emergency alert.
            </p>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {[
            { id: "inventory",    label: "Inventory",    icon: <Droplets size={14}/> },
            { id: "transactions", label: "Transactions", icon: <History size={14}/> },
            { id: "chart",        label: "Analytics",    icon: <Activity size={14}/> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? "bg-red-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* =================== INVENTORY TAB =================== */}
        {activeTab === "inventory" && (
          <>
            {/* SEARCH + FILTER + VIEW TOGGLE */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" size={15} />
                <input placeholder="Search blood type..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:border-red-400" />
              </div>
              <div className="flex gap-2">
                {["All", "Critical", "Low", "Adequate"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${filterStatus === s ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 ml-auto bg-white border border-slate-200 rounded-xl p-1">
                {["cards", "table"].map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${viewMode === m ? "bg-red-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* CARDS VIEW */}
            {viewMode === "cards" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filtered.map(item => {
                  const total = item.wholeBlood + item.plasma + item.platelets + item.rbc;
                  const pct   = Math.min(100, (total / 200) * 100);
                  const cfg   = STATUS_CONFIG[item.status] || STATUS_CONFIG.Adequate;
                  const lastTx = transactions.find(t => t.bloodType === item.bloodType);
                  const itemThreshold = thresholds[item.bloodType] ?? 10;
                  const isLowStock = total < itemThreshold;
                  return (
                    <div key={item._id} className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all group ${isLowStock ? "border-amber-300" : "border-slate-100"}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-200">
                          {item.bloodType}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot}`}></span>
                            {item.status}
                          </span>
                          {isLowStock && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase">
                              <AlertTriangle size={9} /> {total} units low
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-3xl font-black text-slate-800 mb-1">{total} <span className="text-sm font-medium text-slate-400">units</span></p>

                      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3">
                        <div className={`h-1.5 rounded-full transition-all ${item.status === "Critical" ? "bg-red-500" : item.status === "Low" ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${pct}%` }} />
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> WB: {item.wholeBlood}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> PL: {item.plasma}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> PT: {item.platelets}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span> RBC: {item.rbc}</span>
                      </div>

                      {item.source && (
                        <p className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
                          <Package size={10}/> Source: {item.source}
                        </p>
                      )}
                      {item.expiringSoon > 0 && (
                        <p className="text-[10px] text-amber-600 font-bold mb-1 flex items-center gap-1">
                          <Clock size={10}/> {item.expiringSoon} units expiring soon
                        </p>
                      )}
                      {lastTx && (
                        <p className={`text-[10px] font-bold mb-3 flex items-center gap-1 ${lastTx.transactionType === "IN" ? "text-emerald-600" : "text-red-500"}`}>
                          {lastTx.transactionType === "IN" ? <ArrowUpCircle size={10}/> : <ArrowDownCircle size={10}/>}
                          Last: {lastTx.transactionType === "IN" ? "+" : "-"}{lastTx.units} {componentLabel(lastTx.component)}
                        </p>
                      )}

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openDispense(item)}
                          className="flex-1 text-xs border border-slate-800 py-1.5 rounded-lg text-slate-800 hover:bg-slate-800 hover:text-white font-bold transition-all">
                          Dispense
                        </button>
                        <button onClick={() => openAdd(item)}
                          className="flex-1 text-xs border border-slate-200 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 font-bold">
                          Add
                        </button>
                        <button onClick={() => handleDelete(item._id)}
                          className="flex-1 text-xs border border-red-100 py-1.5 rounded-lg text-red-500 hover:bg-red-50 font-bold">
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABLE VIEW */}
            {viewMode === "table" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-800">Inventory Ledger</h2>
                  <button onClick={exportPDF} className="text-sm font-bold text-red-600 flex items-center gap-1 hover:underline">
                    Export PDF <ChevronRight size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="px-6 py-4">Blood Group</th>
                        <th className="px-4 py-4">Whole Blood</th>
                        <th className="px-4 py-4">Plasma</th>
                        <th className="px-4 py-4">Platelets</th>
                        <th className="px-4 py-4">RBC</th>
                        <th className="px-4 py-4">Total</th>
                        <th className="px-4 py-4">Expiring</th>
                        <th className="px-4 py-4">Source</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map(i => {
                        const total = i.wholeBlood + i.plasma + i.platelets + i.rbc;
                        const cfg   = STATUS_CONFIG[i.status] || STATUS_CONFIG.Adequate;
                        return (
                          <tr key={i._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm">{i.bloodType}</div>
                                <span className="font-bold text-slate-700">Type {i.bloodType}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-medium text-slate-600">{i.wholeBlood}</td>
                            <td className="px-4 py-4 text-sm font-medium text-slate-600">{i.plasma}</td>
                            <td className="px-4 py-4 text-sm font-medium text-slate-600">{i.platelets}</td>
                            <td className="px-4 py-4 text-sm font-medium text-slate-600">{i.rbc}</td>
                            <td className="px-4 py-4 text-sm font-black text-slate-800">{total}</td>
                            <td className="px-4 py-4 text-sm text-amber-600 font-medium">{i.expiringSoon || 0}</td>
                            <td className="px-4 py-4 text-sm text-slate-500 font-medium">{i.source || "—"}</td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-lg text-xs font-black border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{i.status}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button onClick={() => openDispense(i)} className="text-xs border border-slate-800 px-3 py-1.5 rounded-lg text-slate-800 hover:bg-slate-800 hover:text-white font-bold transition-all">Dispense</button>
                                <button onClick={() => openAdd(i)} className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 font-bold">Add</button>
                                <button onClick={() => handleDelete(i._id)} className="text-xs border border-red-100 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 font-bold">Remove</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* =================== TRANSACTIONS TAB =================== */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex gap-2 items-center">
              {["ALL", "IN", "OUT"].map(f => (
                <button key={f} onClick={() => setTxFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${txFilter === f
                    ? f === "IN" ? "bg-emerald-600 text-white border-emerald-600"
                      : f === "OUT" ? "bg-red-600 text-white border-red-600"
                      : "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                  {f === "IN" ? "▲ Stock IN" : f === "OUT" ? "▼ Stock OUT" : "All Transactions"}
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400 font-bold">{filteredTx.length} records</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
                    <tr>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-4 py-4">Blood Group</th>
                      <th className="px-4 py-4">Component</th>
                      <th className="px-4 py-4">Units</th>
                      <th className="px-4 py-4">Source / Issued To</th>
                      <th className="px-4 py-4">Reason</th>
                      <th className="px-4 py-4">Notes</th>
                      <th className="px-4 py-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTx.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm font-bold">No transactions found</td></tr>
                    )}
                    {filteredTx.map(tx => (
                      <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${tx.transactionType === "IN" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {tx.transactionType === "IN" ? <ArrowUpCircle size={12}/> : <ArrowDownCircle size={12}/>}
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm">{tx.bloodType}</div>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-700">{componentLabel(tx.component)}</td>
                        <td className="px-4 py-4">
                          <span className={`text-sm font-black ${tx.transactionType === "IN" ? "text-emerald-600" : "text-red-600"}`}>
                            {tx.transactionType === "IN" ? "+" : "-"}{tx.units}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                          {tx.transactionType === "IN" ? (tx.source || "—") : (tx.issuedTo || "—")}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">{tx.reason || "—"}</td>
                        <td className="px-4 py-4 text-sm text-slate-400 max-w-[150px] truncate">{tx.notes || "—"}</td>
                        <td className="px-4 py-4 text-xs text-slate-400 font-medium whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================== ANALYTICS TAB =================== */}
        {activeTab === "chart" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-black text-slate-800 mb-6">Stock Level by Blood Group</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {inventory.map(item => {
                  const total = item.wholeBlood + item.plasma + item.platelets + item.rbc;
                  const data  = [{ name: "stock", value: total }, { name: "empty", value: Math.max(0, 200 - total) }];
                  return (
                    <div key={item._id} className="flex flex-col items-center">
                      <div className="relative w-full" style={{ height: 120 }}>
                        <ResponsiveContainer width="100%" height={120} debounce={50}>
                          <PieChart>
                            <Pie data={data} dataKey="value" innerRadius={35} outerRadius={50} paddingAngle={4} stroke="none">
                              <Cell fill={item.status === "Critical" ? "#ef4444" : item.status === "Low" ? "#f59e0b" : "#10b981"} />
                              <Cell fill="#f1f5f9" />
                            </Pie>
                            <Tooltip formatter={v => [`${v} units`]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-base font-black text-slate-800">{item.bloodType}</span>
                        </div>
                      </div>
                      <p className="text-lg font-black text-slate-800 mt-1">{total} <span className="text-xs text-slate-400 font-medium">units</span></p>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${STATUS_CONFIG[item.status]?.bg} ${STATUS_CONFIG[item.status]?.text}`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-black text-slate-800 mb-6">Component Breakdown</h2>
              <ResponsiveContainer width="100%" height={280} debounce={50}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Whole Blood" fill={COMPONENT_COLORS.wholeBlood} radius={[4,4,0,0]} />
                  <Bar dataKey="Plasma"      fill={COMPONENT_COLORS.plasma}     radius={[4,4,0,0]} />
                  <Bar dataKey="Platelets"   fill={COMPONENT_COLORS.platelets}  radius={[4,4,0,0]} />
                  <Bar dataKey="RBC"         fill={COMPONENT_COLORS.rbc}        radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* =================== ADD STOCK MODAL =================== */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: "90vh" }}>

            {/* Fixed header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ArrowUpCircle size={20} className="text-emerald-600"/> {editItem ? "Update Stock" : "Add New Stock"}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">{editItem ? `Adding to ${editItem.bloodType}` : "Register incoming blood supply"}</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6">
              <form id="add-stock-form" onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-wider">Blood Group *</label>
                  <select name="bloodType" value={addForm.bloodType} onChange={e => setAddForm({...addForm, bloodType: e.target.value})} required
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-700">
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {COMPONENTS.map(f => (
                    <div key={f.key}>
                      <label className={`text-xs font-black uppercase ml-1 tracking-wider ${f.color}`}>{f.label}</label>
                      <input name={f.key} type="number" min="0" value={addForm[f.key]}
                        onChange={e => setAddForm({...addForm, [f.key]: e.target.value})}
                        placeholder="0"
                        className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold" />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-amber-500 ml-1 tracking-wider">Expiring Soon (units)</label>
                  <input name="expiringSoon" type="number" min="0" value={addForm.expiringSoon}
                    onChange={e => setAddForm({...addForm, expiringSoon: e.target.value})}
                    placeholder="0"
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold" />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-wider">Source of Blood *</label>
                  <select name="source" value={addForm.source} onChange={e => setAddForm({...addForm, source: e.target.value})} required
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-700">
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-wider">Notes</label>
                  <textarea name="notes" value={addForm.notes} onChange={e => setAddForm({...addForm, notes: e.target.value})}
                    placeholder="Optional notes..." rows={2}
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-medium text-sm resize-none" />
                </div>

                <div className="bg-emerald-50 rounded-xl p-3 text-sm text-emerald-700 border border-emerald-100 font-medium">
                  Stock will be added to existing inventory. Status auto-calculated.
                </div>
              </form>
            </div>

            {/* Fixed footer — always visible */}
            <div className="p-6 pt-4 border-t border-slate-100 shrink-0">
              <button type="submit" form="add-stock-form" disabled={submitting}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : <CheckCircle2 size={18}/>}
                {submitting ? "Saving..." : "Register Stock IN"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================== DISPENSE MODAL =================== */}
      {showOutForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: "90vh" }}>

            {/* Fixed header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ArrowDownCircle size={20} className="text-red-600"/> Dispense Blood
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">Issue blood out of inventory</p>
              </div>
              <button onClick={() => { setShowOutForm(false); setDispenseError(""); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6">
              <form id="dispense-form" onSubmit={handleDispenseSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-wider">Blood Group *</label>
                  <select value={outForm.bloodType} onChange={e => setOutForm({...outForm, bloodType: e.target.value, units: ""})} required
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-none font-bold text-slate-700">
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-wider">Component *</label>
                  <select value={outForm.component} onChange={e => setOutForm({...outForm, component: e.target.value, units: ""})} required
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-none font-bold text-slate-700">
                    {COMPONENTS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between ml-1 mb-1.5">
                    <label className="text-xs font-black uppercase text-red-500 tracking-wider">Units to Dispense *</label>
                    {outForm.bloodType && (
                      <span className="text-xs font-bold text-slate-400">
                        Available: <span className="text-slate-700 font-black">
                          {inventory.find(i => i.bloodType === outForm.bloodType)?.[outForm.component] ?? 0}
                        </span>
                      </span>
                    )}
                  </div>
                  <input
                    type="number" min="1"
                    max={outForm.bloodType ? (inventory.find(i => i.bloodType === outForm.bloodType)?.[outForm.component] ?? undefined) : undefined}
                    value={outForm.units}
                    onChange={e => { setOutForm({...outForm, units: e.target.value}); setDispenseError(""); }}
                    required
                    placeholder="Enter units"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-wider">Issued To (Hospital / Patient) *</label>
                  <input type="text" value={outForm.issuedTo} onChange={e => setOutForm({...outForm, issuedTo: e.target.value})} required
                    placeholder="e.g. City Hospital, Patient ID..."
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-none font-bold" />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-wider">Reason *</label>
                  <select value={outForm.reason} onChange={e => setOutForm({...outForm, reason: e.target.value})} required
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-none font-bold text-slate-700">
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-wider">Notes</label>
                  <textarea value={outForm.notes} onChange={e => setOutForm({...outForm, notes: e.target.value})}
                    placeholder="Optional notes..." rows={2}
                    className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 outline-none font-medium text-sm resize-none" />
                </div>

                {/* Inline error — replaces alert() */}
                {dispenseError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-500" />
                    {dispenseError}
                  </div>
                )}

                <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-700 border border-amber-100 font-medium">
                  This will deduct units from inventory and log the transaction. Action cannot be undone.
                </div>
              </form>
            </div>

            {/* Fixed footer — always visible */}
            <div className="p-6 pt-4 border-t border-slate-100 shrink-0">
              <button type="submit" form="dispense-form" disabled={submitting}
                className="w-full bg-red-600 text-white py-3.5 rounded-xl font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/> : <ArrowDownCircle size={18}/>}
                {submitting ? "Processing..." : "Confirm Dispense"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, color, trend }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black">{value}</h2>
          {trend === "down" && value > 0 && <TrendingDown size={16} className="text-red-500"/>}
          {trend === "up"   && <TrendingUp  size={16} className="text-emerald-500"/>}
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
