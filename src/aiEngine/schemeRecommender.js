/**
 * AI Government Scheme Recommendation Engine
 * Matches citizen profile parameters and grievance context against welfare scheme eligibility criteria.
 */

export const GOVERNMENT_SCHEMES = [
  {
    id: 'SCHEME-CMDRF',
    name: "Chief Minister's Distress Relief Fund (CMDRF)",
    category: 'Disaster / Emergency Financial Aid',
    targetCategories: ['Medical', 'Disaster', 'Infrastructure'],
    description: 'Financial assistance for citizens facing major medical emergencies (cancer, dialysis, heart surgeries) or severe disaster losses.',
    maxFinancialBenefit: 'Up to ₹2,00,000',
    eligibility: {
      maxAnnualIncome: 200000,
      minAge: 0,
      occupations: ['Any', 'Farmer', 'Laborer', 'Artisan', 'Unemployed', 'Student'],
      requiredDocs: ['Income Certificate', 'Medical Certificate / Disaster Damage Loss Report', 'Aadhaar Card', 'Ration Card (BPL/Priority)']
    },
    officialPortalUrl: 'https://cmdrf.kerala.gov.in',
    sponsoringBody: 'State Government'
  },
  {
    id: 'SCHEME-PM-KISAN',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    category: 'Agriculture & Farm Income Support',
    targetCategories: ['Agriculture'],
    description: 'Direct income support of ₹6,00,0 per year in 3 equal installments to small and marginal farmer families.',
    maxFinancialBenefit: '₹6,000 / year direct transfer',
    eligibility: {
      maxAnnualIncome: 400000,
      minAge: 18,
      occupations: ['Farmer', 'Agricultural Worker'],
      requiredDocs: ['Land Holding Rights Document', 'Aadhaar Seeded Bank Account', 'Kisan Credit Card']
    },
    officialPortalUrl: 'https://pmkisan.gov.in',
    sponsoringBody: 'Central Government'
  },
  {
    id: 'SCHEME-AYUSHMAN',
    name: 'Ayushman Bharat - PM-JAY & Karunya Health Scheme',
    category: 'Healthcare Insurance',
    targetCategories: ['Medical', 'Social Welfare'],
    description: 'Cashless secondary and tertiary hospital care coverage up to ₹5,00,000 per family per year for BPL and low-income households.',
    maxFinancialBenefit: '₹5,00,000 health cover / year',
    eligibility: {
      maxAnnualIncome: 150000,
      minAge: 0,
      occupations: ['Any', 'Laborer', 'Unemployed', 'Farmer'],
      requiredDocs: ['Ayushman Golden Card / Karunya Card', 'Aadhaar Card', 'Ration Card']
    },
    officialPortalUrl: 'https://pmjay.gov.in',
    sponsoringBody: 'Central & State Joint'
  },
  {
    id: 'SCHEME-NSP-SCHOLARSHIP',
    name: 'National Welfare Scholarship & Vidyasiri Scheme',
    category: 'Educational Financial Support',
    targetCategories: ['Education', 'Social Welfare'],
    description: 'Post-matric and merit-cum-means scholarship for students from low-income background pursuing higher education.',
    maxFinancialBenefit: '₹12,000 - ₹50,000 / year',
    eligibility: {
      maxAnnualIncome: 250000,
      minAge: 15,
      maxAge: 30,
      occupations: ['Student'],
      requiredDocs: ['Mark Sheets', 'Income Certificate', 'Institution Admission Proof', 'Bank Passbook']
    },
    officialPortalUrl: 'https://scholarships.gov.in',
    sponsoringBody: 'Ministry of Education'
  },
  {
    id: 'SCHEME-PENSION-OLDAGE',
    name: 'Indira Gandhi National Pension & Social Security Pension',
    category: 'Social Welfare & Senior Assistance',
    targetCategories: ['Social Welfare', 'Medical'],
    description: 'Monthly financial pension support for senior citizens, widows, and differently-abled individuals.',
    maxFinancialBenefit: '₹1,600 / month pension',
    eligibility: {
      maxAnnualIncome: 100000,
      minAge: 60,
      occupations: ['Any', 'Retired', 'Unemployed'],
      requiredDocs: ['Age Proof / Birth Certificate', 'Disability Certificate (if applicable)', 'Income Certificate']
    },
    officialPortalUrl: 'https://welfarepension.kerala.gov.in',
    sponsoringBody: 'State Social Justice Dept'
  },
  {
    id: 'SCHEME-PMAY-HOUSING',
    name: 'LIFE Housing Scheme & PMAY Urban/Rural',
    category: 'Housing & Shelter Assistance',
    targetCategories: ['Infrastructure', 'Social Welfare', 'Disaster'],
    description: 'Financial grant to construct pucca houses for homeless families or houses destroyed due to disaster.',
    maxFinancialBenefit: '₹4,00,000 house construction grant',
    eligibility: {
      maxAnnualIncome: 300000,
      minAge: 21,
      occupations: ['Any', 'Laborer', 'Farmer', 'Unemployed'],
      requiredDocs: ['Land Title Deed (Pattayathil)', 'BPL Ration Card', 'Aadhaar Card', 'House Damage Report']
    },
    officialPortalUrl: 'https://lifekerala.gov.in',
    sponsoringBody: 'State & Central Joint'
  }
];

/**
 * Recommend top eligible schemes based on citizen demographic profile & grievance context
 * @param {Object} citizenProfile { income, age, occupation, category, state, district }
 * @param {Object} grievanceContext { category, subcategory }
 * @returns {Array} List of schemes sorted by match score with reasoning breakdown
 */
export function recommendSchemes(citizenProfile = {}, grievanceContext = {}) {
  const {
    income = 150000,
    age = 35,
    occupation = 'Farmer',
    category: citizenCategory = 'General'
  } = citizenProfile;

  const { category: grievanceCategory = '', subcategory = '' } = grievanceContext;

  const recommendations = GOVERNMENT_SCHEMES.map(scheme => {
    let score = 50; // Base score
    const matchReasons = [];

    // 1. Income Eligibility
    if (income <= scheme.eligibility.maxAnnualIncome) {
      score += 25;
      matchReasons.push(`Income ₹${income.toLocaleString()} meets criteria (≤ ₹${scheme.eligibility.maxAnnualIncome.toLocaleString()})`);
    } else {
      score -= 30;
      matchReasons.push(`Income ₹${income.toLocaleString()} exceeds threshold (₹${scheme.eligibility.maxAnnualIncome.toLocaleString()})`);
    }

    // 2. Age Eligibility
    const minAge = scheme.eligibility.minAge || 0;
    const maxAge = scheme.eligibility.maxAge || 120;
    if (age >= minAge && age <= maxAge) {
      score += 15;
      matchReasons.push(`Age ${age} is within target range (${minAge}-${maxAge} yrs)`);
    }

    // 3. Occupation Match
    if (scheme.eligibility.occupations.includes('Any') || scheme.eligibility.occupations.includes(occupation)) {
      score += 15;
      matchReasons.push(`Occupation '${occupation}' qualifies`);
    }

    // 4. Grievance Context Affinity (High relevance bonus!)
    if (grievanceCategory && scheme.targetCategories.includes(grievanceCategory)) {
      score += 25;
      matchReasons.push(`Highly relevant to filed '${grievanceCategory}' complaint`);
    }

    // Bound score
    const finalScore = Math.min(99, Math.max(15, score));
    const isEligible = finalScore >= 60;

    return {
      ...scheme,
      matchScore: finalScore,
      isEligible,
      matchReasons
    };
  });

  // Sort descending by matchScore
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
