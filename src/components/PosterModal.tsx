import React from 'react';
import { X, Download, ExternalLink, Sparkles, Award } from 'lucide-react';
import { ENIGMA_INFO } from '../data/culturalCellData';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-all animate-fadeIn">
      <div 
        className="relative max-w-4xl w-full max-h-[92vh] bg-[#0d1322] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Official Cultural Cell UCER Poster
              </h3>
              <p className="text-xs text-gray-400">
                United College of Engineering and Research, Prayagraj
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={ENIGMA_INFO.posterUrl}
              download="Cultural_Cell_UCER_Enigma_Poster.jpg"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors"
              title="Download Poster"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/20 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content with Image */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-center justify-center">
          <div className="relative rounded-xl overflow-hidden border border-white/15 shadow-xl max-w-sm sm:max-w-md w-full bg-black">
            <img
              src={ENIGMA_INFO.posterUrl}
              alt="Official Cultural Cell UCER Poster"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          {/* Slogans & Details extracted from Poster */}
          <div className="flex-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>United Group of Institutions</span>
            </div>

            <h4 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400">
              CULTURAL CELL UCER
            </h4>

            <div className="space-y-2 text-sm text-gray-300">
              <p className="font-semibold text-white tracking-wide">
                CELEBRATE • CREATE • CONNECT
              </p>
              <p className="italic text-rose-300 text-sm font-medium">
                "One Campus • Many Talents • One Stage"
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Arts • People • Events • Community — Express, Create, Belong.
                Featuring dance, vocal showcases, photography, dramatics, battle of bands, and grand campus celebrations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Core Themes from the Poster:
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['PERFORM', 'CAPTURE', 'COLLABORATE', 'CREATE', 'UNITE', 'CELEBRATE'].map((pill) => (
                  <span
                    key={pill}
                    className="px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-medium"
                  >
                    #{pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={ENIGMA_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90 transition-all shadow-md shadow-purple-600/20"
              >
                <span>Follow @{ENIGMA_INFO.instagram}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-gray-200 transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
