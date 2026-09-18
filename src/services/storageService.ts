import type { Applicant } from '../types/registration';

/** Digits-only international WhatsApp phone (prepends 91 for 10-digit Indian numbers). */
function toWhatsAppPhone(whatsappNumber: string): string {
  const phone = whatsappNumber.replace(/\D/g, '');
  return phone.length === 10 ? `91${phone}` : phone;
}

/** Build a wa.me URL with the message encoded exactly once. */
function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

/**
 * Neutralize spreadsheet formula injection for CSV export only.
 * Prefixes with ' when the first meaningful character is =, +, -, or @.
 */
function sanitizeCsvFormula(value: string): string {
  const firstMeaningful = value.match(/\S/)?.[0];
  if (firstMeaningful && '=@+-'.includes(firstMeaningful)) {
    return `'${value}`;
  }
  return value;
}

/** Quote/escape a CSV cell after formula sanitization. */
function escapeCsv(val: unknown): string {
  if (val === undefined || val === null) return '""';
  const sanitized = sanitizeCsvFormula(String(val));
  const str = sanitized.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Client-side helpers that remain after the PostgreSQL migration.
 * Registration/auth/status persistence lives on the server — not here.
 */
export const storageService = {
  generateWhatsAppInviteLink(applicant: Applicant): string {
    const intPhone = toWhatsAppPhone(applicant.whatsappNumber);
    const interview = applicant.interviewDetails;

    const message = `🎉 *Cultural Cell UCER — ENIGMA 2025 Interview Shortlist* 🎉

Dear *${applicant.fullName}*,

Greetings from Cultural Cell UCER!
Your application for *${applicant.roleApplied}* (${applicant.primaryDomain}) for our annual fest *ENIGMA 2025* has been *SHORTLISTED* for the personal interview round.

🗓 *Interview Details:*
• Date: ${interview?.date || 'To be announced'}
• Time: ${interview?.time || 'To be announced'}
• Venue: ${interview?.venue || 'UCER Campus / Auditorium'}
• App ID: ${applicant.id}

Please arrive 10 minutes prior with your ID card and past portfolio/work samples if applicable.

Regards,
*Himanshu Mishra (President)*
Cultural Cell UCER | Enigma 2025
Contact: 8960194225`;

    return buildWhatsAppUrl(intPhone, message);
  },

  generateWhatsAppSelectionLink(applicant: Applicant): string {
    const intPhone = toWhatsAppPhone(applicant.whatsappNumber);

    const message = `🌟 *CONGRATULATIONS! YOU ARE SELECTED FOR ENIGMA 2025* 🌟

Dear *${applicant.fullName}*,

We are thrilled to welcome you to the official organizing team of *Cultural Cell UCER* for *ENIGMA 2025*!

✨ *Assigned Role:* ${applicant.roleApplied}
📌 *Domain:* ${applicant.primaryDomain}
🎫 *Application ID:* ${applicant.id}

The Core Team will be adding you to the official Enigma 2025 WhatsApp workspace soon for orientation and briefing.

Welcome to the family! Let's make Enigma 2025 legendary!

Best wishes,
*Cultural Cell UCER Core Team*
President: Himanshu Mishra (8960194225)
Instagram: @enigmafest_25`;

    return buildWhatsAppUrl(intPhone, message);
  },

  /** Export the provided PostgreSQL-backed applicant list as CSV (browser download). */
  exportRegistrationsCSV(list: Applicant[]): void {
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
