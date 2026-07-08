import Reveal from "./Reveal";

export default function Footer() {
  return (
    <Reveal>
    <footer className="py-10 px-4 md:px-8 bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
        <div className="flex items-center gap-2">
          <img src="/cydia.png" alt="Cydia" className="w-5 h-5 rounded" />
          <span className="font-bold text-primary">CYDIA BACKEND</span>
        </div>
        <div className="flex gap-6">
          <a href="mailto:0xcydia@gmail.com" className="hover:text-primary transition-colors">0xcydia@gmail.com</a>
          <a href="tel:0511572334" className="hover:text-primary transition-colors">0511572334</a>
        </div>
        <span>&copy; {new Date().getFullYear()} CYDIA BACKEND</span>
      </div>
    </footer>
    </Reveal>
  );
}
