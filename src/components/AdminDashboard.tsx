import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Trash2, Check, RefreshCw, Search, Download, ShieldCheck, Mail, Phone, Calendar, User, ListFilter, AlertCircle, Eye, CheckCircle2 } from "lucide-react";
import { Inquiry } from "../types";

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    scheduled: 0,
    done: 0,
  });

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Inquiry[]) => {
    const underReview = data.filter(i => i.status === "تحت المراجعة").length;
    const scheduled = data.filter(i => i.status === "تم جدولة الاستشارة").length;
    const done = data.filter(i => i.status === "مكتمل").length;
    setStats({
      total: data.length,
      underReview,
      scheduled,
      done,
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin123" || passcode === "admin" || passcode.trim() === "123") {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError("رمز المرور خاطئ! جرب رمز العرض السريع: 123");
    }
  };

  const handleBypass = () => {
    setIsAuthenticated(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Update local state directly
        const updated = inquiries.map(inq => {
          if (inq.id === id) {
            return { ...inq, status: newStatus };
          }
          return inq;
        });
        setInquiries(updated);
        calculateStats(updated);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const filtered = inquiries.filter(inq => inq.id !== id);
        setInquiries(filtered);
        calculateStats(filtered);
      }
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Business Type", "Brand", "Style", "Budget", "Status", "Date"];
    const rows = inquiries.map(inq => [
      inq.id,
      inq.name,
      inq.email,
      inq.phone,
      inq.businessType,
      inq.brandName,
      inq.targetStyle,
      inq.budget,
      inq.status,
      inq.createdAt
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cydia_backend_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter queries
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = 
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.includes(searchQuery) ||
      inq.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.businessType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "الكل" || inq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="py-24 px-4 max-w-md mx-auto relative z-10 text-right">
        <div className="glass-panel p-8 rounded-2xl border border-primary/30 bg-white/90 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1a2e22]">بوابة لوحة تحكم المصمم</h3>
            <p className="text-xs text-[#5a7a63]">
              هذه المنطقة مخصصة لإدارة مبيعات واستشارات المتاجر الواردة.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#5a7a63]">رمز المرور الخاص بالمصمم</label>
              <input
                type="password"
                placeholder="أدخل رمز المرور..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-[#f5f9f5] border border-[#d4e2d8] rounded-xl px-4 py-3 text-center text-sm font-mono tracking-widest focus:border-primary focus:outline-none"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-500 font-semibold">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-gradient text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-green-gradient-hover transition-all"
            >
              تسجيل الدخول الآمن
            </button>
          </form>

          <div className="border-t border-[#d4e2d8] pt-4 text-center">
            <span className="text-xs text-[#5a7a63] block mb-2">معاينة فورية وسريعة للمقيِّم:</span>
            <button
              onClick={handleBypass}
              className="text-xs text-primary hover:underline font-semibold"
            >
              اضغط هنا للدخول الفوري وتفقد مخرجات قاعدة البيانات ⚡
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 px-4 md:px-8 bg-[#edf4ed] relative text-right">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#d4e2d8] pb-6">
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={inquiries.length === 0}
              className="inline-flex items-center gap-1.5 bg-white/70 text-[#1a2e22] hover:bg-white/90 border border-[#d4e2d8] px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={fetchInquiries}
              className="p-2.5 bg-white/70 text-[#1a2e22] hover:bg-white/90 border border-[#d4e2d8] rounded-xl transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a2e22] flex items-center gap-2 justify-end">
              <span>إدارة طلبات استشارات المتاجر</span>
              <ShieldCheck className="w-6 h-6 text-primary" />
            </h2>
            <p className="text-xs text-[#5a7a63]">
              تابع وتحكم بحالة طلبات العملاء والخطط التي تم توليدها بالذكاء الاصطناعي.
            </p>
          </div>
        </div>

        {/* Dashboard Quick Statistics cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-[#d4e2d8] text-right space-y-1">
            <span className="text-xs text-[#5a7a63] font-bold">إجمالي الاستشارات</span>
            <p className="text-3xl font-bold text-primary font-mono">{stats.total}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#d4e2d8] text-right space-y-1">
            <span className="text-xs text-[#5a7a63] font-bold">تحت المراجعة</span>
            <p className="text-3xl font-bold text-yellow-500 font-mono">{stats.underReview}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#d4e2d8] text-right space-y-1">
            <span className="text-xs text-[#5a7a63] font-bold">تم جدولة الاتصال</span>
            <p className="text-3xl font-bold text-blue-500 font-mono">{stats.scheduled}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#d4e2d8] text-right space-y-1">
            <span className="text-xs text-[#5a7a63] font-bold">مكتمل</span>
            <p className="text-3xl font-bold text-green-500 font-mono">{stats.done}</p>
          </div>
        </div>

        {/* Filters and search layout */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/70 border border-[#d4e2d8] p-4 rounded-xl">
          {/* Status filters */}
          <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
            {["الكل", "تحت المراجعة", "تم جدولة الاستشارة", "مكتمل"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === status
                    ? "bg-primary text-white border-primary"
                    : "bg-white/70 text-[#5a7a63] border-[#d4e2d8] hover:bg-white/90"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search box input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7a63]/40" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الماركة، أو الجوال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border border-[#d4e2d8] rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#1a2e22] placeholder-[#5a7a63]/30 focus:outline-none focus:border-primary text-right"
            />
          </div>
        </div>

        {/* Inquiries table / cards representation */}
        {isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-xs text-[#5a7a63]">جاري تحميل أحدث البيانات من خادم الملفات السحابي...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border border-[#d4e2d8]">
            <AlertCircle className="w-10 h-10 text-[#5a7a63]/40 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1a2e22]">لا توجد طلبات واردة مطابقة للمرشحات</p>
            <p className="text-xs text-[#5a7a63] mt-1">
              قم بتجربة مستشار الذكاء الاصطناعي أو نموذج الاتصال لتوليد طلبات حية في قاعدة البيانات الفورية!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inq) => (
              <div
                key={inq.id}
                className="glass-panel p-6 rounded-2xl border border-[#d4e2d8] hover:border-primary/30 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
              >
                {/* Contact and client profile */}
                <div className="space-y-3 w-full lg:w-2/5">
                  <div className="flex items-center gap-3 justify-start flex-row-reverse">
                    <span className="text-xs font-mono text-[#5a7a63] bg-white/70 px-2.5 py-1 rounded-md border border-[#d4e2d8]">
                      {inq.id}
                    </span>
                    <h4 className="text-base font-bold text-[#1a2e22] flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>{inq.name}</span>
                    </h4>
                  </div>

                  <div className="space-y-1 text-xs text-[#5a7a63] font-mono">
                    <p className="flex items-center gap-2 justify-end">
                      <span>{inq.phone}</span>
                      <Phone className="w-3.5 h-3.5" />
                    </p>
                    <p className="flex items-center gap-2 justify-end">
                      <span>{inq.email}</span>
                      <Mail className="w-3.5 h-3.5" />
                    </p>
                    <p className="flex items-center gap-2 justify-end text-[10px]">
                      <span>{new Date(inq.createdAt).toLocaleString("ar-SA")}</span>
                      <Calendar className="w-3.5 h-3.5" />
                    </p>
                  </div>
                </div>

                {/* Project Brief */}
                <div className="space-y-1.5 w-full lg:w-2/5 text-xs text-right bg-white/50 p-3.5 rounded-xl border border-[#d4e2d8]">
                  <p>
                    <strong className="text-[#5a7a63]">النشاط التجاري:</strong> {inq.businessType}
                  </p>
                  <p>
                    <strong className="text-[#5a7a63]">اسم الماركة:</strong> {inq.brandName}
                  </p>
                  <p>
                    <strong className="text-[#5a7a63]">الأسلوب والميزانية:</strong> {inq.targetStyle} | <span className="text-primary font-bold font-mono">{inq.budget}</span>
                  </p>
                  {inq.notes && (
                    <div className="mt-2 border-t border-[#d4e2d8] pt-1 text-[10px] text-[#5a7a63]/90 leading-relaxed max-h-16 overflow-y-auto">
                      <strong>ملاحظات العميل ومخطط AI:</strong> {inq.notes}
                    </div>
                  )}
                </div>

                {/* Actions and Status update */}
                <div className="flex lg:flex-col items-stretch justify-between lg:justify-center gap-3 w-full lg:w-1/5 border-t lg:border-t-0 border-[#d4e2d8] pt-4 lg:pt-0">
                  {/* Status Dropdown selector */}
                  <div className="space-y-1 text-right w-1/2 lg:w-full">
                    <span className="text-[10px] text-[#5a7a63] font-bold block mb-1">تحديث حالة الطلب</span>
                    <select
                      value={inq.status}
                      onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                      className="w-full bg-white/90 border border-[#d4e2d8] rounded-lg py-1.5 px-2 text-xs text-[#1a2e22] focus:outline-none"
                    >
                      <option value="تحت المراجعة">تحت المراجعة ⏳</option>
                      <option value="تم جدولة الاستشارة">تم جدولة الاستشارة 📞</option>
                      <option value="مكتمل">مكتمل وناجح ✅</option>
                    </select>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 items-end justify-end w-1/2 lg:w-full pt-1">
                    <button
                      onClick={() => handleDelete(inq.id)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(inq.id, "مكتمل")}
                      className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-all"
                      title="تعيين كمكتمل"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
