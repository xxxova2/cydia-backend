import { useState } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

export default function Header({ onNavigate, activeSection }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { id: "work", label: "أعمالنا" },
    { id: "services", label: "خدماتنا" },
    { id: "contact", label: "اتصل بنا" },
  ];
  const handleClick = (id: string) => { onNavigate(id); setIsOpen(false); };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#d4e2d8]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2">
          <img src="/cydia.png" alt="Cydia" className="w-7 h-7 rounded" />
          <span className="text-lg font-bold tracking-tight text-primary">CYDIA BACKEND</span>
        </button>
        <nav className="hidden md:flex gap-8 items-center">
          {links.map(l => (
            <button key={l.id} onClick={() => handleClick(l.id)}
              className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === l.id ? "text-primary" : "text-[#5a7a63]"}`}>{l.label}</button>
          ))}
          <button onClick={() => handleClick("contact")}
            className="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-full hover:bg-[#2d6b46] transition-all shadow-md">تواصل معنا</button>
        </nav>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#1a2e22] p-1">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white border-b border-[#d4e2d8] px-4 py-4 space-y-3">
          {links.map(l => (
            <button key={l.id} onClick={() => handleClick(l.id)}
              className="block w-full text-right py-2 text-sm font-medium text-[#5a7a63] hover:text-primary">{l.label}</button>
          ))}
          <button onClick={() => handleClick("contact")}
            className="w-full text-center bg-primary text-white py-2.5 rounded-full text-sm font-semibold">تواصل معنا</button>
        </div>
      )}
    </header>
  );
}
