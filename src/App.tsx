import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { DomainsSection } from './components/DomainsSection';
import { CoreTeamSection } from './components/CoreTeamSection';
import { RegistrationForm } from './components/RegistrationForm';
import { Footer } from './components/Footer';
import { PosterModal } from './components/PosterModal';
import { StatusCheckModal } from './components/StatusCheckModal';
import { RegistrationSlipModal } from './components/RegistrationSlipModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { adminLogout, getAdminSession } from './services/apiService';
import type { Applicant, DomainType, YearType } from './types/registration';
import { DOMAINS_DATA } from './data/culturalCellData';

export const App: React.FC = () => {
  // Navigation & Modals State
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState<boolean>(false);
  const [registeredApplicant, setRegisteredApplicant] = useState<Applicant | null>(null);

  // Form selections
  const [selectedYear, setSelectedYear] = useState<YearType>('2nd Year');
  const [selectedDomain, setSelectedDomain] = useState<DomainType>(DOMAINS_DATA[0].id);

  // Restore admin session from HttpOnly server cookie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await getAdminSession();
        if (!cancelled) {
          setIsAdminLoggedIn(session.authenticated);
        }
      } catch {
        if (!cancelled) {
          setIsAdminLoggedIn(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminView(true);
  };

  const handleAdminLogout = async () => {
    await adminLogout();
    setIsAdminLoggedIn(false);
    setIsAdminView(false);
  };

  const handleAdminSessionExpired = () => {
    setIsAdminLoggedIn(false);
    setIsAdminView(false);
  };

  const handleSelectYearRegister = (year: YearType) => {
    setSelectedYear(year);
  };

  const handleSelectDomainForRegistration = (domain: DomainType) => {
    setSelectedDomain(domain);
  };

  const handleRegistrationSuccess = (applicant: Applicant) => {
    setRegisteredApplicant(applicant);
  };

  // If admin view is active and admin is logged in, show full Admin Console
  if (isAdminView && isAdminLoggedIn) {
    return (
      <AdminDashboard
        onBackToSite={() => setIsAdminView(false)}
        onLogout={handleAdminLogout}
        onSessionExpired={handleAdminSessionExpired}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080c16] text-white flex flex-col font-body selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminDashboard={() => setIsAdminView(true)}
        onSelectYearRegister={handleSelectYearRegister}
        activeSection="hero"
      />

      {/* Main Public Content */}
      <main className="flex-1">
        <HeroSection
          onOpenPosterModal={() => setIsPosterModalOpen(true)}
          onSelectYearRegister={handleSelectYearRegister}
          onOpenStatusModal={() => setIsStatusModalOpen(true)}
        />

        <AboutSection />

        <DomainsSection
          onSelectDomainForRegistration={handleSelectDomainForRegistration}
        />

        <CoreTeamSection />

        <RegistrationForm
          selectedYear={selectedYear}
          onYearChange={handleSelectYearRegister}
          selectedDomain={selectedDomain}
          onDomainChange={handleSelectDomainForRegistration}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminDashboard={() => setIsAdminView(true)}
      />

      {/* Modals */}
      <PosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />

      <StatusCheckModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onRegisterClick={() => {
          const el = document.getElementById('register');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <RegistrationSlipModal
        applicant={registeredApplicant}
        isOpen={!!registeredApplicant}
        onClose={() => setRegisteredApplicant(null)}
      />
    </div>
  );
};

export default App;
