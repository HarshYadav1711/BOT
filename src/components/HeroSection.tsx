import React from 'react';
import { Sparkles, ArrowRight, Eye, MapPin, Award, ShieldCheck } from 'lucide-react';
import { ENIGMA_INFO } from '../data/culturalCellData';

interface HeroSectionProps {
  onOpenPosterModal: () => void;
  onSelectYearRegister: (year: '2nd Year' | '3rd Year') => void;
  onOpenStatusModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenPosterModal,
  onSelectYearRegister,
  onOpenStatusModal,
}) => {
  const scrollToRegister = (year: '2nd Year' | '3rd Year') => {
    onSelectYearRegister(year);
    const el = document.getElementById('register');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/25 via-rose-600/20 to-amber-500/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Grid texture overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Top Banner Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-black/20">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Official Recruitment 2025 • Cultural Cell UCER
            </span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs font-medium text-rose-300">
              Prayagraj
            </span>
          </div>

          {/* Main Titles */}
          <div className="space-y-3">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-gray-400 flex items-center justify-center lg:justify-start gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              United College of Engineering and Research Presents
            </h2>
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] font-heading uppercase text-white">
              CULTURAL CELL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.35)]">
                {ENIGMA_INFO.festName}
              </span>
            </h1>
            <p className="text-base sm:text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200">
              {ENIGMA_INFO.tagline}
            </p>
          </div>

          {/* Slanted Subtagline & Description */}
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            <strong className="text-white font-semibold">{ENIGMA_INFO.subTagline}.</strong> Be the force behind Allahabad’s most anticipated collegiate cultural spectacle. We are now recruiting passionate <strong className="text-amber-400">2nd Year Volunteers</strong> to execute and ambitious <strong className="text-rose-400">3rd Year Domain Heads</strong> to lead Tech, Media, Design, Management, Decor, and Sponsorships.
          </p>

          {/* Action CTAs: Dual streams */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              onClick={() => scrollToRegister('2nd Year')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-gray-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Apply as 2nd Year Volunteer</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToRegister('3rd Year')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-rose-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Apply as 3rd Year Head</span>
            </button>
          </div>

          {/* Secondary links & Tracker */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-gray-400">
            <button
              onClick={onOpenStatusModal}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-300 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Already registered? Check Application & Interview Status</span>
            </button>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              UCER Campus, Naini, Prayagraj
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-xl font-extrabold text-amber-400 font-heading">8+</div>
              <div className="text-[11px] text-gray-400 font-medium">Speciality Domains</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-xl font-extrabold text-rose-400 font-heading">100+</div>
              <div className="text-[11px] text-gray-400 font-medium">Crew & Leads</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-xl font-extrabold text-purple-400 font-heading">3500+</div>
              <div className="text-[11px] text-gray-400 font-medium">Student Footfall</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-xl font-extrabold text-emerald-400 font-heading">1</div>
              <div className="text-[11px] text-gray-400 font-medium">Grand Campus Stage</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Poster Spotlight Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative group w-full max-w-sm sm:max-w-md">
            {/* Glowing Backdrop Rim */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 rounded-3xl blur-md opacity-60 group-hover:opacity-90 transition duration-500 group-hover:duration-200"></div>

            {/* Poster Card Container */}
            <div className="relative rounded-2xl bg-[#0d1322] border border-white/15 overflow-hidden shadow-2xl p-3">
              {/* Image with overlay badge */}
              <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-black">
                <img
                  src={ENIGMA_INFO.posterUrl}
                  alt="Cultural Cell UCER Official Poster"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Floating pill */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Official Campus Poster</span>
                </div>

                {/* Inspect Button Trigger */}
                <button
                  onClick={onOpenPosterModal}
                  className="absolute bottom-4 left-4 right-4 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Eye className="w-4 h-4 text-amber-300" />
                  <span>View Full Poster & Slogans</span>
                </button>
              </div>

              {/* Poster info footer */}
              <div className="mt-3 px-2 py-1 flex items-center justify-between text-xs text-gray-300">
                <span className="font-semibold text-white">Cultural Cell UCER</span>
                <span className="text-amber-400 font-mono">ENIGMA '25</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
