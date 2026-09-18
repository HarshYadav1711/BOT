import React, { useState } from 'react';
import { 
  Code, 
  Camera, 
  Palette, 
  CalendarCheck, 
  Briefcase, 
  ShieldAlert, 
  Sparkles, 
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Crown,
  HandHelping
} from 'lucide-react';
import { DOMAINS_DATA } from '../data/culturalCellData';
import type { DomainType } from '../types/registration';

interface DomainsSectionProps {
  onSelectDomainForRegistration: (domain: DomainType) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Code,
  Camera,
  Palette,
  CalendarCheck,
  Briefcase,
  ShieldAlert,
  Sparkles,
  Megaphone,
};

export const DomainsSection: React.FC<DomainsSectionProps> = ({
  onSelectDomainForRegistration,
}) => {
  const [activeDomainId, setActiveDomainId] = useState<DomainType>(DOMAINS_DATA[0].id);

  const activeDomain = DOMAINS_DATA.find((d) => d.id === activeDomainId) || DOMAINS_DATA[0];
  const ActiveIcon = ICON_MAP[activeDomain.iconName] || Sparkles;

  const handleApply = (domain: DomainType) => {
    onSelectDomainForRegistration(domain);
    const el = document.getElementById('register');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="domains" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Find Your Arena</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          EXPLORE DOMAINS & ROLES
        </h2>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
          Whether you build code, shoot cinematic frames, orchestrate crowd flow, or pitch corporate sponsors — there is an impactful place for your genius at Enigma 2026.
        </p>
      </div>

      {/* Domain Quick Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {DOMAINS_DATA.map((domain) => {
          const Icon = ICON_MAP[domain.iconName] || Sparkles;
          const isActive = domain.id === activeDomainId;
          return (
            <button
              key={domain.id}
              onClick={() => setActiveDomainId(domain.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-600/25 scale-105'
                  : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{domain.title}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Domain Spotlight Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#11172a] to-[#0b0f19] border border-white/15 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Domain Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${activeDomain.color} p-[2px]`}>
                <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                  <ActiveIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  {activeDomain.title}
                </h3>
                <p className="text-xs text-amber-400 font-medium tracking-wide">
                  Enigma 2026 Core Vertical
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {activeDomain.fullDesc}
            </p>

            {/* Skills required */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Key Competencies Looked For in Interview:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeDomain.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-gray-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleApply(activeDomain.id)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:opacity-95 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                <span>Register for {activeDomain.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Volunteer vs Head Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            {/* 3rd Year Head Roles */}
            <div className="p-5 rounded-2xl bg-rose-500/[0.07] border border-rose-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    3rd Year Leadership (Heads / Co-Heads)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  Head Position
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Lead the vertical strategy, manage 2nd-year volunteer batches, coordinate directly with President Himanshu Mishra & core executives.
              </p>
              <div className="space-y-1.5">
                {activeDomain.headRoles.map((role) => (
                  <div key={role} className="flex items-center gap-2 text-xs font-semibold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2nd Year Volunteer Roles */}
            <div className="p-5 rounded-2xl bg-cyan-500/[0.07] border border-cyan-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HandHelping className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    2nd Year Operations (Volunteers)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  Volunteer
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Ground execution, tech consoles, live coverage, stage coordination, and learning the ropes from senior heads.
              </p>
              <div className="space-y-1.5">
                {activeDomain.volunteerRoles.map((role) => (
                  <div key={role} className="flex items-center gap-2 text-xs font-semibold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
