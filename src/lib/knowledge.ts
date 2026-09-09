export const categories = {
  language: {
    label: 'Understanding the language',
    blurb: 'Plain-English explanations of the terms you will hear, and what they might mean at work.',
  },
  managing: {
    label: 'Managing people',
    blurb: 'Practical management: instructions, communication, workload, performance and difficult conversations.',
  },
  workplaces: {
    label: 'Building better workplaces',
    blurb: 'Recruitment, onboarding, meetings, project staffing and working environments.',
  },
  employer: {
    label: 'Employer responsibilities',
    blurb: 'Reasonable adjustments, the Equality Act, confidentiality and when to seek professional advice.',
  },
} as const;

export type CategoryKey = keyof typeof categories;
export const categoryKeys = Object.keys(categories) as CategoryKey[];
export const categoryLabel = (key: CategoryKey) => categories[key].label;

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
