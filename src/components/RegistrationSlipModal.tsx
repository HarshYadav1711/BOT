import React from 'react';
import { 
  Printer, 
  X, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import type { Applicant } from '../types/registration';

interface RegistrationSlipModalProps {
  applicant: Applicant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationSlipModal: React.FC<RegistrationSlipModalProps> = ({
  applicant,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !applicant) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-all animate-fadeIn">
      <div 
        className="RegistrationSlipModal relative max-w-xl w-full bg-[#0d1322] border-2 border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti & Success Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm sm:text-base tracking-wide uppercase">
              Registration Successful!
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-left">
          {/* Watermark/Header inside slip */}
          <div className="text-center space-y-1 pb-4 border-b border-white/10">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              United College of Engineering and Research, Prayagraj
            </div>
            <h3 className="text-2xl font-black text-white font-heading">
              CULTURAL CELL • ENIGMA 2026
            </h3>
            <p className="text-xs text-gray-400">
              Official Candidate Recruitment Pass
            </p>
          </div>

          {/* Application ID Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase font-semibold">
                Application ID
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
                {applicant.id}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Under Review
              </span>
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(applicant.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Applicant Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Candidate Name</span>
              <span className="text-white font-bold text-sm">{applicant.fullName}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">University Roll No</span>
              <span className="text-white font-mono font-semibold">{applicant.universityRollNo}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Year & Branch</span>
              <span className="text-white font-semibold">
                {applicant.year} • {applicant.branch.split('(')[0]}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">WhatsApp / Phone</span>
              <span className="text-white font-mono font-semibold">+91 {applicant.whatsappNumber}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Applied Domain</span>
              <span className="text-amber-400 font-bold">{applicant.primaryDomain}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Target Role</span>
              <span className="text-rose-400 font-bold">{applicant.roleApplied}</span>
            </div>
          </div>

          {/* Special 3rd Year note if applicable */}
          {applicant.year === '3rd Year' && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
              <span className="text-purple-300 font-semibold block mb-0.5">
                Previous Enigma Track Record:
              </span>
              <span className="text-gray-300">
                {applicant.wasInPreviousEnigma 
                  ? `Yes, actively contributed: ${applicant.previousRoleDetails}`
                  : 'First-time Enigma leadership applicant.'}
              </span>
            </div>
          )}

          {/* Next Steps Advisory */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>What Happens Next?</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-400 leading-relaxed pl-1">
              <li>Your application will be evaluated by the Core Cultural Cell panel.</li>
              <li>Shortlisted candidates will receive interview details via WhatsApp and can also check status anytime on this website.</li>
              <li>Please keep your University Roll No (<strong>{applicant.universityRollNo}</strong>) or Application ID handy.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-200 bg-white/10 hover:bg-white/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 shadow-md shadow-emerald-600/25 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
