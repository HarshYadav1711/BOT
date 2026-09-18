import React from 'react';
import { 
  Phone, 
  MessageCircle, 
  Crown, 
  ExternalLink 
} from 'lucide-react';
import { CORE_TEAM_MEMBERS, ENIGMA_INFO } from '../data/culturalCellData';
import { InstagramIcon } from './InstagramIcon';

export const CoreTeamSection: React.FC = () => {
  return (
    <section id="core-team" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Section Heading */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Crown className="w-3.5 h-3.5" />
          <span>Leadership & Vision</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          CORE CULTURAL CELL TEAM
        </h2>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
          The driving minds behind the Cultural Cell UCER and ENIGMA 2025. Leading creative direction, event production, student relations, and institutional cultural legacy.
        </p>
      </div>

      {/* Official Enigma Instagram Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-amber-500/20 border border-pink-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-pink-500/30 shrink-0">
            <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
              <InstagramIcon className="w-7 h-7 text-pink-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                Official Festival Handle
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300">
                Live Updates
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
              @{ENIGMA_INFO.instagram}
            </h3>
            <p className="text-xs text-gray-300">
              Follow for audition dates, artist lineup drops, sneak peeks, and fest excitement!
            </p>
          </div>
        </div>

        <a
          href={ENIGMA_INFO.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 shadow-lg shadow-pink-600/30 transition-all transform hover:-translate-y-0.5"
        >
          <InstagramIcon className="w-4 h-4" />
          <span>Follow on Instagram</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Core Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CORE_TEAM_MEMBERS.map((member) => {
          const isLeadPresident = member.isPresident;

          return (
            <div
              key={member.id}
              className={`relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
                isLeadPresident
                  ? 'bg-gradient-to-b from-[#1c1829] to-[#0f1424] border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 sm:col-span-2 lg:col-span-2 xl:col-span-2'
                  : 'bg-[#0f1424]/90 border border-white/10 hover:border-white/20 shadow-lg shadow-black/25'
              }`}
            >
              {/* Card Header & Avatar */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${member.badgeColor} p-[2px] shadow-md`}
                    >
                      <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center font-heading font-black text-xl text-white">
                        {member.name.charAt(0)}
                      </div>
                    </div>
                    {isLeadPresident && (
                      <span className="absolute -top-2 -right-2 p-1 rounded-full bg-amber-500 text-gray-900 shadow-md">
                        <Crown className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      isLeadPresident
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/5 text-gray-300 border border-white/10'
                    }`}
                  >
                    {member.designation}
                  </span>
                </div>

                {/* Name & Domain */}
                <h3 className={`font-black text-white font-heading ${isLeadPresident ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
                  {member.name}
                </h3>
                <p className="text-xs text-rose-300 font-medium tracking-wide mt-0.5">
                  {member.domain}
                </p>

                {isLeadPresident && (
                  <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                    Spearheading Cultural Cell UCER operations, institutional coordination, festival planning, and student inductions for ENIGMA 2025.
                  </p>
                )}
              </div>

              {/* Social & Contact Actions */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                {/* Instagram Handle */}
                {member.instagram ? (
                  <a
                    href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>@{member.instagram}</span>
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 italic">Cultural Cell UCER</span>
                )}

                {/* President Contact Links */}
                {isLeadPresident && member.phone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${member.phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors"
                      title="Call President"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{member.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${member.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
