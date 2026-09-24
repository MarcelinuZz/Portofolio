import { useState, useEffect } from 'react';

const navItems = [
  { id: 'hero', label: 'About' },
  { id: 'journey', label: 'Journey' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' }
];

export default function Navigation({ activeSection = 'hero', onNavigate }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e, id) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex justify-center items-center py-5 px-4 pointer-events-none">
      <nav
        aria-label="Primary navigation"
        className={`pointer-events-auto flex items-center gap-1 sm:gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#0f121a]/90 backdrop-blur-md border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)]'
            : 'bg-[#0f121a]/60 backdrop-blur-sm border border-white/[0.06]'
        }`}
      >
        {/* Brand name */}
        <a
          href="#hero"
          onClick={(e) => handleClick(e, 'hero')}
          className="flex items-center gap-2 pl-1 pr-3 text-xs tracking-wider font-semibold text-white hover:text-[#e5ad68] transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-[#e5ad68]" />
          <span className="font-bold tracking-tight">Marcelinus</span>
        </a>

        <div className="h-3.5 w-px bg-white/10 mx-1" />

        {/* Section Links */}
        <ul className="flex items-center gap-1 list-none m-0 p-0">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`block px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
