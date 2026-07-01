import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setSuccess(true);
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <section id="contact" className="py-24 px-4 md:px-8 bg-[#edf4ed]">
      <div className="max-w-3xl mx-auto text-center space-y-10">
        <div>
          <span className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full">تواصل معنا</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2e22] mt-4">لنتعاون معاً</h2>
          <p className="text-[#5a7a63] mt-2">تواصل معنا وسنرد خلال ٢٤ ساعة.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 text-right">
          <div className="space-y-4">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-md border border-[#d4e2d8]">
              <p className="text-xs font-semibold text-[#5a7a63]">البريد الإلكتروني</p>
              <a href="mailto:0xcydia@gmail.com" className="text-sm font-medium text-primary hover:underline">0xcydia@gmail.com</a>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-md border border-[#d4e2d8]">
              <p className="text-xs font-semibold text-[#5a7a63]">جوال / واتساب</p>
              <a href="tel:0511572334" className="text-sm font-medium text-primary hover:underline">0511572334</a>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-md border border-[#d4e2d8]">
              <p className="text-xs font-semibold text-[#5a7a63]">GitHub</p>
              <a href="https://github.com/xxxova2" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">github.com/xxxova2</a>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-md border border-[#d4e2d8]">
            {success ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <p className="font-semibold text-[#1a2e22]">تم إرسال الرسالة!</p>
                <p className="text-sm text-[#5a7a63]">سنرد عليك قريباً.</p>
                <button onClick={() => setSuccess(false)} className="text-xs font-medium text-primary hover:underline">إرسال رسالة أخرى</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-right">
                <input type="text" placeholder="الاسم *" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-[#d4e2d8] rounded-lg px-4 py-2.5 text-sm text-right focus:outline-none focus:border-primary" />
                <input type="email" placeholder="البريد الإلكتروني *" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#d4e2d8] rounded-lg px-4 py-2.5 text-sm text-right focus:outline-none focus:border-primary" />
                <textarea rows={3} placeholder="رسالتك" value={message} onChange={e => setMessage(e.target.value)}
                  className="w-full bg-white border border-[#d4e2d8] rounded-lg px-4 py-2.5 text-sm text-right focus:outline-none focus:border-primary resize-none" />
                <button type="submit" disabled={submitting}
                  className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2d6b46] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? "جاري الإرسال..." : "إرسال"} <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
