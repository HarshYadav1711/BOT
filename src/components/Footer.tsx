import React from 'react';
import { Flame, Phone, MapPin, Shield, ArrowUp } from 'lucide-react';
import { ENIGMA_INFO } from '../data/culturalCellData';
import { InstagramIcon } from './InstagramIcon';

interface FooterProps {
  onOpenAdminModal: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdminModal,
  isAdminLoggedIn,
  onOpenAdminDashboard,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070a12] border-t border-white/10 text-gray-400 text-xs relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-600/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 p-[2px]">
                <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-wider font-heading uppercase block">
                  Cultural Cell UCER
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">
                  ENIGMA 2025
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              United College of Engineering and Research, Prayagraj.
              Empowering student artists, tech innovators, leaders, and cultural creators.
            </p>
            <p className="text-rose-300 italic text-xs">
              "One Campus • Many Talents • One Stage"
            </p>
          </div>

          {/* Col 2: Core Contact & Desk */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-heading">
              Executive Helpdesk
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-300 font-semibold block">Himanshu Mishra</span>
                <span className="text-amber-400 text-[11px]">President, Cultural Cell</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <a href="tel:8960194225" className="hover:text-white transition-colors">
                  +91 8960194225
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                <a
                  href="https://instagram.com/himanshumishra3071"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @himanshumishra3071
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Official Socials */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-heading">
              Festival Handles
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={ENIGMA_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
              >
                <InstagramIcon className="w-4 h-4 text-pink-400" />
                <div>
                  <span className="font-bold block">@{ENIGMA_INFO.instagram}</span>
                  <span className="text-[10px] text-gray-400">Official Fest Page</span>
                </div>
              </a>
              <div className="flex items-start gap-2 text-gray-400 pt-1">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>UCER Campus, Industrial Area, Naini, Prayagraj, UP - 211010</span>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Portals */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-heading">
              Portals & Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#register" className="hover:text-white transition-colors">
                  2nd Year Volunteer Recruitment
                </a>
              </li>
              <li>
                <a href="#register" className="hover:text-white transition-colors">
                  3rd Year Domain Head Recruitment
                </a>
              </li>
              <li>
                <a href="#domains" className="hover:text-white transition-colors">
                  Domain Guide & Responsibilities
                </a>
              </li>
              <li className="pt-2">
                {isAdminLoggedIn ? (
                  <button
                    onClick={onOpenAdminDashboard}
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Open Admin Console</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAdminModal}
                    className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Portal Login</span>
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom credits & back to top */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Cultural Cell UCER. All Rights Reserved. United College of Engineering and Research, Prayagraj.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
