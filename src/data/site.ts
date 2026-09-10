/**
 * Single source of truth for commercial facts and copy that repeats across
 * the site. Change it here and every page updates.
 */
export const site = {
  name: 'Human Code',
  tagline: 'Better management for different brains.',
  description:
    'Practical neurodiversity training that helps organisations build more confident managers, retain good people and improve performance.',
  // TODO(client): confirm final domain, legal entity and contact details.
  domain: 'humancode.co.uk',
  email: 'hello@humancode.co.uk',
  phone: '+44 (0)20 0000 0000',
  legalName: 'Human Code Training Ltd',
  registeredAddress: 'Registered office address to be confirmed, United Kingdom',
  companyNumber: '00000000',
  cta: {
    long: 'Book your free 60-minute CEO briefing',
    short: 'Book your free CEO briefing',
    nav: 'Book your CEO briefing',
    href: '/book/',
  },
} as const;

export const pricing = {
  vatNote: 'All prices exclude VAT.',
  vat: '+ VAT',
  online: {
    name: 'Human Code Online',
    price: 995,
    display: '£995',
    unit: 'per organisation or site of up to 100 staff',
    summary: 'The complete live programme: leader, leadership and all-staff sessions, plus ongoing access to Human Code materials.',
    includes: [
      '1-hour leader session',
      '2-hour leadership session',
      '2-hour all-staff session',
      'Human Code materials',
    ],
  },
  faceToFace: {
    name: 'Human Code Face-to-Face',
    price: 1500,
    display: '£1,500',
    unit: 'per organisation or site of up to 100 staff',
    summary: 'The same complete programme, delivered in person.',
    includes: [
      '1-hour leader session',
      '2-hour leadership session',
      '2-hour all-staff session',
      'Human Code materials',
    ],
  },
  multiSite: {
    name: 'Additional online sites',
    display: 'from £750',
    unit: 'per additional site',
    summary: 'Each site gets its own full cascade. We agree the rollout during your CEO briefing.',
  },
} as const;

/** Shown wherever the programme is explained, to separate the free briefing from the paid cascade. */
export const briefingNote =
  'The free 60-minute briefing comes first. If you proceed, the paid Human Code programme is a separate five-hour organisational programme.';

export const delivery = {
  online: {
    title: 'Live online',
    sub: 'The standard Human Code programme',
    body: 'Easy to schedule across your organisation, wherever your people are.',
  },
  faceToFace: {
    title: 'Face-to-face',
    sub: 'Human Code in your workplace',
    body: 'The same complete programme, delivered in person.',
  },
} as const;

export const cascade = [
  {
    n: 1,
    audience: 'CEO or organisational leader',
    title: 'Leaders understand',
    duration: '60 minutes',
    purpose: 'Understand and lead',
    summary:
      'The essential facts on neurodiversity at work and what they mean for management and performance.',
    includes: [
      'Neurodiversity in the workplace, clearly explained',
      'Management and performance implications',
      'Strengths and difficulties',
      'Workforce issues and difficult management situations',
      'Organisational implications',
      'Disclosure and diagnosis principles',
      'Basic legal awareness',
    ],
    outcome:
      'Leaders leave able to set the direction, back their managers and talk about the subject with confidence.',
  },
  {
    n: 2,
    audience: 'Leadership team, SLT and managers',
    title: 'Managers act',
    duration: '2 hours',
    purpose: 'Know what to do',
    summary:
      'What to do differently on Monday morning, worked through real scenarios.',
    includes: [
      'Communication, workload and task allocation',
      'Managing performance with confidence',
      'Staffing projects and teams intelligently',
      'Difficult conversations and challenging behaviour',
      'Workplace adjustments',
      'Responding appropriately to disclosure',
      'Knowing when to involve HR, occupational health or legal support',
    ],
    outcome:
      'Managers leave with practical tools they can use straight away, and more able to manage performance rather than frightened to.',
  },
  {
    n: 3,
    audience: 'All staff',
    title: 'Teams work better together',
    duration: '2 hours',
    purpose: 'Work better together',
    summary:
      'How people work and communicate differently, and the small changes that make teams work.',
    includes: [
      'Straightforward understanding of neurodiversity',
      'Different working and communication styles',
      'Practical ways colleagues can support one another',
      'Asking rather than assuming',
      'Strengths and difficulties',
      'No diagnosis. No compulsory disclosure.',
      'Small practical changes that improve teamwork',
    ],
    outcome:
      'Teams leave with a shared language and simple habits that make everyday collaboration easier.',
  },
] as const;

export const nav = [
  { label: 'How it works', href: '/how-it-works/' },
  { label: 'For leaders', href: '/for-leaders/' },
  { label: 'Knowledge', href: '/knowledge/' },
  { label: 'Pricing', href: '/pricing/' },
  { label: 'About', href: '/about/' },
] as const;

export const secondaryNav = [
  { label: 'What to expect', href: '/what-to-expect/' },
  { label: 'Schools & MATs', href: '/schools-and-mats/' },
  { label: 'Trainers', href: '/trainers/' },
  { label: 'Privacy', href: '/privacy/' },
] as const;

export const principles = [
  { title: 'People are different.', body: 'Not better or worse. Different. Good management starts there.' },
  { title: 'Difference is not diagnosis.', body: 'See the need. Respond to the need. Don’t diagnose the reason.' },
  { title: 'Start with the person in front of you.', body: 'Good management is about what this person needs to do their best work, not what a label says.' },
  { title: 'Understanding does not mean lowering standards.', body: 'It means being clearer about what is expected and better at helping people meet it.' },
  { title: 'Small changes make a big difference.', body: 'Most of what helps is simple, cheap and good for everyone.' },
  { title: 'Nobody should be pressured to disclose.', body: 'Personal information stays personal. Support does not depend on it.' },
] as const;
