import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  User, 
  Layers, 
  HelpCircle, 
  Crown, 
  HandHelping, 
  History
} from 'lucide-react';
import type { 
  YearType, 
  GenderType, 
  DomainType, 
  Applicant 
} from '../types/registration';
import { DOMAINS_DATA, BRANCH_LIST } from '../data/culturalCellData';
import { ApiError, createRegistration } from '../services/apiService';

interface RegistrationFormProps {
  selectedYear: YearType;
  onYearChange: (year: YearType) => void;
  selectedDomain: DomainType;
  onDomainChange: (domain: DomainType) => void;
  onRegistrationSuccess: (applicant: Applicant) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  selectedYear,
  onYearChange,
  selectedDomain,
  onDomainChange,
  onRegistrationSuccess,
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [universityRollNo, setUniversityRollNo] = useState('');
  const [gender, setGender] = useState<GenderType>('Male');
  const [branch, setBranch] = useState(BRANCH_LIST[0]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [secondaryDomain, setSecondaryDomain] = useState<DomainType | ''>('');
  const [roleApplied, setRoleApplied] = useState('');
  const [pastExperience, setPastExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [motivation, setMotivation] = useState('');

  // 3rd Year Specific conditional fields
  const [wasInPreviousEnigma, setWasInPreviousEnigma] = useState<boolean>(false);
  const [previousRoleDetails, setPreviousRoleDetails] = useState('');

  // Validation & status
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active domain info
  const domainInfo = DOMAINS_DATA.find((d) => d.id === selectedDomain) || DOMAINS_DATA[0];

  // Set default role when year or domain changes
  useEffect(() => {
    if (selectedYear === '3rd Year') {
      setRoleApplied(domainInfo.headRoles[0] || 'Domain Head');
    } else {
      setRoleApplied(domainInfo.volunteerRoles[0] || 'Domain Volunteer');
    }
  }, [selectedYear, selectedDomain, domainInfo]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!universityRollNo.trim()) {
      newErrors.universityRollNo = 'University Roll Number is required.';
    } else if (universityRollNo.trim().length < 6) {
      newErrors.universityRollNo = 'Please enter a valid University Roll Number.';
    }

    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp Number is required.';
    } else if (!/^\d{10}$/.test(whatsappNumber.replace(/\D/g, ''))) {
      newErrors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp phone number.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!pastExperience.trim()) {
      newErrors.pastExperience = 'Please describe your skills or past experience.';
    }

    if (!motivation.trim()) {
      newErrors.motivation = 'Please share your reason to join Cultural Cell UCER.';
    }

    // 3rd year check
    if (selectedYear === '3rd Year' && wasInPreviousEnigma && !previousRoleDetails.trim()) {
      newErrors.previousRoleDetails = 'Since you were part of previous Enigma, please detail your role and contributions.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const applicant = await createRegistration({
        fullName: fullName.trim(),
        universityRollNo: universityRollNo.trim().toUpperCase(),
        gender,
        year: selectedYear,
        branch,
        whatsappNumber: whatsappNumber.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        primaryDomain: selectedDomain,
        secondaryDomain: secondaryDomain || undefined,
        roleApplied,
        pastExperience: pastExperience.trim(),
        portfolioUrl: portfolioUrl.trim() || undefined,
        motivation: motivation.trim(),
        wasInPreviousEnigma: selectedYear === '3rd Year' ? wasInPreviousEnigma : false,
        previousRoleDetails:
          selectedYear === '3rd Year' && wasInPreviousEnigma
            ? previousRoleDetails.trim()
            : undefined,
      });

      // Clear form only after successful server registration
      setFullName('');
      setUniversityRollNo('');
      setWhatsappNumber('');
      setEmail('');
      setPastExperience('');
      setPortfolioUrl('');
      setMotivation('');
      setPreviousRoleDetails('');
      setWasInPreviousEnigma(false);
      setErrors({});

      onRegistrationSuccess(applicant);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'DUPLICATE_REGISTRATION') {
          setErrors({
            universityRollNo:
              'A registration already exists for this university roll number.',
          });
          return;
        }

        if (err.code === 'INVALID_INPUT' && err.fields && Object.keys(err.fields).length > 0) {
          setErrors(err.fields);
          return;
        }

        alert(
          err.message ||
            'Unable to submit your registration right now. Please try again.'
        );
        return;
      }

      alert('Unable to submit your registration right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Section Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Open Public Recruitment • No Student Login Required</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          ENIGMA 2026 REGISTRATION
        </h2>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
          Fill in your credentials accurately. All registrations directly populate into the executive scrutiny panel for interview shortlisting.
        </p>
      </div>

      {/* Year Selection Toggle Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 2nd Year Card */}
        <button
          type="button"
          onClick={() => onYearChange('2nd Year')}
          className={`p-6 rounded-2xl text-left transition-all border-2 flex items-start gap-4 ${
            selectedYear === '2nd Year'
              ? 'bg-amber-500/15 border-amber-400 shadow-xl shadow-amber-500/10'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className={`p-3 rounded-xl ${selectedYear === '2nd Year' ? 'bg-amber-500 text-gray-950' : 'bg-white/10 text-gray-300'}`}>
            <HandHelping className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white font-heading">2nd Year Students</span>
              {selectedYear === '2nd Year' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-gray-950 uppercase">Active</span>
              )}
            </div>
            <p className="text-xs text-amber-300 font-semibold mt-0.5">
              Volunteer & Junior Coordinator Stream
            </p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Work closely with Heads across sound, stage, design, and ground logistics.
            </p>
          </div>
        </button>

        {/* 3rd Year Card */}
        <button
          type="button"
          onClick={() => onYearChange('3rd Year')}
          className={`p-6 rounded-2xl text-left transition-all border-2 flex items-start gap-4 ${
            selectedYear === '3rd Year'
              ? 'bg-rose-500/15 border-rose-400 shadow-xl shadow-rose-500/10'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className={`p-3 rounded-xl ${selectedYear === '3rd Year' ? 'bg-rose-500 text-white' : 'bg-white/10 text-gray-300'}`}>
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white font-heading">3rd Year Students</span>
              {selectedYear === '3rd Year' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white uppercase">Active</span>
              )}
            </div>
            <p className="text-xs text-rose-300 font-semibold mt-0.5">
              Domain Head & Leadership Stream
            </p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Lead Tech, Media, Design, Management or Decor verticals. Includes previous Enigma review question.
            </p>
          </div>
        </button>
      </div>

      {/* Main Registration Form Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#0e1322] border border-white/15 shadow-2xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          {/* Section 1: Academic & Personal Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <User className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Candidate Academic & Contact Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aryan Srivastava"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none transition-colors ${
                    errors.fullName ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
              </div>

              {/* University Roll No */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  University Roll Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={universityRollNo}
                  onChange={(e) => setUniversityRollNo(e.target.value)}
                  placeholder="e.g. 2300100100045"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm font-mono focus:outline-none transition-colors ${
                    errors.universityRollNo ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {errors.universityRollNo && <p className="text-[11px] text-rose-400 mt-1">{errors.universityRollNo}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Gender <span className="text-rose-400">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GenderType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141b2d] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Department / Branch <span className="text-rose-400">*</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141b2d] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  {BRANCH_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  WhatsApp Contact Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-gray-400 font-mono">+91</span>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="8960194225"
                    maxLength={10}
                    className={`w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm font-mono focus:outline-none transition-colors ${
                      errors.whatsappNumber ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 focus:border-amber-400'
                    }`}
                  />
                </div>
                {errors.whatsappNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.whatsappNumber}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@ucer.ac.in or gmail.com"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none transition-colors ${
                    errors.email ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 focus:border-amber-400'
                  }`}
                />
                {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Domain & Role Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Layers className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Domain & Position Preference ({selectedYear})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Domain */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Primary Domain of Choice <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => onDomainChange(e.target.value as DomainType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141b2d] border border-white/10 text-white text-sm focus:outline-none focus:border-rose-400"
                >
                  {DOMAINS_DATA.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              {/* Role Applied For */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Position / Role <span className="text-rose-400">*</span>
                </label>
                <select
                  value={roleApplied}
                  onChange={(e) => setRoleApplied(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141b2d] border border-white/10 text-white text-sm focus:outline-none focus:border-rose-400"
                >
                  {selectedYear === '3rd Year' ? (
                    domainInfo.headRoles.map((r) => (
                      <option key={r} value={r}>{r} (Leadership)</option>
                    ))
                  ) : (
                    domainInfo.volunteerRoles.map((r) => (
                      <option key={r} value={r}>{r} (Volunteer)</option>
                    ))
                  )}
                </select>
              </div>

              {/* Secondary Domain (Optional) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Secondary Domain (Backup Preference, Optional)
                </label>
                <select
                  value={secondaryDomain}
                  onChange={(e) => setSecondaryDomain(e.target.value as DomainType | '')}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141b2d] border border-white/10 text-white text-sm focus:outline-none focus:border-rose-400"
                >
                  <option value="">None (Only Primary Domain)</option>
                  {DOMAINS_DATA.filter((d) => d.id !== selectedDomain).map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ⭐ Section 3: 3RD YEAR SPECIAL MANDATORY CONDITIONAL QUESTION */}
          {selectedYear === '3rd Year' && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-rose-900/20 to-amber-900/20 border-2 border-rose-500/40 space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  3. Previous Enigma Track Record (Crucial for 3rd Year Head Selection)
                </h3>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-200">
                  Were you part of previous year's ENIGMA festival team at UCER? <span className="text-rose-400">*</span>
                </label>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="previousEnigma"
                      checked={wasInPreviousEnigma === true}
                      onChange={() => setWasInPreviousEnigma(true)}
                      className="w-4 h-4 text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      Yes, I was part of previous Enigma
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="previousEnigma"
                      checked={wasInPreviousEnigma === false}
                      onChange={() => {
                        setWasInPreviousEnigma(false);
                        setPreviousRoleDetails('');
                      }}
                      className="w-4 h-4 text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-xs sm:text-sm text-gray-300">
                      No, this is my first time applying
                    </span>
                  </label>
                </div>

                {/* Conditional textarea if Yes */}
                {wasInPreviousEnigma && (
                  <div className="pt-2 animate-fadeIn space-y-1.5">
                    <label className="block text-xs font-bold text-amber-300">
                      What was your role in previous year Enigma, and what were your key contributions? <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={previousRoleDetails}
                      onChange={(e) => setPreviousRoleDetails(e.target.value)}
                      placeholder="e.g. I was a Technical Volunteer in Enigma 2024. I operated the stage lighting DMX board, assisted in sound checks for 6 college bands, and resolved microphone feedback during celebrity night..."
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-white text-xs focus:outline-none transition-colors ${
                        errors.previousRoleDetails ? 'border-rose-500' : 'border-white/20 focus:border-amber-400'
                      }`}
                    />
                    {errors.previousRoleDetails && (
                      <p className="text-[11px] text-rose-400">{errors.previousRoleDetails}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Skills, Portfolio & Motivation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {selectedYear === '3rd Year' ? '4. Skills, Portfolio & Leadership' : '3. Skills & Experience'}
              </h3>
            </div>

            {/* Past Experience */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Past Experience / Relevant Skills / Tools <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={pastExperience}
                onChange={(e) => setPastExperience(e.target.value)}
                placeholder="Mention technical tools (Premiere Pro, Figma, Sound setups), past school/college events managed, or club involvement..."
                className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-xs focus:outline-none transition-colors ${
                  errors.pastExperience ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 focus:border-purple-400'
                }`}
              />
              {errors.pastExperience && <p className="text-[11px] text-rose-400 mt-1">{errors.pastExperience}</p>}
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Portfolio / Work Link (Google Drive, GitHub, Behance, Instagram photography handle)
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://instagram.com/your_handle"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Why do you want to join Cultural Cell UCER for Enigma 2026? <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Share your enthusiasm, work ethic, and what unique energy you bring to the team..."
                className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-xs focus:outline-none transition-colors ${
                  errors.motivation ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 focus:border-purple-400'
                }`}
              />
              {errors.motivation && <p className="text-[11px] text-rose-400 mt-1">{errors.motivation}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 text-center sm:text-left">
              By submitting, your application will be queued for interview scrutiny by President Himanshu Mishra & Core Cultural Cell executives.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:opacity-95 shadow-xl shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application & Get Pass'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
