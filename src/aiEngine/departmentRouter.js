/**
 * AI Department Routing Engine
 * Automatically routes complaints to corresponding government departments
 * and assigns default SLA resolution targets.
 */

export const DEPARTMENT_MAP = {
  'Medical': {
    departmentId: 'DEPT-HLTH',
    name: 'Department of Health & Family Welfare',
    shortCode: 'Health Dept',
    slaHours: 24,
    contactEmail: 'grievance.health@gov.in',
    nodalOfficer: 'Dr. Suresh Kumar (Chief Medical Nodal Officer)'
  },
  'Infrastructure': {
    departmentId: 'DEPT-PWD',
    name: 'Public Works Department (PWD)',
    shortCode: 'PWD',
    slaHours: 72,
    contactEmail: 'grievance.pwd@gov.in',
    nodalOfficer: 'Er. Rajesh V. (Executive Engineer - PWD Roads)'
  },
  'Agriculture': {
    departmentId: 'DEPT-AGRI',
    name: 'Department of Agriculture & Farmers Welfare',
    shortCode: 'Agri Dept',
    slaHours: 96,
    contactEmail: 'grievance.agri@gov.in',
    nodalOfficer: 'Smt. Lakshmi Prabha (Principal Agricultural Officer)'
  },
  'Disaster': {
    departmentId: 'DEPT-REV',
    name: 'Revenue & Disaster Management Department',
    shortCode: 'Revenue / Disaster',
    slaHours: 12, // Ultra high priority SLA
    contactEmail: 'disaster.cell@gov.in',
    nodalOfficer: 'Shri. Manoj K. IAS (District Collector & Disaster Cell Chief)'
  },
  'Education': {
    departmentId: 'DEPT-EDU',
    name: 'Department of General Education',
    shortCode: 'General Edu',
    slaHours: 120,
    contactEmail: 'grievance.edu@gov.in',
    nodalOfficer: 'Dr. Anita Roy (Deputy Director of Education)'
  },
  'Electricity': {
    departmentId: 'DEPT-KSEB',
    name: 'State Electricity Board (KSEB)',
    shortCode: 'KSEB',
    slaHours: 24,
    contactEmail: 'helpdesk.kseb@gov.in',
    nodalOfficer: 'Er. Gopalakrishnan (Assistant Executive Engineer - Electrical Grid)'
  },
  'Water Supply': {
    departmentId: 'DEPT-KWA',
    name: 'State Water Authority (KWA)',
    shortCode: 'KWA',
    slaHours: 48,
    contactEmail: 'grievance.kwa@gov.in',
    nodalOfficer: 'Er. Thomas Joseph (Superintending Engineer - Water Supply Division)'
  },
  'Social Welfare': {
    departmentId: 'DEPT-SOC',
    name: 'Department of Social Justice & Welfare',
    shortCode: 'Social Justice',
    slaHours: 96,
    contactEmail: 'socialjustice.grievance@gov.in',
    nodalOfficer: 'Smt. Radhika Nair (Director of Social Welfare)'
  }
};

/**
 * Route grievance to responsible department based on classified category & subcategory
 * @param {string} category 
 * @param {string} subcategory 
 * @returns {Object} Department routing details and target SLA resolution time
 */
export function routeToDepartment(category, subcategory = '') {
  const dept = DEPARTMENT_MAP[category] || DEPARTMENT_MAP['Infrastructure'];
  
  // Calculate target resolution SLA timestamp
  const now = new Date();
  const targetSla = new Date(now.getTime() + (dept.slaHours * 60 * 60 * 1000));

  return {
    ...dept,
    assignedAt: now.toISOString(),
    slaTargetDate: targetSla.toISOString(),
    routingConfidence: 0.96
  };
}
