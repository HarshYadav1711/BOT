import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Crown, 
  HandHelping, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  LogOut, 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  ExternalLink, 
  MessageCircle, 
  Trash2, 
  Star, 
  History,
  X,
  RotateCcw,
  KeyRound,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import type { Applicant, ApplicationStatus, InterviewDetails } from '../../types/registration';
import { DOMAINS_DATA } from '../../data/culturalCellData';
import { storageService } from '../../services/storageService';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToSite,
  onLogout,
}) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterDomain, setFilterDomain] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Selected applicant for the review/interview modal
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Security Credentials Modal State
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credsError, setCredsError] = useState('');
  const [credsSuccess, setCredsSuccess] = useState('');

  // Interview modal editable states
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewVenue, setInterviewVenue] = useState('UCER Central Auditorium - Seminar Hall');
  const [interviewScore, setInterviewScore] = useState<number>(8);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');

  // Load applicants from local storage on mount
  const refreshData = () => {
    const list = storageService.getRegistrations();
    setApplicants(list);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // When opening an applicant modal, initialize interview form fields
  const handleOpenApplicantModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setInterviewDate(applicant.interviewDetails?.date || '');
    setInterviewTime(applicant.interviewDetails?.time || '');
    setInterviewVenue(applicant.interviewDetails?.venue || 'UCER Central Auditorium - Seminar Hall');
    setInterviewScore(applicant.interviewDetails?.score || 8);
    setInterviewNotes(applicant.interviewDetails?.notes || '');
    setAdminRemarks(applicant.adminRemarks || '');
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedApplicant(null);
  };

  // Quick status update
  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    const updated = storageService.updateApplicantStatus(id, newStatus, adminRemarks);
    if (updated) {
      refreshData();
      if (selectedApplicant && selectedApplicant.id === id) {
        setSelectedApplicant(updated);
      }
    }
  };

  // Save Interview schedule
  const handleSaveInterviewSchedule = () => {
    if (!selectedApplicant) return;

    const interviewData: InterviewDetails = {
      date: interviewDate,
      time: interviewTime,
      venue: interviewVenue,
      score: interviewScore,
      notes: interviewNotes,
    };

    const updated = storageService.scheduleInterview(selectedApplicant.id, interviewData, adminRemarks);
    if (updated) {
      refreshData();
      setSelectedApplicant(updated);
      alert(`Interview scheduled successfully for ${selectedApplicant.fullName}! You can now send them a WhatsApp invite.`);
    }
  };

  // Delete applicant
  const handleDeleteApplicant = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete applicant "${name}"?`)) {
      storageService.deleteApplicant(id);
      refreshData();
      if (selectedApplicant?.id === id) {
        setSelectedApplicant(null);
      }
    }
  };

  // Reset to sample data
  const handleResetData = () => {
    if (confirm('Reset database to default seed data?')) {
      const list = storageService.resetToSeed();
      setApplicants(list);
      setSelectedApplicant(null);
    }
  };

  // Handle Changing Credentials
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError('');
    setCredsSuccess('');

    if (!newUsername.trim() || !newPassword.trim()) {
      setCredsError('Username and password cannot be empty.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setCredsError('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword.length < 6) {
      setCredsError('Password should be at least 6 characters long.');
      return;
    }

    const ok = storageService.changeAdminCredentials(newUsername, newPassword);
    if (ok) {
      setCredsSuccess('Admin credentials updated securely! Only you know this new password.');
      setTimeout(() => {
        setIsCredsModalOpen(false);
      }, 1500);
    } else {
      setCredsError('Failed to update credentials.');
    }
  };

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      // Query filter (Name, Roll No, Phone, Email, ID)
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.universityRollNo.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.whatsappNumber.includes(q) ||
        a.email.toLowerCase().includes(q);

      // Year filter
      const matchYear = filterYear === 'All' || a.year === filterYear;

      // Domain filter
      const matchDomain = filterDomain === 'All' || a.primaryDomain === filterDomain;

      // Status filter
      const matchStatus = filterStatus === 'All' || a.status === filterStatus;

      return matchQuery && matchYear && matchDomain && matchStatus;
    });
  }, [applicants, searchQuery, filterYear, filterDomain, filterStatus]);

  // Metrics
  const totalCount = applicants.length;
  const volunteersCount = applicants.filter((a) => a.year === '2nd Year').length;
  const headsCount = applicants.filter((a) => a.year === '3rd Year').length;
  const shortlistedCount = applicants.filter((a) => a.status === 'shortlisted' || a.status === 'interview_scheduled').length;
  const selectedCount = applicants.filter((a) => a.status === 'selected').length;
  const rejectedCount = applicants.filter((a) => a.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-[#080c16] text-gray-100 flex flex-col font-body">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0d1322]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Back to Public Fest Site</span>
            <span className="sm:hidden">Site</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white font-heading">
                Cultural Cell UCER Executive Panel
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Admin Console
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Enigma 2025 Volunteer & Domain Head Scrutiny
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Password / Security */}
          <button
            onClick={() => {
              setNewUsername(storageService.getAdminUsername());
              setNewPassword('');
              setConfirmPassword('');
              setCredsError('');
              setCredsSuccess('');
              setIsCredsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors"
            title="Change Admin Password"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Change Password</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={() => storageService.exportRegistrationsCSV()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
            title="Download CSV spreadsheet of all registered students"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Reset Seed Button */}
          <button
            onClick={handleResetData}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Reset database to sample candidates"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Registrations */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Total Applicants</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-heading">{totalCount}</div>
            <div className="text-[10px] text-gray-500">Live submissions</div>
          </div>

          {/* 2nd Year Volunteers */}
          <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span>2nd Yr Volunteers</span>
              <HandHelping className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">{volunteersCount}</div>
            <div className="text-[10px] text-amber-400/60">Execution crew</div>
          </div>

          {/* 3rd Year Heads */}
          <div className="p-4 rounded-2xl bg-rose-500/[0.05] border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-rose-300">
              <span>3rd Yr Heads</span>
              <Crown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-heading">{headsCount}</div>
            <div className="text-[10px] text-rose-400/60">Domain leadership</div>
          </div>

          {/* Shortlisted for Interview */}
          <div className="p-4 rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-cyan-300">
              <span>Interview Round</span>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-heading">{shortlistedCount}</div>
            <div className="text-[10px] text-cyan-400/60">Invited / Scheduled</div>
          </div>

          {/* Selected */}
          <div className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span>Selected</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-heading">{selectedCount}</div>
            <div className="text-[10px] text-emerald-400/60">Inducted to team</div>
          </div>

          {/* Rejected */}
          <div className="p-4 rounded-2xl bg-rose-900/[0.1] border border-rose-900/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Rejected</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-400 font-heading">{rejectedCount}</div>
            <div className="text-[10px] text-gray-500">Not selected</div>
          </div>
        </div>

        {/* Domain Distribution Pills */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Registrations by Domain:
          </div>
          <div className="flex flex-wrap gap-2">
            {DOMAINS_DATA.map((d) => {
              const count = applicants.filter((a) => a.primaryDomain === d.id).length;
              return (
                <button
                  key={d.id}
                  onClick={() => setFilterDomain(filterDomain === d.id ? 'All' : d.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
                    filterDomain === d.id
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                  }`}
                >
                  <span>{d.title}</span>
                  <span className="px-1.5 py-0.2 bg-black/40 rounded-full font-mono text-[11px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#0f1424] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, roll no, phone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Year Filter */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#141a2d] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
            >
              <option value="All">All Years</option>
              <option value="2nd Year">2nd Year (Volunteers)</option>
              <option value="3rd Year">3rd Year (Heads)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#141a2d] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="shortlisted">Shortlisted for Interview</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Reset Filters button */}
            {(searchQuery || filterYear !== 'All' || filterDomain !== 'All' || filterStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterYear('All');
                  setFilterDomain('All');
                  setFilterStatus('All');
                }}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Applicants Table */}
        <div className="rounded-2xl bg-[#0f1424] border border-white/10 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-heading">
              Registered Candidates ({filteredApplicants.length})
            </h3>
            <span className="text-xs text-gray-400">
              Showing filtered results
            </span>
          </div>

          {filteredApplicants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Candidate</th>
                    <th className="px-4 py-3.5">Roll No & Branch</th>
                    <th className="px-4 py-3.5">Year</th>
                    <th className="px-4 py-3.5">Domain & Position</th>
                    <th className="px-4 py-3.5">Previous Enigma?</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApplicants.map((applicant) => (
                    <tr
                      key={applicant.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Candidate Name & ID */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-white text-sm">
                            {applicant.fullName}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {applicant.id} • {applicant.gender}
                          </div>
                        </div>
                      </td>

                      {/* Roll & Branch */}
                      <td className="px-4 py-4">
                        <div className="font-mono font-semibold text-gray-200">
                          {applicant.universityRollNo}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[150px]">
                          {applicant.branch}
                        </div>
                      </td>

                      {/* Year */}
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            applicant.year === '3rd Year'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {applicant.year}
                        </span>
                      </td>

                      {/* Domain & Role */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">
                          {applicant.roleApplied}
                        </div>
                        <div className="text-[11px] text-amber-400/90">
                          {applicant.primaryDomain}
                        </div>
                      </td>

                      {/* 3rd Year Previous Enigma Highlight */}
                      <td className="px-4 py-4">
                        {applicant.year === '3rd Year' ? (
                          applicant.wasInPreviousEnigma ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>Veteran</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-500">First time</span>
                          )
                        ) : (
                          <span className="text-[11px] text-gray-500">N/A (2nd Yr)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {applicant.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Pending Review
                          </span>
                        )}
                        {(applicant.status === 'shortlisted' || applicant.status === 'interview_scheduled') && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 w-fit">
                            <Sparkles className="w-3 h-3" />
                            Interview
                          </span>
                        )}
                        {applicant.status === 'selected' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Selected
                          </span>
                        )}
                        {applicant.status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenApplicantModal(applicant)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/20"
                          >
                            Review & Interview
                          </button>
                          <button
                            onClick={() => handleDeleteApplicant(applicant.id, applicant.fullName)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 transition-colors"
                            title="Delete Applicant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-gray-500 mx-auto" />
              <div className="text-base font-bold text-white">No applicants match your filters</div>
              <p className="text-xs text-gray-400">
                Try loosening your search query or reset the filters.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ⭐ APPLICANT REVIEW & INTERVIEW DOSSIER MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-all animate-fadeIn">
          <div 
            className="relative max-w-3xl w-full bg-[#0d1322] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-heading">
                    {selectedApplicant.fullName}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      selectedApplicant.year === '3rd Year'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {selectedApplicant.year} ({selectedApplicant.roleApplied})
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  {selectedApplicant.id} • {selectedApplicant.universityRollNo}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-left text-xs">
              {/* Bio & Contact Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-400 block mb-0.5">Department</span>
                  <span className="text-white font-semibold">{selectedApplicant.branch}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Gender</span>
                  <span className="text-white font-semibold">{selectedApplicant.gender}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">WhatsApp Contact</span>
                  <a
                    href={`https://wa.me/91${selectedApplicant.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-mono font-semibold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>+91 {selectedApplicant.whatsappNumber}</span>
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Email</span>
                  <a
                    href={`mailto:${selectedApplicant.email}`}
                    className="text-cyan-400 hover:underline truncate block"
                  >
                    {selectedApplicant.email}
                  </a>
                </div>
              </div>

              {/* ⭐ 3RD YEAR PREVIOUS ENIGMA EXPERIENCE HIGHLIGHT */}
              {selectedApplicant.year === '3rd Year' && (
                <div className={`p-4 rounded-2xl border-2 ${
                  selectedApplicant.wasInPreviousEnigma
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm text-white">
                        Previous Year Enigma Participation Track Record
                      </span>
                    </div>
                    {selectedApplicant.wasInPreviousEnigma ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-gray-950 uppercase flex items-center gap-1">
                        <Star className="w-3 h-3 fill-gray-950" />
                        Part of Enigma 2024
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-400">
                        First Time Applying
                      </span>
                    )}
                  </div>

                  {selectedApplicant.wasInPreviousEnigma ? (
                    <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-amber-100 text-xs leading-relaxed">
                      <span className="font-bold text-amber-300 block mb-1">Previous Role & Contributions:</span>
                      {selectedApplicant.previousRoleDetails || 'No details specified.'}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">
                      Candidate was not part of the previous year's Enigma festival team. Evaluate based on external leadership/skills.
                    </p>
                  )}
                </div>
              )}

              {/* Experience & Motivation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Past Experience & Technical Skills
                  </span>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {selectedApplicant.pastExperience}
                  </p>
                  {selectedApplicant.portfolioUrl && (
                    <div className="pt-2">
                      <a
                        href={selectedApplicant.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 font-semibold hover:bg-purple-500/30 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Submitted Portfolio</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-gray-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Motivation to Join Cultural Cell UCER
                  </span>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {selectedApplicant.motivation}
                  </p>
                </div>
              </div>

              {/* ⭐ INTERVIEW MANAGEMENT & SCHEDULING SECTION */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-purple-950/20 to-blue-950/30 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                      Interview Round Management
                    </h4>
                  </div>
                  <span className="text-[10px] text-cyan-300">
                    Schedules appear on applicant's status tracker
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Interview Date</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Interview Time Slot</label>
                    <input
                      type="text"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      placeholder="e.g. 02:30 PM"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Interview Score (1-10)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={interviewScore}
                        onChange={(e) => setInterviewScore(Number(e.target.value))}
                        className="flex-1 accent-cyan-400"
                      />
                      <span className="font-bold text-amber-400 font-mono text-sm w-8">
                        {interviewScore}/10
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-gray-300 mb-1 font-semibold">Interview Venue / Link</label>
                    <input
                      type="text"
                      value={interviewVenue}
                      onChange={(e) => setInterviewVenue(e.target.value)}
                      placeholder="UCER Auditorium Seminar Hall / Google Meet link"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-gray-300 mb-1 font-semibold">Interviewer Notes & Observations</label>
                    <textarea
                      rows={2}
                      value={interviewNotes}
                      onChange={(e) => setInterviewNotes(e.target.value)}
                      placeholder="Feedback on confidence, technical fluency, past projects, leadership capability..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Save Interview Schedule Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveInterviewSchedule}
                    className="px-5 py-2 rounded-xl font-bold text-gray-900 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-400/20"
                  >
                    Save & Schedule Interview
                  </button>
                </div>
              </div>

              {/* 1-CLICK WHATSAPP DISPATCH ACTIONS */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Direct Communication</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Instantly dispatch interview schedule or selection letter to candidate's WhatsApp.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={storageService.generateWhatsAppInviteLink(selectedApplicant)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Send Interview Invite</span>
                  </a>

                  <a
                    href={storageService.generateWhatsAppSelectionLink(selectedApplicant)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Send Selection Congrats</span>
                  </a>
                </div>
              </div>

              {/* FINAL SELECTION DECISION BUTTONS */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="text-gray-400">
                  Current Status:{' '}
                  <strong className="text-white uppercase">{selectedApplicant.status}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'pending')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors"
                  >
                    Set Pending
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'shortlisted')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'selected')}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                  >
                    Approve & Select
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ SECURITY: CHANGE ADMIN CREDENTIALS MODAL */}
      {isCredsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-all animate-fadeIn">
          <div 
            className="relative max-w-md w-full bg-[#0d1322] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Change Admin Credentials
                </h3>
              </div>
              <button
                onClick={() => setIsCredsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-gray-300 leading-relaxed">
                Set a secret password known only to you. Once changed, no one can access this panel without your new password.
              </p>

              {credsError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{credsError}</span>
                </div>
              )}

              {credsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{credsSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    New Secret Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCredsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-gray-300 bg-white/10 hover:bg-white/15 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 shadow-md shadow-purple-600/25 transition-all"
                  >
                    Save Secret Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
