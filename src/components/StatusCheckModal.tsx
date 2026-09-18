import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Clock3, 
  AlertCircle,
  XCircle,
  Sparkles,
  Phone,
  MessageCircle,
  Crown
} from 'lucide-react';
import { checkRegistrationStatus, type StatusCheckResult } from '../services/apiService';

interface StatusCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export const StatusCheckModal: React.FC<StatusCheckModalProps> = ({
  isOpen,
  onClose,
  onRegisterClick,
}) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<StatusCheckResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const applicant = await checkRegistrationStatus(query.trim());
      setResult(applicant);
    } catch {
      setResult(null);
    }
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-all animate-fadeIn">
      <div 
        className="relative max-w-lg w-full bg-[#0d1322] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Application & Interview Status Tracker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          <p className="text-xs sm:text-sm text-gray-300">
            Enter your <strong className="text-white">University Roll Number</strong> or <strong className="text-white">Application ID</strong> (e.g., <code>ENIGMA-2026-V1042</code>) to check your current recruitment review status.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 2300100100084 or ENIGMA-2026-V204"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-900 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Track</span>
            </button>
          </form>

          {/* Result Area */}
          {hasSearched && (
            <div className="space-y-4 pt-2">
              {result ? (
                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {result.fullName}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono">
                        {result.universityRollNo} • {result.id}
                      </p>
                    </div>

                    {/* Status Badge */}
                    {result.status === 'pending' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5" />
                        Under Review
                      </span>
                    )}
                    {(result.status === 'shortlisted' || result.status === 'interview_scheduled') && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Interview Shortlisted
                      </span>
                    )}
                    {result.status === 'selected' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selected!
                      </span>
                    )}
                    {result.status === 'rejected' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Application Closed
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
                    <div>
                      <span className="text-gray-400 block">Applied For</span>
                      <span className="text-white font-semibold">{result.roleApplied}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Domain</span>
                      <span className="text-amber-300 font-semibold">{result.primaryDomain}</span>
                    </div>
                  </div>

                  {/* Interview Information Card if scheduled */}
                  {(result.status === 'interview_scheduled' || result.status === 'shortlisted') && (
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 space-y-2.5 text-xs text-gray-200">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Personal Interview Details</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Date: <strong>{result.interviewDetails?.date || 'Pending Schedule by Admin'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Time: <strong>{result.interviewDetails?.time || 'Pending Schedule by Admin'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Venue: <strong>{result.interviewDetails?.venue || 'UCER Campus / Conference Hall'}</strong></span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-300 italic pt-1">
                        Please carry your college ID card and portfolio/previous works if applicable.
                      </p>
                    </div>
                  )}

                  {/* Selection Card */}
                  {result.status === 'selected' && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs text-emerald-200">
                      <div className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Welcome to Cultural Cell UCER!</span>
                      </div>
                      <p className="text-gray-200">
                        You have officially been appointed to the Enigma 2026 organizing team! The core committee will be contacting you on WhatsApp (+91 {result.whatsappNumber}) shortly.
                      </p>
                    </div>
                  )}

                  {/* Status explanation for pending */}
                  {result.status === 'pending' && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                      Your application has been received and is currently being scrutinized by President Himanshu Mishra and the Domain Heads. Check back soon for interview schedules.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white">No Application Found</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      No applicant matched roll number or ID: <strong>{query}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onRegisterClick();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 transition-all"
                  >
                    Register for Enigma 2026 Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* President Contact Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-gray-400 block">Registration Helpdesk:</span>
              <span className="text-white font-semibold">Himanshu Mishra (President)</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/918960194225?text=${encodeURIComponent('Hello Himanshu, I have a query regarding my Enigma 2026 registration.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:8960194225"
                className="p-1.5 rounded-lg bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Call 8960194225"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
