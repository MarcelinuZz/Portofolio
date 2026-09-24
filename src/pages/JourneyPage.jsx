import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Journey from '../components/Journey';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function JourneyPage() {
  const [activeSection, setActiveSection] = useState('journey');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = ['journey', 'projects', 'contact'];
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-[#f0f2f8] overflow-x-clip">
      
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-center items-center py-5 px-4 pointer-events-none">
        <nav
          aria-label="Journey navigation"
          className={`pointer-events-auto flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-full transition-all duration-300 ${
            scrolled
              ? 'bg-[#12151e]/90 backdrop-blur-md border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)]'
              : 'bg-[#12151e]/60 backdrop-blur-sm border border-white/[0.08]'
          }`}
        >
          {/* Back to About Page Button */}
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Back to About Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#e5ad68]" />
            <span>Back to About</span>
          </Link>

          <div className="h-3.5 w-px bg-white/15" />

          {/* Section Jump Links */}
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {[
              { id: 'journey', label: 'Journey' },
              { id: 'projects', label: 'Projects' },
              { id: 'contact', label: 'Contact' }
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo(item.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col">
        <Journey />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
