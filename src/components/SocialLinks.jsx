import { FileText, MessageCircle } from 'lucide-react';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './Icons';
import { socialLinks } from '../data/socialLinks';

const iconMap = {
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
  CV: FileText,
  Instagram: InstagramIcon,
  WhatsApp: MessageCircle
};

export default function SocialLinks({ className = '', variant = 'minimal' }) {
  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${className}`}>
        {socialLinks.map((item) => {
          const Icon = iconMap[item.name] || MessageCircle;
          return (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
              aria-label={`Open ${item.label}`}
            >
              <Icon className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.name === 'WhatsApp' ? 'Contact' : item.name}</span>
            </a>
          );
        })}
      </div>
    );
  }

  // Minimal inline list for subtle display
  return (
    <nav aria-label="Social connections" className={`flex items-center gap-5 sm:gap-7 ${className}`}>
      {socialLinks.map((item) => {
        const Icon = iconMap[item.name] || MessageCircle;
        const displayName = item.name === 'WhatsApp' ? 'Contact' : item.name;
        return (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors duration-200"
            aria-label={item.label}
          >
            <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            <span>{displayName}</span>
          </a>
        );
      })}
    </nav>
  );
}
