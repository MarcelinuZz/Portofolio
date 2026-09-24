import { useState } from 'react';
import { contactDetails } from '../data/socialLinks';
import { MessageCircle, Mail, Copy, Check, ArrowUpRight } from 'lucide-react';
import SocialLinks from './SocialLinks';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactDetails.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="relative w-full py-28 px-6 sm:px-12 lg:px-20 bg-[#0a0c10]">
      <div className="w-full max-w-5xl mx-auto rounded-2xl bg-[#12151e] border border-white/10 p-8 sm:p-12 lg:p-14 shadow-xl relative overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Heading & Context */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs uppercase tracking-widest font-semibold text-[#e5ad68]">
              Connect
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Let’s build something together.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
              Whether you want to discuss software development, engineering projects, or explore collaboration opportunities, I am open to connecting.
            </p>

            <div className="pt-2">
              <SocialLinks variant="pills" />
            </div>
          </div>

          {/* Right: Direct Outreach Action Box */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            
            {/* WhatsApp Direct Chat Button */}
            <a
              href={contactDetails.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-[#181d28] hover:bg-[#1e2432] border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-[#e5ad68]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    WhatsApp Message
                  </div>
                  <div className="text-xs text-slate-400">
                    Direct conversation
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </a>

            {/* Email Copy Box */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">Email Address</div>
                  <div className="text-xs sm:text-sm font-mono text-slate-200 truncate">
                    {contactDetails.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="shrink-0 p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors ml-2"
                aria-label="Copy email address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Availability notice without pulsing dot */}
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{contactDetails.availability}</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
