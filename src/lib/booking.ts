/** Shared booking form definition: fields, options and validation. */
export const sectors = [
  'Schools and education',
  'Multi-academy trust',
  'Health and social care',
  'Charity and not-for-profit',
  'Professional services',
  'Technology',
  'Manufacturing, logistics and engineering',
  'Retail and hospitality',
  'Public sector',
  'Other',
] as const;

export const staffBands = ['1–50', '51–100', '101–250', '251–500', '501–1,000', 'More than 1,000'] as const;
export const siteBands = ['1', '2–5', '6–10', '11–25', 'More than 25'] as const;

export interface Booking {
  name: string;
  jobTitle: string;
  organisation: string;
  email: string;
  phone: string;
  staff: string;
  sites: string;
  sector: string;
  discuss?: string;
  source?: string;
  page?: string;
}

const s = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

export function parseBooking(form: FormData): { ok: true; data: Booking } | { ok: false; errors: Record<string, string> } {
  const data: Booking = {
    name: s(form.get('name')),
    jobTitle: s(form.get('jobTitle')),
    organisation: s(form.get('organisation')),
    email: s(form.get('email')),
    phone: s(form.get('phone')),
    staff: s(form.get('staff')),
    sites: s(form.get('sites')),
    sector: s(form.get('sector')),
    discuss: s(form.get('discuss')).slice(0, 2000),
    source: s(form.get('source')).slice(0, 200),
    page: s(form.get('page')).slice(0, 200),
  };
  const errors: Record<string, string> = {};
  if (data.name.length < 2) errors.name = 'Please enter your name.';
  if (!data.jobTitle) errors.jobTitle = 'Please enter your job title.';
  if (!data.organisation) errors.organisation = 'Please enter your organisation.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.phone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a phone number.';
  if (!(staffBands as readonly string[]).includes(data.staff)) errors.staff = 'Please choose a number of employees.';
  if (!(siteBands as readonly string[]).includes(data.sites)) errors.sites = 'Please choose a number of sites.';
  if (!(sectors as readonly string[]).includes(data.sector)) errors.sector = 'Please choose a sector.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
