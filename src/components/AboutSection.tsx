import React from 'react';
import { Zap, Flame, Music, Video, Palette } from 'lucide-react';
import { ENIGMA_INFO } from '../data/culturalCellData';

export const AboutSection: React.FC = () => {
  const highlights = [
    {
      title: 'Vocal & Dance Extravaganza',
      desc: 'Eastern and western solo/duet vocals, power-packed group dance battles, and classical recitals.',
      icon: Music,
      color: 'from-amber-500 to-rose-500',
    },
    {
      title: 'Battle of the Bands & Pro-Nights',
      desc: 'Electric acoustics, rock anthems, celebrity artist nights, and high-octane stadium energy.',
      icon: Zap,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Cinematography & Visual Lore',
      desc: 'High-definition aftermovies, live stream feeds, reel marathons, and photo archives.',
      icon: Video,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Art Installations & Theme Decor',
      desc: 'Mesmerizing entrance portals, neon tunnels, origami arches, and Instagram-worthy campus corners.',
      icon: Palette,
      color: 'from-rose-500 to-pink-500',
    },
  ];

  const recruitmentSteps = [
    {
      step: '01',
      title: 'Online Application',
      desc: 'Submit your profile, portfolio, and domain preference without needing an account. 3rd years provide previous Enigma track record.',
    },
    {
      step: '02',
      title: 'Core Screening',
      desc: 'President Himanshu Mishra and Domain Leads review all submissions against experience, skill set, and passion.',
    },
    {
      step: '03',
      title: 'Personal Interview',
      desc: 'Shortlisted candidates attend an offline or digital interview to test technical aptitude, problem solving, and leadership.',
    },
    {
      step: '04',
      title: 'Final Selection',
      desc: 'Selected volunteers & heads receive WhatsApp induction invitations and commence official Enigma 2025 operations.',
    },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Flame className="w-3.5 h-3.5" />
          <span>The Pulse of Campus Life</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          ABOUT CULTURAL CELL UCER
        </h2>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
          {ENIGMA_INFO.description}
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg shadow-black/20 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} p-[1px] mb-4`}>
                <div className="w-full h-full bg-[#0d1322] rounded-[11px] flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-heading">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Roadmap / Selection Workflow */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#111728] to-[#0a0e1a] border border-white/10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Recruitment & Interview Process
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Clear, transparent, and merit-based induction for Volunteers and Heads
            </p>
          </div>
          <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Enigma 2025 Edition
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recruitmentSteps.map((step) => (
            <div key={step.step} className="relative space-y-3">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-500 font-heading">
                {step.step}
              </div>
              <h4 className="text-base font-bold text-white">
                {step.title}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
