/**
 * Government Departments Catalog & Field Officers Directory
 */

export const INITIAL_DEPARTMENTS = [
  {
    id: 'DEPT-HLTH',
    name: 'Department of Health & Family Welfare',
    code: 'HEALTH',
    category: 'Medical',
    icon: 'Activity',
    slaHours: 24,
    totalGrievances: 142,
    resolvedGrievances: 128,
    avgResolutionHours: 18.5,
    nodalOfficer: 'Dr. Suresh Kumar',
    contactPhone: '0471-2302490',
    contactEmail: 'grievance.health@kerala.gov.in',
    fieldOfficers: [
      { id: 'OFF-H1', name: 'Dr. Priya V. Nambiar', designation: 'Medical Inspector - Ernakulam' },
      { id: 'OFF-H2', name: 'Dr. Alex Fernandez', designation: 'Health Officer - Thiruvananthapuram' }
    ]
  },
  {
    id: 'DEPT-PWD',
    name: 'Public Works Department (PWD)',
    code: 'PWD',
    category: 'Infrastructure',
    icon: 'HardHat',
    slaHours: 72,
    totalGrievances: 384,
    resolvedGrievances: 310,
    avgResolutionHours: 58.2,
    nodalOfficer: 'Er. Rajesh V.',
    contactPhone: '0471-2331580',
    contactEmail: 'grievance.pwd@kerala.gov.in',
    fieldOfficers: [
      { id: 'OFF-P1', name: 'Er. Sandeep Menon', designation: 'Assistant Engineer - PWD Roads' },
      { id: 'OFF-P2', name: 'Er. Deepa S.', designation: 'Executive Inspector - Bridges Wing' }
    ]
  },
  {
    id: 'DEPT-KSEB',
    name: 'Kerala State Electricity Board (KSEB)',
    code: 'KSEB',
    category: 'Electricity',
    icon: 'Zap',
    slaHours: 24,
    totalGrievances: 256,
    resolvedGrievances: 242,
    avgResolutionHours: 14.1,
    nodalOfficer: 'Er. Gopalakrishnan',
    contactPhone: '1912',
    contactEmail: 'helpdesk.kseb@kerala.gov.in',
    fieldOfficers: [
      { id: 'OFF-E1', name: 'Shri. Vinod Kumar', designation: 'Senior Lineman Supervisor' },
      { id: 'OFF-E2', name: 'Er. Maya Joseph', designation: 'Sub-Division Engineer' }
    ]
  },
  {
    id: 'DEPT-KWA',
    name: 'Kerala Water Authority (KWA)',
    code: 'KWA',
    category: 'Water Supply',
    icon: 'Droplet',
    slaHours: 48,
    totalGrievances: 210,
    resolvedGrievances: 175,
    avgResolutionHours: 36.4,
    nodalOfficer: 'Er. Thomas Joseph',
    contactPhone: '1916',
    contactEmail: 'grievance.kwa@kerala.gov.in',
    fieldOfficers: [
      { id: 'OFF-W1', name: 'Er. Arun Prakash', designation: 'Water Supply Inspector' },
      { id: 'OFF-W2', name: 'Shri. K. Biju', designation: 'Pipeline Maintenance Head' }
    ]
  },
  {
    id: 'DEPT-REV',
    name: 'Revenue & Disaster Management Department',
    code: 'REVENUE',
    category: 'Disaster',
    icon: 'ShieldAlert',
    slaHours: 12,
    totalGrievances: 98,
    resolvedGrievances: 94,
    avgResolutionHours: 8.6,
    nodalOfficer: 'Shri. Manoj K. IAS',
    contactPhone: '1077',
    contactEmail: 'disaster.cell@kerala.gov.in',
    fieldOfficers: [
      { id: 'OFF-D1', name: 'Shri. Harikrishnan R.', designation: 'Tahsildar & Disaster Control Chief' },
      { id: 'OFF-D2', name: 'Smt. Seema Nair', designation: 'Village Officer' }
    ]
  },
  {
    id: 'DEPT-AGRI',
    name: 'Department of Agriculture & Farmers Welfare',
    code: 'AGRI',
    category: 'Agriculture',
    icon: 'Wheat',
    slaHours: 96,
    totalGrievances: 165,
    resolvedGrievances: 140,
    avgResolutionHours: 72.0,
    nodalOfficer: 'Smt. Lakshmi Prabha',
    contactPhone: '0471-2303498',
    contactEmail: 'grievance.agri@kerala.gov.in',
    fieldOfficers: [
      { id: 'OFF-A1', name: 'Shri. George K. V.', designation: 'Krishi Officer - Palakkad' },
      { id: 'OFF-A2', name: 'Smt. Latha M.', designation: 'Agricultural Field Assistant' }
    ]
  },
  {
    id: 'DEPT-EDU',
    name: 'Department of General Education',
    code: 'EDU',
    category: 'Education',
    icon: 'GraduationCap',
    slaHours: 120,
    totalGrievances: 112,
    resolvedGrievances: 98,
    avgResolutionHours: 88.5,
    nodalOfficer: 'Dr. Anita Roy',
    contactPhone: '0471-2320140',
    contactEmail: 'grievance.edu@kerala.gov.in',
    fieldOfficers: [
      { id: 'OFF-ED1', name: 'Shri. V. K. Jayaram', designation: 'Assistant Educational Officer (AEO)' }
    ]
  },
  {
    id: 'DEPT-SOC',
    name: 'Department of Social Justice & Welfare',
    code: 'SOCIAL',
    category: 'Social Welfare',
    icon: 'HeartHandshake',
    slaHours: 96,
    totalGrievances: 188,
    resolvedGrievances: 162,
    avgResolutionHours: 64.0,
    nodalOfficer: 'Smt. Radhika Nair',
    contactPhone: '0471-2306040',
    contactEmail: 'socialjustice.grievance@kerala.gov.in',
    fieldOfficers: [
      { id: 'OFF-S1', name: 'Smt. Bindu Pillai', designation: 'District Social Justice Officer' }
    ]
  }
];
