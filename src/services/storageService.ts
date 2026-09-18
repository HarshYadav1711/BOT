import type { Applicant, ApplicationStatus, InterviewDetails } from '../types/registration';

const REGISTRATIONS_KEY = 'ucer_cultural_cell_registrations_v1';
const ADMIN_SESSION_KEY = 'ucer_admin_auth_session';
const ADMIN_USER_KEY = 'ucer_admin_username_v1';
const ADMIN_PWD_KEY = 'ucer_admin_pwd_v1';

const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PWD = 'enigma2025@ucer';

const INITIAL_SEED_APPLICANTS: Applicant[] = [
  {
    id: 'ENIGMA-2025-H301',
    fullName: 'Aarav Gupta',
    universityRollNo: '2200100100015',
    gender: 'Male',
    year: '3rd Year',
    branch: 'Computer Science & Engineering (CSE)',
    whatsappNumber: '9876543210',
    email: 'aarav.ucer.cse@gmail.com',
    primaryDomain: 'Tech & Web Operations',
    secondaryDomain: 'Media & Photography',
    roleApplied: 'Tech Lead / Head',
    pastExperience: 'Built the club registration portal prototype in React and managed sound consoles during Fresher’s party.',
    portfolioUrl: 'https://github.com/aarav-tech',
    motivation: 'I want to spearhead the tech infrastructure for Enigma 2025 and ensure glitch-free stage displays and real-time live scoring.',
    wasInPreviousEnigma: true,
    previousRoleDetails: 'Served as Technical Volunteer in Enigma 2024. Handled stage LED screen feeds and assisted in sound mixing for Battle of the Bands.',
    status: 'interview_scheduled',
    interviewDetails: {
      date: '2025-10-15',
      time: '02:30 PM',
      venue: 'UCER Central Auditorium - Green Room A',
      notes: 'Strong portfolio in web tech and live AV. Recommended for final panel review.',
      score: 9,
      scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    },
    adminRemarks: 'Top candidate for Tech Head.',
    submittedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'ENIGMA-2025-V204',
    fullName: 'Ananya Sharma',
    universityRollNo: '2300100100084',
    gender: 'Female',
    year: '2nd Year',
    branch: 'Information Technology (IT)',
    whatsappNumber: '9123456789',
    email: 'ananya.sharma23@gmail.com',
    primaryDomain: 'Graphic Design & Visual Arts',
    secondaryDomain: 'Promotions & Social Media',
    roleApplied: 'Flyer Designer',
    pastExperience: 'Skilled in Figma, Adobe Illustrator, and Canva. Created posters for college literary club.',
    portfolioUrl: 'https://behance.net/ananyadesigns',
    motivation: 'Passionate about digital aesthetics and visual storytelling for college fests.',
    wasInPreviousEnigma: false,
    status: 'shortlisted',
    interviewDetails: {
      date: '2025-10-16',
      time: '11:00 AM',
      venue: 'UCER Conference Room 1',
      notes: 'Creative graphic sample shown, good color theory understanding.',
      score: 8,
    },
    adminRemarks: 'Promising talent for official fest teasers and social banners.',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ENIGMA-2025-H308',
    fullName: 'Rohan Verma',
    universityRollNo: '2200100100142',
    gender: 'Male',
    year: '3rd Year',
    branch: 'Electronics & Communication (ECE)',
    whatsappNumber: '9988776655',
    email: 'rohan.verma.ece@gmail.com',
    primaryDomain: 'Media & Photography',
    secondaryDomain: 'Graphic Design & Visual Arts',
    roleApplied: 'Media Head',
    pastExperience: 'Sony A7III videographer, DaVinci Resolve color grading, shot college annual sports day aftermovie.',
    portfolioUrl: 'https://instagram.com/rohan_lenscraft',
    motivation: 'Want to direct the most cinematic aftermovie UCER has ever witnessed with drone shots and high-fps performance cuts.',
    wasInPreviousEnigma: true,
    previousRoleDetails: 'Worked in Enigma 2024 photography crew; captured 1,200+ raw stage frames and edited 3 high-impact reels.',
    status: 'selected',
    interviewDetails: {
      date: '2025-10-14',
      time: '04:00 PM',
      venue: 'Media Studio / Seminar Hall 2',
      notes: 'Exceptional camera gear proficiency and team handling vision. Confirmed for Media Lead.',
      score: 10,
    },
    adminRemarks: 'Selected as Media Co-Head for Enigma 2025.',
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ENIGMA-2025-V215',
    fullName: 'Priya Tiwari',
    universityRollNo: '2300100100119',
    gender: 'Female',
    year: '2nd Year',
    branch: 'Master of Business Administration (MBA)',
    whatsappNumber: '9765432109',
    email: 'priyatiwari.mgmt@gmail.com',
    primaryDomain: 'Sponsorship & Public Relations',
    secondaryDomain: 'Event Management & Coordination',
    roleApplied: 'Sponsorship Outreach Volunteer',
    pastExperience: 'Helped secure local bakery & cafe coupon sponsors for departmental seminar.',
    motivation: 'Eager to negotiate with regional beverage & tech brand sponsors for Enigma festival footprint.',
    wasInPreviousEnigma: false,
    status: 'pending',
    submittedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export const storageService = {
  getRegistrations(): Applicant[] {
    try {
      const data = localStorage.getItem(REGISTRATIONS_KEY);
      if (!data) {
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(INITIAL_SEED_APPLICANTS));
        return INITIAL_SEED_APPLICANTS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load registrations from storage', err);
      return INITIAL_SEED_APPLICANTS;
    }
  },

  saveRegistration(applicantData: Omit<Applicant, 'id' | 'status' | 'submittedAt'>): Applicant {
    const list = this.getRegistrations();
    const prefix = applicantData.year === '2nd Year' ? 'V' : 'H';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `ENIGMA-2025-${prefix}${randomNum}`;

    const newApplicant: Applicant = {
      ...applicantData,
      id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    const updated = [newApplicant, ...list];
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated));
    return newApplicant;
  },

  updateApplicantStatus(id: string, status: ApplicationStatus, adminRemarks?: string): Applicant | null {
    const list = this.getRegistrations();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      status,
      ...(adminRemarks !== undefined ? { adminRemarks } : {}),
    };

    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(list));
    return list[index];
  },

  scheduleInterview(id: string, interviewDetails: InterviewDetails, adminRemarks?: string): Applicant | null {
    const list = this.getRegistrations();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      status: 'interview_scheduled',
      interviewDetails: {
        ...interviewDetails,
        scheduledAt: new Date().toISOString(),
      },
      ...(adminRemarks !== undefined ? { adminRemarks } : {}),
    };

    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(list));
    return list[index];
  },

  deleteApplicant(id: string): boolean {
    const list = this.getRegistrations();
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(filtered));
    return true;
  },

  getApplicantByRollOrId(query: string): Applicant | undefined {
    const normalized = query.trim().toUpperCase();
    const list = this.getRegistrations();
    return list.find(
      (a) => a.id.toUpperCase() === normalized || a.universityRollNo.trim() === query.trim()
    );
  },

  resetToSeed(): Applicant[] {
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(INITIAL_SEED_APPLICANTS));
    return INITIAL_SEED_APPLICANTS;
  },

  // Secure Admin Authentication
  isAdminLoggedIn(): boolean {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
  },

  getAdminUsername(): string {
    return localStorage.getItem(ADMIN_USER_KEY) || DEFAULT_ADMIN_USER;
  },

  getAdminPassword(): string {
    return localStorage.getItem(ADMIN_PWD_KEY) || DEFAULT_ADMIN_PWD;
  },

  loginAdmin(password: string, username = 'admin'): boolean {
    const expectedUser = this.getAdminUsername();
    const expectedPwd = this.getAdminPassword();

    if (username.trim() === expectedUser && password.trim() === expectedPwd) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
      return true;
    }
    return false;
  },

  changeAdminCredentials(newUsername: string, newPassword: string): boolean {
    if (!newUsername.trim() || !newPassword.trim()) return false;
    localStorage.setItem(ADMIN_USER_KEY, newUsername.trim());
    localStorage.setItem(ADMIN_PWD_KEY, newPassword.trim());
    return true;
  },

  logoutAdmin(): void {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  // WhatsApp generator utilities
  generateWhatsAppInviteLink(applicant: Applicant): string {
    const phone = applicant.whatsappNumber.replace(/\D/g, '');
    const intPhone = phone.length === 10 ? `91${phone}` : phone;
    const interview = applicant.interviewDetails;

    const message = `🎉 *Cultural Cell UCER — ENIGMA 2025 Interview Shortlist* 🎉%0A%0ADear *${applicant.fullName}*,%0A%0AGreetings from Cultural Cell UCER!%0AYour application for *${applicant.roleApplied}* (${applicant.primaryDomain}) for our annual fest *ENIGMA 2025* has been *SHORTLISTED* for the personal interview round.%0A%0A🗓 *Interview Details:*%0A• Date: ${interview?.date || 'To be announced'}%0A• Time: ${interview?.time || 'To be announced'}%0A• Venue: ${interview?.venue || 'UCER Campus / Auditorium'}%0A• App ID: ${applicant.id}%0A%0APlease arrive 10 minutes prior with your ID card and past portfolio/work samples if applicable.%0A%0ARegards,%0A*Himanshu Mishra (President)*%0ACultural Cell UCER | Enigma 2025%0AContact: 8960194225`;

    return `https://wa.me/${intPhone}?text=${message}`;
  },

  generateWhatsAppSelectionLink(applicant: Applicant): string {
    const phone = applicant.whatsappNumber.replace(/\D/g, '');
    const intPhone = phone.length === 10 ? `91${phone}` : phone;

    const message = `🌟 *CONGRATULATIONS! YOU ARE SELECTED FOR ENIGMA 2025* 🌟%0A%0ADear *${applicant.fullName}*,%0A%0AWe are thrilled to welcome you to the official organizing team of *Cultural Cell UCER* for *ENIGMA 2025*!%0A%0A✨ *Assigned Role:* ${applicant.roleApplied}%0A📌 *Domain:* ${applicant.primaryDomain}%0A🎫 *Application ID:* ${applicant.id}%0A%0AThe Core Team will be adding you to the official Enigma 2025 WhatsApp workspace soon for orientation and briefing.%0A%0AWelcome to the family! Let's make Enigma 2025 legendary!%0A%0ABest wishes,%0A*Cultural Cell UCER Core Team*%0APresident: Himanshu Mishra (8960194225)%0AInstagram: @enigmafest_25`;

    return `https://wa.me/${intPhone}?text=${message}`;
  },

  exportRegistrationsCSV(): void {
    const list = this.getRegistrations();
    if (list.length === 0) {
      alert('No registrations to export.');
      return;
    }

    const headers = [
      'App ID',
      'Full Name',
      'Roll Number',
      'Gender',
      'Year',
      'Branch',
      'WhatsApp Number',
      'Email',
      'Primary Domain',
      'Secondary Domain',
      'Role Applied',
      'Status',
      'Was in Previous Enigma',
      'Previous Enigma Role & Contributions',
      'Interview Date',
      'Interview Time',
      'Interview Venue',
      'Interview Score',
      'Admin Remarks',
      'Submitted At',
    ];

    const escapeCsv = (val: unknown) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map((a) => [
      escapeCsv(a.id),
      escapeCsv(a.fullName),
      escapeCsv(a.universityRollNo),
      escapeCsv(a.gender),
      escapeCsv(a.year),
      escapeCsv(a.branch),
      escapeCsv(a.whatsappNumber),
      escapeCsv(a.email),
      escapeCsv(a.primaryDomain),
      escapeCsv(a.secondaryDomain || 'N/A'),
      escapeCsv(a.roleApplied),
      escapeCsv(a.status),
      escapeCsv(a.wasInPreviousEnigma ? 'Yes' : 'No'),
      escapeCsv(a.previousRoleDetails || 'N/A'),
      escapeCsv(a.interviewDetails?.date || 'N/A'),
      escapeCsv(a.interviewDetails?.time || 'N/A'),
      escapeCsv(a.interviewDetails?.venue || 'N/A'),
      escapeCsv(a.interviewDetails?.score ?? 'N/A'),
      escapeCsv(a.adminRemarks || 'N/A'),
      escapeCsv(a.submittedAt),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UCER_Enigma2025_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
