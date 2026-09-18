import React from 'react';
import { Sparkles, Shield, Search, UserCheck, Flame } from 'lucide-react';
import { ENIGMA_INFO } from '../data/culturalCellData';

interface NavbarProps {
  onOpenStatusModal: () => void;
  onOpenAdminModal: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminDashboard: () => void;
  onSelectYearRegister: (year: '2nd Year' | '3rd Year') => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenStatusModal,
  onOpenAdminModal,
  isAdminLoggedIn,
  onOpenAdminDashboard,
  onSelectYearRegister,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090d16]/85 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & Branding */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 p-[2px] shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 font-heading uppercase">
                Cultural Cell UCER
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {ENIGMA_INFO.festName}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium tracking-tight">
              United College of Engineering & Research, Prayagraj
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => scrollToSection('about')}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            About Fest
          </button>
          <button
            onClick={() => scrollToSection('domains')}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Domains & Roles
          </button>
          <button
            onClick={() => scrollToSection('core-team')}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Core Team
          </button>
          <button
            onClick={() => {
              scrollToSection('register');
              onSelectYearRegister('2nd Year');
            }}
            className="px-3 py-2 rounded-lg text-sm font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
          >
            2nd Year (Volunteers)
          </button>
          <button
            onClick={() => {
              scrollToSection('register');
              onSelectYearRegister('3rd Year');
            }}
            className="px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
          >
            3rd Year (Domain Heads)
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Check Status Button */}
          <button
            onClick={onOpenStatusModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all shadow-sm"
            title="Check your registration review & interview status"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Check Status</span>
            <span className="sm:hidden">Status</span>
          </button>

          {/* Register CTA */}
          <button
            onClick={() => scrollToSection('register')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:opacity-95 shadow-md shadow-rose-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Register Now</span>
          </button>

          {/* Admin Portal Gateway */}
          {isAdminLoggedIn ? (
            <button
              onClick={onOpenAdminDashboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all shadow-sm"
              title="Open Admin Management Panel"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Admin Panel</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
              title="Admin Login for Cultural Cell Executives"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
