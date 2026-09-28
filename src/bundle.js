/**
 * JanSeva AI - Self-Contained Application Bundle v4.0
 * Strict Role Isolation:
 * - Public Citizen Portal: Registration is STRICTLY for Citizens (no admin registration visible).
 * - Official Government Portal: Dedicated secure authentication for Department Admins & Super Admins.
 */

(function() {
  // ==========================================
  // 1. NLP PREPROCESSING ENGINE
  // ==========================================
  const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
    'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
    'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
    'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
    'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
    'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
    'please', 'sir', 'madam', 'kindly', 'help', 'request', 'issue', 'problem', 'regarding'
  ]);

  const LEMMA_DICT = {
    'roads': 'road', 'potholes': 'pothole', 'leaks': 'leak', 'leaking': 'leak', 'leakage': 'leak',
    'broken': 'break', 'damages': 'damage', 'damaged': 'damage', 'floods': 'flood', 'flooded': 'flood',
    'flooding': 'flood', 'hospitals': 'hospital', 'surgeries': 'surgery', 'transplants': 'transplant',
    'outages': 'outage', 'transformers': 'transformer', 'lines': 'line', 'wires': 'wire',
    'drains': 'drain', 'drainages': 'drainage', 'blocked': 'block', 'blocking': 'block', 'blockage': 'block',
    'accidents': 'accident', 'emergency': 'emergency', 'emergencies': 'emergency', 'schools': 'school',
    'teachers': 'teacher', 'scholarships': 'scholarship', 'pensions': 'pension'
  };

  const NEGATIVE_VALENCE_KEYWORDS = [
    'terrible', 'worst', 'danger', 'dangerous', 'life-threatening', 'collapsed', 'urgent',
    'critical', 'hazard', 'hazardous', 'dying', 'death', 'casualty', 'severe', 'horrible',
    'unusable', 'overflowing', 'toxic', 'electrocution', 'sparking', 'destroyed', 'blocked'
  ];

  function preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return { cleanText: '', tokens: [], lemmas: [], keywords: [], sentimentScore: 0 };
    }
    const rawClean = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
    const rawTokens = rawClean.split(/\s+/).filter(Boolean);
    const filteredTokens = rawTokens.filter(token => !STOP_WORDS.has(token) && token.length > 1);
    const lemmas = filteredTokens.map(token => LEMMA_DICT[token] || token);

    let negativeCount = 0;
    lemmas.forEach(word => {
      if (NEGATIVE_VALENCE_KEYWORDS.includes(word)) negativeCount += 1;
    });

    const sentimentScore = Math.min(1.0, (negativeCount * 0.25));
    return { rawText: text, cleanText: lemmas.join(' '), tokens: rawTokens, filteredTokens, lemmas, keywords: Array.from(new Set(lemmas)), sentimentScore };
  }

  // ==========================================
  // 2. CATEGORY CLASSIFIER
  // ==========================================
  const CATEGORY_VOCABULARY = {
    'Medical': {
      weight: 1.0,
      subcategories: {
        'Dialysis': ['dialysis', 'kidney', 'renal', 'nephrology', 'blood-filtering'],
        'Cancer Treatment': ['cancer', 'chemotherapy', 'radiation', 'oncology', 'tumor'],
        'Heart Surgery': ['heart', 'bypass', 'cardiac', 'angioplasty', 'artery'],
        'Kidney Transplant': ['transplant', 'kidney-donor', 'organ'],
        'Accident & Trauma': ['accident', 'casualty', 'trauma', 'ambulance', 'crash', 'bleeding'],
        'ICU & Emergency': ['icu', 'ventilator', 'oxygen', 'critical-care', 'emergency-ward'],
        'Hospital Infrastructure': ['hospital', 'doctor', 'medicine', 'clinic', 'nurse', 'bed']
      }
    },
    'Infrastructure': {
      weight: 1.0,
      subcategories: {
        'Roads & Potholes': ['road', 'pothole', 'tarmac', 'asphalt', 'highway', 'street', 'crater'],
        'Drainage & Sewage': ['drain', 'drainage', 'sewage', 'gutter', 'overflow', 'clogged', 'sludge'],
        'Street Lights': ['light', 'darkness', 'lamp-post', 'street-light', 'night-visibility'],
        'Bridges & Culverts': ['bridge', 'culvert', 'flyover', 'crack', 'footpath', 'retaining-wall']
      }
    },
    'Agriculture': {
      weight: 1.0,
      subcategories: {
        'Crop Loss': ['crop', 'paddy', 'harvest', 'destroyed-crops', 'yield', 'monsoon-damage'],
        'Irrigation & Canal': ['irrigation', 'canal', 'farm-water', 'pump', 'borewell', 'paddy-field'],
        'Agricultural Subsidy': ['subsidy', 'fertilizer', 'seeds', 'tractor', 'farm-loan', 'kisan'],
        'Pest Attack': ['pest', 'insects', 'locust', 'blight', 'fungus', 'crop-disease']
      }
    },
    'Disaster': {
      weight: 1.2,
      subcategories: {
        'Flood Damage': ['flood', 'flooding', 'inundated', 'river-overflow', 'submerged', 'waterlogging'],
        'Landslide & Mudslide': ['landslide', 'mudslide', 'hill-collapse', 'rockfall', 'debris'],
        'Fire Hazard': ['fire', 'blaze', 'short-circuit-fire', 'explosion', 'gas-leak'],
        'Storm & Wind Loss': ['cyclone', 'storm', 'tornado', 'uprooted-tree', 'roof-blown']
      }
    },
    'Education': {
      weight: 1.0,
      subcategories: {
        'Scholarships': ['scholarship', 'stipend', 'tuition-fee', 'grant', 'financial-aid-student'],
        'School Infrastructure': ['school', 'classroom', 'desk', 'blackboard', 'roof-leak-school', 'toilet-school'],
        'Midday Meal': ['meal', 'food-school', 'nutrition', 'ration-school'],
        'Faculty Shortage': ['teacher', 'faculty', 'staff-shortage', 'principal']
      }
    },
    'Electricity': {
      weight: 1.0,
      subcategories: {
        'Power Outage': ['power', 'electricity', 'blackout', 'outage', 'no-power', 'current-cut'],
        'Transformer Defect': ['transformer', 'sparking', 'explosion-transformer', 'oil-leak-transformer'],
        'High Voltage Wire Risk': ['wire', 'hanging-wire', 'snapped-cable', 'pole-collapsed', 'electrocution-risk'],
        'Billing Dispute': ['meter', 'bill', 'tariff', 'overcharge', 'reading']
      }
    },
    'Water Supply': {
      weight: 1.0,
      subcategories: {
        'Pipe Leakage': ['pipe', 'leak', 'pipeline', 'burst-pipe', 'main-line-leak'],
        'Contaminated Water': ['dirty-water', 'muddy', 'contamination', 'smell', 'unfit-drinking', 'cholera-risk'],
        'No Water Supply': ['no-water', 'water-shortage', 'tanker', 'dry-tap', 'scarcity'],
        'Well Contamination': ['well', 'borewell-pollution', 'saline-water']
      }
    },
    'Social Welfare': {
      weight: 1.0,
      subcategories: {
        'Pension Schemes': ['pension', 'old-age', 'widow', 'disability-pension', 'payout-delay'],
        'Housing Assistance': ['housing', 'pmay', 'home-sanction', 'shelter', 'roof-repair'],
        'Ration & Food Security': ['ration', 'bpl-card', 'ration-shop', 'rice-distribution', 'food-grain'],
        'Disability Support': ['handicapped', 'wheelchair', 'disability-certificate', 'assistive-device']
      }
    }
  };

  function classifyGrievance(complaintText) {
    const { lemmas, keywords } = preprocessText(complaintText);
    if (!keywords || keywords.length === 0) {
      return { category: 'Infrastructure', subcategory: 'Roads & Potholes', confidence: 0.35, keywords: [] };
    }

    const categoryScores = {};
    const subcategoryScores = {};

    Object.entries(CATEGORY_VOCABULARY).forEach(([catName, catData]) => {
      let catScore = 0;
      let maxSubScore = 0;
      let bestSub = Object.keys(catData.subcategories)[0];

      Object.entries(catData.subcategories).forEach(([subName, subKeywords]) => {
        let subScore = 0;
        subKeywords.forEach(kw => {
          if (lemmas.includes(kw) || complaintText.toLowerCase().includes(kw)) subScore += 3;
          lemmas.forEach(lemma => {
            if (lemma.includes(kw) || kw.includes(lemma)) subScore += 1.5;
          });
        });
        if (subScore > maxSubScore) {
          maxSubScore = subScore;
          bestSub = subName;
        }
        catScore += subScore;
      });

      catScore *= catData.weight;
      categoryScores[catName] = catScore;
      subcategoryScores[catName] = { subcategory: bestSub, score: maxSubScore };
    });

    let topCategory = 'Infrastructure';
    let maxCatScore = -1;
    Object.entries(categoryScores).forEach(([catName, score]) => {
      if (score > maxCatScore) {
        maxCatScore = score;
        topCategory = catName;
      }
    });

    const bestSubcategory = subcategoryScores[topCategory].subcategory;
    const confidence = Math.min(0.98, Math.max(0.45, (maxCatScore / 12)));
    return { category: topCategory, subcategory: bestSubcategory, confidence: Number(confidence.toFixed(2)), matchedKeywords: keywords.slice(0, 6) };
  }

  // ==========================================
  // 3. PRIORITY PREDICTOR
  // ==========================================
  const CRITICAL_KEYWORDS = ['dying', 'death', 'casualty', 'electrocution', 'sparking', 'collapse', 'collapsed', 'blood', 'fire', 'explosion', 'landslide', 'submerged', 'hospitalized', 'icu', 'heart attack', 'contaminating', 'poisonous', 'bleeding', 'toxic', 'trauma', 'emergency'];
  const HIGH_KEYWORDS = ['blocked', 'broken', 'no water', 'power cut', 'outage', 'flood', 'overflowing', 'hazard', 'dangerous', 'severe', 'urgent', 'disability', 'pension delay', 'crop loss'];

  function predictPriority({ complaintText, category, subcategory, affectedPeople = 1, isDuplicate = false }) {
    const { lemmas, sentimentScore } = preprocessText(complaintText);
    let totalScore = 20;

    let keywordScore = 0;
    lemmas.forEach(word => {
      if (CRITICAL_KEYWORDS.includes(word)) keywordScore += 25;
      else if (HIGH_KEYWORDS.includes(word)) keywordScore += 12;
    });
    keywordScore = Math.min(40, keywordScore);
    totalScore += keywordScore;

    let categoryWeight = 8;
    if (category === 'Disaster' || category === 'Medical') categoryWeight = 25;
    else if (category === 'Electricity' || category === 'Water Supply') categoryWeight = 18;
    else if (category === 'Infrastructure' || category === 'Agriculture') categoryWeight = 12;
    totalScore += categoryWeight;

    let countWeight = 0;
    const count = Number(affectedPeople) || 1;
    if (count > 500) countWeight = 20;
    else if (count > 100) countWeight = 15;
    else if (count > 20) countWeight = 10;
    else if (count > 5) countWeight = 5;
    totalScore += countWeight;

    const sentimentWeight = Math.round(sentimentScore * 15);
    totalScore += sentimentWeight;
    if (isDuplicate) totalScore += 10;

    totalScore = Math.min(100, Math.max(10, Math.round(totalScore)));

    let priority = 'Low';
    let badgeColor = 'bg-slate-200 text-slate-700 border-slate-300';
    if (totalScore >= 80) {
      priority = 'Critical';
      badgeColor = 'bg-rose-600 text-white border-rose-700 animate-pulse';
    } else if (totalScore >= 60) {
      priority = 'High';
      badgeColor = 'bg-amber-500 text-slate-950 font-bold border-amber-600';
    } else if (totalScore >= 40) {
      priority = 'Medium';
      badgeColor = 'bg-emerald-600 text-white border-emerald-700';
    }

    return { priority, score: totalScore, badgeColor, factorsBreakdown: { keywordScore, categoryWeight, countWeight, sentimentWeight } };
  }

  // ==========================================
  // 4. DEPARTMENT ROUTER
  // ==========================================
  const DEPARTMENT_MAP = {
    'Medical': { departmentId: 'DEPT-HLTH', name: 'Department of Health & Family Welfare', shortCode: 'Health Dept', slaHours: 24, nodalOfficer: 'Dr. Suresh Kumar (Chief Medical Nodal Officer)' },
    'Infrastructure': { departmentId: 'DEPT-PWD', name: 'Public Works Department (PWD)', shortCode: 'PWD', slaHours: 72, nodalOfficer: 'Er. Rajesh V. (Executive Engineer - PWD Roads)' },
    'Agriculture': { departmentId: 'DEPT-AGRI', name: 'Department of Agriculture & Farmers Welfare', shortCode: 'Agri Dept', slaHours: 96, nodalOfficer: 'Smt. Lakshmi Prabha (Principal Agricultural Officer)' },
    'Disaster': { departmentId: 'DEPT-REV', name: 'Revenue & Disaster Management Department', shortCode: 'Revenue / Disaster', slaHours: 12, nodalOfficer: 'Shri. Manoj K. IAS (District Collector)' },
    'Education': { departmentId: 'DEPT-EDU', name: 'Department of General Education', shortCode: 'General Edu', slaHours: 120, nodalOfficer: 'Dr. Anita Roy (Deputy Director of Education)' },
    'Electricity': { departmentId: 'DEPT-KSEB', name: 'State Electricity Board (KSEB)', shortCode: 'KSEB', slaHours: 24, nodalOfficer: 'Er. Gopalakrishnan (Assistant Executive Engineer)' },
    'Water Supply': { departmentId: 'DEPT-KWA', name: 'State Water Authority (KWA)', shortCode: 'KWA', slaHours: 48, nodalOfficer: 'Er. Thomas Joseph (Superintending Engineer)' },
    'Social Welfare': { departmentId: 'DEPT-SOC', name: 'Department of Social Justice & Welfare', shortCode: 'Social Justice', slaHours: 96, nodalOfficer: 'Smt. Radhika Nair (Director of Social Welfare)' }
  };

  function routeToDepartment(category) {
    const dept = DEPARTMENT_MAP[category] || DEPARTMENT_MAP['Infrastructure'];
    const now = new Date();
    const targetSla = new Date(now.getTime() + (dept.slaHours * 60 * 60 * 1000));
    return { ...dept, assignedAt: now.toISOString(), slaTargetDate: targetSla.toISOString() };
  }

  // ==========================================
  // 5. SCHEME RECOMMENDER
  // ==========================================
  const GOVERNMENT_SCHEMES = [
    {
      id: 'SCHEME-CMDRF',
      name: "Chief Minister's Distress Relief Fund (CMDRF)",
      category: 'Disaster / Emergency Financial Aid',
      targetCategories: ['Medical', 'Disaster', 'Infrastructure'],
      description: 'Financial assistance for citizens facing major medical emergencies (cancer, dialysis, heart surgeries) or severe disaster losses.',
      maxFinancialBenefit: 'Up to ₹2,00,000',
      eligibility: { maxAnnualIncome: 200000, minAge: 0, occupations: ['Any', 'Farmer', 'Laborer', 'Artisan', 'Unemployed', 'Student'] },
      officialPortalUrl: 'https://cmdrf.kerala.gov.in'
    },
    {
      id: 'SCHEME-PM-KISAN',
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      category: 'Agriculture & Farm Income Support',
      targetCategories: ['Agriculture'],
      description: 'Direct income support of ₹6,00,0 per year in 3 equal installments to small and marginal farmer families.',
      maxFinancialBenefit: '₹6,000 / year direct transfer',
      eligibility: { maxAnnualIncome: 400000, minAge: 18, occupations: ['Farmer', 'Agricultural Worker'] },
      officialPortalUrl: 'https://pmkisan.gov.in'
    },
    {
      id: 'SCHEME-AYUSHMAN',
      name: 'Ayushman Bharat - PM-JAY & Karunya Health Scheme',
      category: 'Healthcare Insurance',
      targetCategories: ['Medical', 'Social Welfare'],
      description: 'Cashless secondary and tertiary hospital care coverage up to ₹5,00,000 per family per year for BPL and low-income households.',
      maxFinancialBenefit: '₹5,00,000 health cover / year',
      eligibility: { maxAnnualIncome: 150000, minAge: 0, occupations: ['Any', 'Laborer', 'Unemployed', 'Farmer'] },
      officialPortalUrl: 'https://pmjay.gov.in'
    },
    {
      id: 'SCHEME-NSP-SCHOLARSHIP',
      name: 'National Welfare Scholarship & Vidyasiri Scheme',
      category: 'Educational Financial Support',
      targetCategories: ['Education', 'Social Welfare'],
      description: 'Post-matric and merit-cum-means scholarship for students from low-income background pursuing higher education.',
      maxFinancialBenefit: '₹12,000 - ₹50,000 / year',
      eligibility: { maxAnnualIncome: 250000, minAge: 15, maxAge: 30, occupations: ['Student'] },
      officialPortalUrl: 'https://scholarships.gov.in'
    },
    {
      id: 'SCHEME-PENSION-OLDAGE',
      name: 'Indira Gandhi National Pension & Social Security Pension',
      category: 'Social Welfare & Senior Assistance',
      targetCategories: ['Social Welfare', 'Medical'],
      description: 'Monthly financial pension support for senior citizens, widows, and differently-abled individuals.',
      maxFinancialBenefit: '₹1,600 / month pension',
      eligibility: { maxAnnualIncome: 100000, minAge: 60, occupations: ['Any', 'Retired', 'Unemployed'] },
      officialPortalUrl: 'https://welfarepension.kerala.gov.in'
    },
    {
      id: 'SCHEME-PMAY-HOUSING',
      name: 'LIFE Housing Scheme & PMAY Urban/Rural',
      category: 'Housing & Shelter Assistance',
      targetCategories: ['Infrastructure', 'Social Welfare', 'Disaster'],
      description: 'Financial grant to construct pucca houses for homeless families or houses destroyed due to disaster.',
      maxFinancialBenefit: '₹4,00,000 house construction grant',
      eligibility: { maxAnnualIncome: 300000, minAge: 21, occupations: ['Any', 'Laborer', 'Farmer', 'Unemployed'] },
      officialPortalUrl: 'https://lifekerala.gov.in'
    }
  ];

  function recommendSchemes(citizenProfile = {}, grievanceContext = {}) {
    const { income = 150000, age = 35, occupation = 'Farmer' } = citizenProfile;
    const { category: grievanceCategory = '' } = grievanceContext;

    const recommendations = GOVERNMENT_SCHEMES.map(scheme => {
      let score = 50;
      const matchReasons = [];

      if (income <= scheme.eligibility.maxAnnualIncome) {
        score += 25;
        matchReasons.push(`Income ₹${income.toLocaleString()} meets criteria (≤ ₹${scheme.eligibility.maxAnnualIncome.toLocaleString()})`);
      } else {
        score -= 30;
        matchReasons.push(`Income ₹${income.toLocaleString()} exceeds threshold`);
      }

      const minAge = scheme.eligibility.minAge || 0;
      const maxAge = scheme.eligibility.maxAge || 120;
      if (age >= minAge && age <= maxAge) {
        score += 15;
        matchReasons.push(`Age ${age} is within target range (${minAge}-${maxAge} yrs)`);
      }

      if (scheme.eligibility.occupations.includes('Any') || scheme.eligibility.occupations.includes(occupation)) {
        score += 15;
        matchReasons.push(`Occupation '${occupation}' qualifies`);
      }

      if (grievanceCategory && scheme.targetCategories.includes(grievanceCategory)) {
        score += 25;
        matchReasons.push(`Highly relevant to filed '${grievanceCategory}' complaint`);
      }

      const finalScore = Math.min(99, Math.max(15, score));
      return { ...scheme, matchScore: finalScore, isEligible: finalScore >= 60, matchReasons };
    });

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  // ==========================================
  // 6. SEED DATA & PRE-REGISTERED ACCOUNTS
  // ==========================================
  const REGISTERED_USERS = [
    { email: 'citizen@gov.in', password: 'password123', name: 'Ramesh Varma', role: 'citizen', phone: '+91 98470 12345', district: 'Ernakulam', income: 120000, age: 54, occupation: 'Laborer' },
    { email: 'kseb.admin@gov.in', password: 'password123', name: 'Er. Gopalakrishnan', role: 'dept_admin', deptId: 'DEPT-KSEB', deptName: 'State Electricity Board (KSEB)' },
    { email: 'health.admin@gov.in', password: 'password123', name: 'Dr. Suresh Kumar', role: 'dept_admin', deptId: 'DEPT-HLTH', deptName: 'Department of Health & Family Welfare' },
    { email: 'pwd.admin@gov.in', password: 'password123', name: 'Er. Rajesh V.', role: 'dept_admin', deptId: 'DEPT-PWD', deptName: 'Public Works Department (PWD)' },
    { email: 'superadmin@gov.in', password: 'password123', name: 'Master Governance Admin', role: 'super_admin' }
  ];

  const INITIAL_GRIEVANCES = [
    {
      id: 'GRV-2026-9041', trackingId: 'KL-9041-MED', citizenName: 'Ramesh Varma', citizenPhone: '+91 98470 12345', citizenEmail: 'citizen@gov.in', citizenDistrict: 'Ernakulam', citizenPincode: '682011', citizenIncome: 120000, citizenAge: 54, citizenOccupation: 'Laborer',
      title: 'Urgent Financial Grant Request for Emergency Kidney Dialysis Treatment',
      description: 'My brother is undergoing weekly kidney dialysis at General Hospital Ernakulam. Our family income has completely drained out due to high medical costs. Kindly grant emergency CMDRF financial assistance or Karunya coverage.',
      category: 'Medical', subcategory: 'Dialysis', priority: 'Critical', priorityScore: 92, affectedPeople: 4, departmentId: 'DEPT-HLTH', departmentName: 'Department of Health & Family Welfare', nodalOfficer: 'Dr. Suresh Kumar (Chief Medical Nodal Officer)', status: 'In Review', submittedAt: '2026-08-04T10:15:00.000Z',
      timeline: [
        { status: 'Submitted', timestamp: '2026-08-04T10:15:00.000Z', note: 'Grievance submitted by citizen via portal.' },
        { status: 'AI Triaged', timestamp: '2026-08-04T10:15:05.000Z', note: 'AI System categorized as Medical -> Dialysis. Predicted Priority: CRITICAL (92/100).' },
        { status: 'In Review', timestamp: '2026-08-04T14:30:00.000Z', note: 'Assigned to Senior Officer Dr. Suresh Kumar.' }
      ]
    },
    {
      id: 'GRV-2026-8812', trackingId: 'KL-8812-ELE', citizenName: 'Anitha Kumari', citizenPhone: '+91 94461 98765', citizenEmail: 'anitha.k@email.com', citizenDistrict: 'Thiruvananthapuram', citizenPincode: '695001', citizenIncome: 180000, citizenAge: 42, citizenOccupation: 'Homemaker',
      title: 'High Voltage Sparking and Collapsed Electric Pole near Public School',
      description: 'Heavy rain caused an electric pole transformer to spark violently and tilt dangerously near St. Mary High School entrance. Live wire dangling within reach of children. Extreme electrocution risk!',
      category: 'Electricity', subcategory: 'High Voltage Wire Risk', priority: 'Critical', priorityScore: 98, affectedPeople: 450, departmentId: 'DEPT-KSEB', departmentName: 'State Electricity Board (KSEB)', nodalOfficer: 'Er. Gopalakrishnan (Assistant Executive Engineer)', status: 'In Progress', submittedAt: '2026-08-05T08:30:00.000Z',
      timeline: [
        { status: 'Submitted', timestamp: '2026-08-05T08:30:00.000Z', note: 'Grievance submitted.' },
        { status: 'AI Triaged', timestamp: '2026-08-05T08:30:04.000Z', note: 'AI System categorized as Electricity -> High Voltage Risk. Priority: CRITICAL (98/100).' },
        { status: 'In Progress', timestamp: '2026-08-05T09:00:00.000Z', note: 'Emergency Lineman team dispatched.' }
      ]
    }
  ];

  const INITIAL_SCHEME_APPLICATIONS = [
    {
      appId: 'APP-2026-1092',
      schemeId: 'SCHEME-CMDRF',
      schemeName: "Chief Minister's Distress Relief Fund (CMDRF)",
      citizenName: 'Ramesh Varma',
      citizenPhone: '+91 98470 12345',
      citizenIncome: 120000,
      citizenAge: 54,
      citizenOccupation: 'Laborer',
      district: 'Ernakulam',
      requestedGrantAmount: '₹1,50,000',
      attachedDocs: ['Income Certificate (Certified)', 'Hospital Dialysis Summary', 'Aadhaar Card'],
      status: 'Under Verification',
      submittedAt: '2026-08-04T11:00:00.000Z',
      remarks: 'Awaiting Village Officer income verification report.'
    }
  ];

  const INITIAL_DEPARTMENTS = [
    { id: 'DEPT-HLTH', name: 'Department of Health & Family Welfare', code: 'HEALTH', category: 'Medical', slaHours: 24, totalGrievances: 142, resolvedGrievances: 128, avgResolutionHours: 18.5, nodalOfficer: 'Dr. Suresh Kumar', fieldOfficers: [{ name: 'Dr. Priya V. Nambiar', designation: 'Medical Inspector' }] },
    { id: 'DEPT-PWD', name: 'Public Works Department (PWD)', code: 'PWD', category: 'Infrastructure', slaHours: 72, totalGrievances: 384, resolvedGrievances: 310, avgResolutionHours: 58.2, nodalOfficer: 'Er. Rajesh V.', fieldOfficers: [{ name: 'Er. Sandeep Menon', designation: 'Assistant Engineer' }] },
    { id: 'DEPT-KSEB', name: 'State Electricity Board (KSEB)', code: 'KSEB', category: 'Electricity', slaHours: 24, totalGrievances: 256, resolvedGrievances: 242, avgResolutionHours: 14.1, nodalOfficer: 'Er. Gopalakrishnan', fieldOfficers: [{ name: 'Shri. Vinod Kumar', designation: 'Lineman Supervisor' }] },
    { id: 'DEPT-KWA', name: 'State Water Authority (KWA)', code: 'KWA', category: 'Water Supply', slaHours: 48, totalGrievances: 210, resolvedGrievances: 175, avgResolutionHours: 36.4, nodalOfficer: 'Er. Thomas Joseph', fieldOfficers: [{ name: 'Er. Arun Prakash', designation: 'Water Inspector' }] },
    { id: 'DEPT-REV', name: 'Revenue & Disaster Management Dept', code: 'REVENUE', category: 'Disaster', slaHours: 12, totalGrievances: 98, resolvedGrievances: 94, avgResolutionHours: 8.6, nodalOfficer: 'Shri. Manoj K. IAS', fieldOfficers: [{ name: 'Shri. Harikrishnan R.', designation: 'Tahsildar' }] },
    { id: 'DEPT-AGRI', name: 'Department of Agriculture & Farmers Welfare', code: 'AGRI', category: 'Agriculture', slaHours: 96, totalGrievances: 165, resolvedGrievances: 140, avgResolutionHours: 72.0, nodalOfficer: 'Smt. Lakshmi Prabha', fieldOfficers: [{ name: 'Shri. George K. V.', designation: 'Krishi Officer' }] },
    { id: 'DEPT-EDU', name: 'Department of General Education', code: 'EDU', category: 'Education', slaHours: 120, totalGrievances: 112, resolvedGrievances: 98, avgResolutionHours: 88.5, nodalOfficer: 'Dr. Anita Roy', fieldOfficers: [{ name: 'Shri. V. K. Jayaram', designation: 'AEO' }] },
    { id: 'DEPT-SOC', name: 'Department of Social Justice & Welfare', code: 'SOCIAL', category: 'Social Welfare', slaHours: 96, totalGrievances: 188, resolvedGrievances: 162, avgResolutionHours: 64.0, nodalOfficer: 'Smt. Radhika Nair', fieldOfficers: [{ name: 'Smt. Bindu Pillai', designation: 'Social Justice Officer' }] }
  ];

  // ==========================================
  // 7. GLOBAL STATE STORE & AUTHENTICATION
  // ==========================================
  class StateStore {
    constructor() {
      this.isAuthenticated = false;
      this.currentUser = null;
      this.registeredUsers = this.loadFromStorage('cap_users_v4', REGISTERED_USERS);
      this.selectedDeptFilter = 'DEPT-KSEB';
      this.currentCitizenProfile = {
        name: 'Ramesh Varma', email: 'citizen@gov.in', phone: '+91 98470 12345',
        district: 'Ernakulam', pincode: '682011', income: 120000, age: 54, occupation: 'Laborer'
      };

      this.grievances = this.loadFromStorage('cap_grievances_v4', INITIAL_GRIEVANCES);
      this.schemeApplications = this.loadFromStorage('cap_scheme_apps_v4', INITIAL_SCHEME_APPLICATIONS);
      this.departments = this.loadFromStorage('cap_departments_v4', INITIAL_DEPARTMENTS);
      this.schemes = this.loadFromStorage('cap_schemes_v4', GOVERNMENT_SCHEMES);
      this.listeners = [];
    }

    loadFromStorage(key, fallback) {
      try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
      } catch (e) { return fallback; }
    }

    saveToStorage(key, data) {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    notify() { this.listeners.forEach(fn => fn(this)); }

    // STRICT CITIZEN ONLY REGISTRATION
    registerCitizenAccount(userData) {
      const existing = this.registeredUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existing) {
        return { success: false, message: 'An account with this email address already exists! Please log in.' };
      }
      
      const citizenUser = {
        ...userData,
        role: 'citizen' // Enforce strictly citizen role
      };

      this.registeredUsers.push(citizenUser);
      this.saveToStorage('cap_users_v4', this.registeredUsers);
      return { success: true, message: 'Citizen Registration successful! You can now log in with your credentials.' };
    }

    // LOGIN VALIDATION WITH STRICT PORTAL ROLE ENFORCEMENT
    loginWithCredentials(email, password, expectedPortal = 'citizen') {
      const user = this.registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!user) {
        return { success: false, message: 'Invalid email or password! Please check your credentials or register.' };
      }

      // Enforce strict portal isolation
      if (expectedPortal === 'citizen' && user.role !== 'citizen') {
        return { success: false, message: 'Access Denied: Official Admin accounts must sign in via the Government Official Portal.' };
      }

      if (expectedPortal === 'official' && user.role === 'citizen') {
        return { success: false, message: 'Access Denied: Citizens cannot log in as Department Officials or Admins.' };
      }

      this.isAuthenticated = true;
      this.currentUser = user;

      if (user.role === 'citizen') {
        this.currentCitizenProfile = {
          name: user.name, email: user.email, phone: user.phone || '+91 98470 12345',
          district: user.district || 'Ernakulam', income: user.income || 120000, age: user.age || 40, occupation: user.occupation || 'Laborer'
        };
      } else if (user.role === 'dept_admin' && user.deptId) {
        this.selectedDeptFilter = user.deptId;
      }

      this.notify();
      return { success: true };
    }

    logout() {
      this.isAuthenticated = false;
      this.currentUser = null;
      this.notify();
    }

    setDeptFilter(deptId) { this.selectedDeptFilter = deptId; this.notify(); }
    updateCitizenProfile(p) { this.currentCitizenProfile = { ...this.currentCitizenProfile, ...p }; this.notify(); }

    addGrievance(g) {
      this.grievances = [g, ...this.grievances];
      this.saveToStorage('cap_grievances_v4', this.grievances);
      this.notify();
    }

    updateGrievanceStatus(id, newStatus, note = '', assignedOfficer = null) {
      this.grievances = this.grievances.map(g => {
        if (g.id === id || g.trackingId === id) {
          const updatedTimeline = [...(g.timeline || []), { status: newStatus, timestamp: new Date().toISOString(), note: note || `Status updated to ${newStatus}` }];
          return { ...g, status: newStatus, nodalOfficer: assignedOfficer || g.nodalOfficer, timeline: updatedTimeline };
        }
        return g;
      });
      this.saveToStorage('cap_grievances_v4', this.grievances);
      this.notify();
    }

    applyForScheme(schemeData) {
      const newApp = {
        appId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        schemeId: schemeData.id,
        schemeName: schemeData.name,
        citizenName: this.currentCitizenProfile.name,
        citizenPhone: this.currentCitizenProfile.phone,
        citizenIncome: this.currentCitizenProfile.income,
        citizenAge: this.currentCitizenProfile.age,
        citizenOccupation: this.currentCitizenProfile.occupation,
        district: this.currentCitizenProfile.district,
        requestedGrantAmount: schemeData.maxFinancialBenefit,
        attachedDocs: ['Income Certificate', 'Aadhaar Card', 'BPL Ration Card'],
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        remarks: 'New application filed by citizen.'
      };
      this.schemeApplications = [newApp, ...this.schemeApplications];
      this.saveToStorage('cap_scheme_apps_v4', this.schemeApplications);
      this.notify();
    }

    updateSchemeAppStatus(appId, newStatus, remarks = '') {
      this.schemeApplications = this.schemeApplications.map(app => {
        if (app.appId === appId) {
          return { ...app, status: newStatus, remarks: remarks || app.remarks };
        }
        return app;
      });
      this.saveToStorage('cap_scheme_apps_v4', this.schemeApplications);
      this.notify();
    }
  }

  const store = new StateStore();

  // ==========================================
  // 8. STRICT SEPARATED AUTHENTICATION SCREEN
  // ==========================================
  let activePortalTab = 'citizen'; // 'citizen' | 'official'
  let citizenAuthMode = 'login';   // 'login' | 'register'

  function renderAuthScreen(container) {
    container.innerHTML = `
      <div class="min-h-[85vh] flex items-center justify-center p-4">
        <div class="w-full max-w-xl glass-panel rounded-3xl border border-cyan-500/30 shadow-2xl p-6 sm:p-10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
          
          <!-- Header Banner -->
          <div class="text-center mb-6">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-cyan-500/25 ring-2 ring-white/20">
              <i data-lucide="shield-check" class="w-8 h-8 text-white"></i>
            </div>
            <h1 class="text-2xl font-extrabold font-heading text-white">JanSeva AI Portal</h1>
            <p class="text-xs text-slate-300 mt-1">Intelligent Public Grievance Management & Government Scheme Recommendation</p>
          </div>

          <!-- Main Entryway Selector: Citizen Portal vs Official Admin Portal -->
          <div class="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex mb-6">
            <button id="portal-tab-citizen" class="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${activePortalTab === 'citizen' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>Public Citizen Portal</span>
            </button>
            <button id="portal-tab-official" class="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${activePortalTab === 'official' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}">
              <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
              <span>Official Nodal Portal</span>
            </button>
          </div>

          <!-- Alert Feedback Box -->
          <div id="auth-alert" class="hidden mb-4 p-3 rounded-xl text-xs font-semibold"></div>

          ${activePortalTab === 'citizen' ? `
            <!-- CITIZEN PORTAL AUTHENTICATION -->
            
            <!-- Citizen Mode Switcher: Sign In vs Register Citizen -->
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
              <span class="text-slate-300 font-bold">Citizen Portal Access</span>
              <div class="flex items-center gap-2">
                <button id="cit-mode-login" class="px-3 py-1 rounded-lg text-xs font-bold transition ${citizenAuthMode === 'login' ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}">Sign In</button>
                <button id="cit-mode-register" class="px-3 py-1 rounded-lg text-xs font-bold transition ${citizenAuthMode === 'register' ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}">Register Citizen</button>
              </div>
            </div>

            ${citizenAuthMode === 'login' ? `
              <!-- CITIZEN LOGIN FORM -->
              <form id="citizen-login-form" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Citizen Email Address *</label>
                  <input type="email" id="cit-login-email" required placeholder="citizen@gov.in" class="w-full px-4 py-3 rounded-xl glass-input text-xs">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                  <input type="password" id="cit-login-password" required placeholder="••••••••" class="w-full px-4 py-3 rounded-xl glass-input text-xs">
                </div>

                <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2">
                  <i data-lucide="log-in" class="w-4 h-4"></i>
                  <span>Sign In to Citizen Services</span>
                </button>
              </form>

              <!-- Citizen Demo Quick Fill -->
              <div class="mt-6 pt-4 border-t border-slate-800 text-center">
                <button id="demo-cit-fill" class="px-4 py-2 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-slate-900">
                  👤 Click to Quick-Fill Citizen Demo Credentials (citizen@gov.in)
                </button>
              </div>

            ` : `

              <!-- CITIZEN REGISTRATION FORM (STRICTLY CITIZEN ONLY!) -->
              <form id="citizen-register-form" class="space-y-4">
                <div class="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold mb-2">
                  ℹ️ Registration is strictly for Citizens seeking welfare schemes & public grievance redressal.
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                    <input type="text" id="reg-cit-name" required placeholder="e.g. Ramesh Varma" class="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1">Phone Number *</label>
                    <input type="text" id="reg-cit-phone" required placeholder="+91 98470 12345" class="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs">
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                    <input type="email" id="reg-cit-email" required placeholder="ramesh@email.com" class="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1">Create Password *</label>
                    <input type="password" id="reg-cit-password" required placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs">
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1">District *</label>
                    <select id="reg-cit-district" class="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs bg-slate-950">
                      <option value="Ernakulam">Ernakulam</option>
                      <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                      <option value="Kozhikode">Kozhikode</option>
                      <option value="Kottayam">Kottayam</option>
                      <option value="Palakkad">Palakkad</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1">Annual Household Income (₹)</label>
                    <input type="number" id="reg-cit-income" value="120000" step="10000" class="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-bold text-cyan-400">
                  </div>
                </div>

                <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2">
                  <i data-lucide="user-plus" class="w-4 h-4"></i>
                  <span>Register Citizen Account</span>
                </button>
              </form>
            `}

          ` : `

            <!-- OFFICIAL GOVERNMENT NODAL PORTAL (DEPT ADMINS & SUPER ADMIN ONLY) -->
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-4">
              🔒 Restricted Access: Dedicated to authorized Department Nodal Officers & System Administrators.
            </div>

            <form id="official-login-form" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Official Nodal Email Address *</label>
                <input type="email" id="off-login-email" required placeholder="kseb.admin@gov.in" class="w-full px-4 py-3 rounded-xl glass-input text-xs border-amber-500/30">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Official Security Password *</label>
                <input type="password" id="off-login-password" required placeholder="••••••••" class="w-full px-4 py-3 rounded-xl glass-input text-xs">
              </div>

              <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2">
                <i data-lucide="lock" class="w-4 h-4"></i>
                <span>Sign In to Nodal Control Desk</span>
              </button>
            </form>

            <!-- Official Quick-Fill Demo Buttons -->
            <div class="mt-6 pt-4 border-t border-slate-800 space-y-2 text-center text-xs">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Quick-Fill Demo Credentials:</span>
              <div class="grid grid-cols-2 gap-2 text-[10px]">
                <button id="demo-kseb-fill" class="p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-300 hover:bg-slate-900 text-left">
                  ⚡ KSEB Officer<br><span class="text-slate-400 text-[9px]">kseb.admin@gov.in</span>
                </button>
                <button id="demo-super-fill" class="p-2 rounded-xl bg-slate-950 border border-indigo-500/30 text-indigo-300 hover:bg-slate-900 text-left">
                  🛡️ Super Admin<br><span class="text-slate-400 text-[9px]">superadmin@gov.in</span>
                </button>
              </div>
            </div>
          `}

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Portal Switcher Listeners
    document.getElementById('portal-tab-citizen')?.addEventListener('click', () => {
      activePortalTab = 'citizen';
      renderAuthScreen(container);
    });

    document.getElementById('portal-tab-official')?.addEventListener('click', () => {
      activePortalTab = 'official';
      renderAuthScreen(container);
    });

    const alertBox = document.getElementById('auth-alert');

    // Citizen Mode Listeners
    document.getElementById('cit-mode-login')?.addEventListener('click', () => {
      citizenAuthMode = 'login';
      renderAuthScreen(container);
    });

    document.getElementById('cit-mode-register')?.addEventListener('click', () => {
      citizenAuthMode = 'register';
      renderAuthScreen(container);
    });

    // Citizen Login Submit
    document.getElementById('citizen-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('cit-login-email').value;
      const pass = document.getElementById('cit-login-password').value;

      const res = store.loginWithCredentials(email, pass, 'citizen');
      if (!res.success) {
        alertBox.classList.remove('hidden', 'bg-emerald-500/20', 'text-emerald-300');
        alertBox.classList.add('bg-rose-500/20', 'text-rose-300', 'border', 'border-rose-500/30');
        alertBox.innerText = res.message;
      }
    });

    // Citizen Demo Fill
    document.getElementById('demo-cit-fill')?.addEventListener('click', () => {
      document.getElementById('cit-login-email').value = 'citizen@gov.in';
      document.getElementById('cit-login-password').value = 'password123';
    });

    // Citizen Register Submit (STRICTLY CITIZENS ONLY)
    document.getElementById('citizen-register-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-cit-name').value;
      const phone = document.getElementById('reg-cit-phone').value;
      const email = document.getElementById('reg-cit-email').value;
      const password = document.getElementById('reg-cit-password').value;
      const district = document.getElementById('reg-cit-district').value;
      const income = Number(document.getElementById('reg-cit-income').value) || 120000;

      const res = store.registerCitizenAccount({ name, phone, email, password, district, income });

      alertBox.classList.remove('hidden');
      if (res.success) {
        alertBox.classList.remove('bg-rose-500/20', 'text-rose-300');
        alertBox.classList.add('bg-emerald-500/20', 'text-emerald-300', 'border', 'border-emerald-500/30');
        alertBox.innerText = res.message;
        setTimeout(() => {
          citizenAuthMode = 'login';
          renderAuthScreen(container);
        }, 1500);
      } else {
        alertBox.classList.remove('bg-emerald-500/20', 'text-emerald-300');
        alertBox.classList.add('bg-rose-500/20', 'text-rose-300', 'border', 'border-rose-500/30');
        alertBox.innerText = res.message;
      }
    });

    // Official Login Submit
    document.getElementById('official-login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('off-login-email').value;
      const pass = document.getElementById('off-login-password').value;

      const res = store.loginWithCredentials(email, pass, 'official');
      if (!res.success) {
        alertBox.classList.remove('hidden', 'bg-emerald-500/20', 'text-emerald-300');
        alertBox.classList.add('bg-rose-500/20', 'text-rose-300', 'border', 'border-rose-500/30');
        alertBox.innerText = res.message;
      }
    });

    // Official Demo Fills
    document.getElementById('demo-kseb-fill')?.addEventListener('click', () => {
      document.getElementById('off-login-email').value = 'kseb.admin@gov.in';
      document.getElementById('off-login-password').value = 'password123';
    });

    document.getElementById('demo-super-fill')?.addEventListener('click', () => {
      document.getElementById('off-login-email').value = 'superadmin@gov.in';
      document.getElementById('off-login-password').value = 'password123';
    });
  }

  // ==========================================
  // 9. HEADER WITH LOGOUT & ACCOUNT INFO
  // ==========================================
  function renderHeader(container) {
    const { currentUser } = store;

    container.innerHTML = `
      <header class="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <i data-lucide="shield-check" class="w-5 h-5 text-white"></i>
            </div>
            <div>
              <h1 class="text-lg font-extrabold font-heading text-white">JanSeva AI</h1>
              <p class="text-[10px] text-slate-400 font-medium">Logged in: <strong class="text-cyan-300">${currentUser ? currentUser.name : ''}</strong> (${currentUser ? currentUser.role.toUpperCase() : ''})</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button id="logout-btn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 border border-slate-700">
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
              <span>Log out</span>
            </button>
          </div>

        </div>
      </header>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => store.logout());
    if (window.lucide) window.lucide.createIcons();
  }

  // ==========================================
  // 10. CITIZEN PORTAL (2 SECTIONS)
  // ==========================================
  let activeCitizenSection = 'schemes';

  function renderCitizenPortal(container) {
    const profile = store.currentCitizenProfile;
    const grievances = store.grievances;
    const schemeApps = store.schemeApplications;

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 shadow-2xl">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span class="px-3 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Citizen Service Portal</span>
              <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">Welcome, ${profile.name}</h2>
              <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">Select a section below to check government scheme eligibility or submit public grievances.</p>
            </div>

            <div class="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
              <button id="nav-sec-schemes" class="px-5 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${activeCitizenSection === 'schemes' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}">
                <i data-lucide="gift" class="w-4 h-4"></i>
                <span>Section 1: Scheme Checker (${schemeApps.length} Apps)</span>
              </button>

              <button id="nav-sec-grievance" class="px-5 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${activeCitizenSection === 'grievance' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Section 2: Grievances (${grievances.length})</span>
              </button>
            </div>
          </div>
        </div>

        <div id="citizen-section-content"></div>
      </div>
    `;

    document.getElementById('nav-sec-schemes').addEventListener('click', () => {
      activeCitizenSection = 'schemes';
      renderCitizenPortal(container);
    });

    document.getElementById('nav-sec-grievance').addEventListener('click', () => {
      activeCitizenSection = 'grievance';
      renderCitizenPortal(container);
    });

    const contentMount = document.getElementById('citizen-section-content');
    if (activeCitizenSection === 'schemes') {
      renderCitizenSchemesSection(contentMount);
    } else {
      renderCitizenGrievanceSection(contentMount, container);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function renderCitizenSchemesSection(container) {
    const profile = store.currentCitizenProfile;
    const recommended = recommendSchemes(profile);
    const myApps = store.schemeApplications;

    container.innerHTML = `
      <div class="space-y-8">
        <div class="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <i data-lucide="sliders" class="w-4 h-4 text-cyan-400"></i>
            Eligibility Demographic Profile
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label class="text-[10px] text-slate-400 block mb-1">Annual Income (₹)</label>
              <input type="number" id="sc-income" value="${profile.income}" step="10000" class="w-full px-3 py-2 rounded-xl glass-input font-bold text-cyan-400">
            </div>
            <div>
              <label class="text-[10px] text-slate-400 block mb-1">Age (Years)</label>
              <input type="number" id="sc-age" value="${profile.age}" class="w-full px-3 py-2 rounded-xl glass-input font-bold">
            </div>
            <div>
              <label class="text-[10px] text-slate-400 block mb-1">Occupation</label>
              <select id="sc-occ" class="w-full px-3 py-2 rounded-xl glass-input bg-slate-950">
                <option value="Farmer" ${profile.occupation === 'Farmer' ? 'selected' : ''}>Farmer</option>
                <option value="Laborer" ${profile.occupation === 'Laborer' ? 'selected' : ''}>Manual Laborer</option>
                <option value="Student" ${profile.occupation === 'Student' ? 'selected' : ''}>Student</option>
                <option value="Unemployed" ${profile.occupation === 'Unemployed' ? 'selected' : ''}>Unemployed / Senior</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] text-slate-400 block mb-1">District</label>
              <input type="text" value="${profile.district}" readonly class="w-full px-3 py-2 rounded-xl glass-input opacity-70">
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Recommended Welfare Schemes</span>
            <span class="text-xs text-cyan-400 normal-case">Sorted by Match Score</span>
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${recommended.map(scheme => `
              <div class="glass-card p-6 rounded-3xl flex flex-col justify-between border ${scheme.isEligible ? 'border-emerald-500/30' : 'border-slate-800'}">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${scheme.isEligible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}">
                      ${scheme.isEligible ? 'Eligible Beneficiary' : 'Check Criteria'}
                    </span>
                    <span class="text-xs font-extrabold text-cyan-400">${scheme.matchScore}% Match</span>
                  </div>

                  <h5 class="text-base font-extrabold text-white mb-1 leading-snug">${scheme.name}</h5>
                  <p class="text-xs text-slate-300 mb-3">${scheme.description}</p>
                  
                  <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 mb-4 text-xs">
                    <span class="text-[10px] text-slate-400 block">Financial Benefit:</span>
                    <strong class="text-emerald-400 font-bold">${scheme.maxFinancialBenefit}</strong>
                  </div>
                </div>

                <button id="apply-scheme-btn-${scheme.id}" class="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5">
                  <i data-lucide="send" class="w-3.5 h-3.5"></i>
                  <span>Submit Scheme Application</span>
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="glass-panel p-6 rounded-3xl border border-slate-800">
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <i data-lucide="file-check-2" class="w-4 h-4 text-emerald-400"></i>
            My Submitted Scheme Applications (${myApps.length})
          </h4>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950 text-slate-400 uppercase text-[9px] border-b border-slate-800">
                <tr>
                  <th class="p-3">Application ID</th>
                  <th class="p-3">Scheme Name</th>
                  <th class="p-3">Benefit Amount</th>
                  <th class="p-3">Date Submitted</th>
                  <th class="p-3">Verification Status</th>
                  <th class="p-3">Official Remarks</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${myApps.map(app => `
                  <tr class="hover:bg-slate-900/60">
                    <td class="p-3 font-mono font-bold text-cyan-400">#${app.appId}</td>
                    <td class="p-3 font-bold text-white">${app.schemeName}</td>
                    <td class="p-3 font-bold text-emerald-400">${app.requestedGrantAmount}</td>
                    <td class="p-3 text-slate-400">${new Date(app.submittedAt).toLocaleDateString()}</td>
                    <td class="p-3">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : app.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">
                        ${app.status}
                      </span>
                    </td>
                    <td class="p-3 text-slate-300">${app.remarks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    document.getElementById('sc-income').addEventListener('change', (e) => {
      store.updateCitizenProfile({ income: Number(e.target.value) });
      renderCitizenSchemesSection(container);
    });

    recommended.forEach(s => {
      document.getElementById(`apply-scheme-btn-${s.id}`)?.addEventListener('click', () => {
        store.applyForScheme(s);
        alert(`Application for ${s.name} submitted successfully!`);
        renderCitizenSchemesSection(container);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function renderCitizenGrievanceSection(container, mainPortalContainer) {
    const profile = store.currentCitizenProfile;
    const grievances = store.grievances;

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="edit-3" class="w-5 h-5 text-cyan-400"></i> Public Grievance Application Wizard
            </h3>
            <span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full">Real-time NLP</span>
          </div>

          <form id="grv-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Complaint Subject / Title *</label>
              <input type="text" id="g-title" required placeholder="e.g. Severe power outage and sparking transformer near school" class="w-full px-4 py-3 rounded-xl glass-input text-xs">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Detailed Description *</label>
              <textarea id="g-desc" rows="5" required placeholder="Provide location, hazard description, and urgency..." class="w-full px-4 py-3 rounded-xl glass-input text-xs leading-relaxed"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Affected People Count</label>
                <input type="number" id="g-affected" value="15" min="1" class="w-full px-4 py-2.5 rounded-xl glass-input text-xs">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">District</label>
                <select id="g-district" class="w-full px-4 py-2.5 rounded-xl glass-input text-xs bg-slate-950">
                  <option value="Ernakulam">Ernakulam</option>
                  <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                  <option value="Kozhikode">Kozhikode</option>
                  <option value="Kottayam">Kottayam</option>
                </select>
              </div>
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-extrabold text-xs shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2">
              <i data-lucide="send" class="w-4 h-4"></i> Submit Grievance
            </button>
          </form>
        </div>

        <div class="lg:col-span-5 glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950">
          <div class="pb-3 border-b border-slate-800 mb-4 flex justify-between items-center">
            <h4 class="text-xs font-extrabold text-white">AI Classification Live Preview</h4>
            <span class="text-[9px] font-mono bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">NLP Engine</span>
          </div>
          <div id="ai-live-box" class="text-xs space-y-3">
            <p class="text-slate-400 text-center py-12">Start typing your complaint to see instant AI category, priority score, and department routing.</p>
          </div>
        </div>
      </div>

      <div class="glass-panel p-6 rounded-3xl border border-slate-800 mt-8">
        <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4">My Filed Grievance Applications (${grievances.length})</h4>
        <div class="space-y-4">
          ${grievances.map(g => `
            <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div class="flex justify-between items-center text-xs mb-1">
                <span class="font-mono text-cyan-400 font-bold">#${g.trackingId}</span>
                <span class="px-2.5 py-0.5 rounded-full font-bold ${g.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">${g.priority} Priority (${g.priorityScore}/100)</span>
              </div>
              <h5 class="text-sm font-bold text-white">${g.title}</h5>
              <div class="flex justify-between items-center text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
                <span>Dept: <strong class="text-white">${g.departmentName}</strong></span>
                <span>Status: <strong class="text-cyan-300">${g.status}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const titleEl = document.getElementById('g-title');
    const descEl = document.getElementById('g-desc');
    const affectedEl = document.getElementById('g-affected');
    const aiBox = document.getElementById('ai-live-box');

    const updateAi = () => {
      const text = `${titleEl.value} ${descEl.value}`.trim();
      if (text.length < 4) return;

      const classification = classifyGrievance(text);
      const priorityData = predictPriority({ complaintText: text, category: classification.category, subcategory: classification.subcategory, affectedPeople: Number(affectedEl.value) || 1 });
      const deptInfo = routeToDepartment(classification.category);

      aiBox.innerHTML = `
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span class="text-[9px] text-slate-400 block font-semibold">Category</span>
          <strong class="text-cyan-300">${classification.category} &rarr; ${classification.subcategory}</strong>
        </div>
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span class="text-[9px] text-slate-400 block font-semibold">Priority</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityData.badgeColor}">${priorityData.priority.toUpperCase()} (${priorityData.score}/100)</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span class="text-[9px] text-slate-400 block font-semibold">Department</span>
          <strong class="text-white">${deptInfo.name}</strong>
        </div>
      `;
    };

    titleEl.addEventListener('input', updateAi);
    descEl.addEventListener('input', updateAi);

    document.getElementById('grv-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fullText = `${titleEl.value} ${descEl.value}`;
      const classification = classifyGrievance(fullText);
      const priorityData = predictPriority({ complaintText: fullText, category: classification.category, subcategory: classification.subcategory, affectedPeople: Number(affectedEl.value) || 1 });
      const deptInfo = routeToDepartment(classification.category);

      const newGrievance = {
        id: `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        trackingId: `KL-${Math.floor(1000 + Math.random() * 9000)}-${classification.category.slice(0,3).toUpperCase()}`,
        citizenName: profile.name, citizenPhone: profile.phone, citizenEmail: profile.email, citizenDistrict: document.getElementById('g-district').value,
        title: titleEl.value, description: descEl.value, category: classification.category, subcategory: classification.subcategory,
        priority: priorityData.priority, priorityScore: priorityData.score, affectedPeople: Number(affectedEl.value) || 1,
        departmentId: deptInfo.departmentId, departmentName: deptInfo.name, nodalOfficer: deptInfo.nodalOfficer, status: 'Submitted',
        submittedAt: new Date().toISOString(),
        timeline: [{ status: 'Submitted', timestamp: new Date().toISOString(), note: 'Grievance submitted by citizen.' }]
      };

      store.addGrievance(newGrievance);
      renderCitizenPortal(mainPortalContainer);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // ==========================================
  // 11. DEPARTMENT ADMIN PORTAL
  // ==========================================
  let activeAdminTab = 'grievances';

  function renderDepartmentPortal(container) {
    const { selectedDeptFilter, departments, grievances, schemeApplications } = store;
    const activeDept = departments.find(d => d.id === selectedDeptFilter) || departments[0];

    const deptGrievances = grievances.filter(g => g.departmentId === activeDept.id || g.category === activeDept.category);
    const sortedQueue = [...deptGrievances].sort((a, b) => b.priorityScore - a.priorityScore);

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-900 to-amber-950/30">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Department Admin Control Center</span>
              <h2 class="text-2xl font-extrabold text-white mt-1">${activeDept.name}</h2>
              <p class="text-xs text-slate-300">Nodal Officer: <strong class="text-amber-300">${activeDept.nodalOfficer}</strong></p>
            </div>

            <div>
              <label class="text-[10px] font-bold text-slate-400 block mb-1">Switch Active Department View</label>
              <select id="dept-selector" class="px-4 py-2.5 rounded-xl glass-input text-xs font-bold text-amber-300 bg-slate-950 border-amber-500/30">
                ${departments.map(d => `<option value="${d.id}" ${d.id === activeDept.id ? 'selected' : ''}>${d.name} (${d.code})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3 mt-6 pt-6 border-t border-slate-800">
            <button id="admin-tab-grievance" class="px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${activeAdminTab === 'grievances' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-300'}">
              <i data-lucide="list-ordered" class="w-4 h-4"></i>
              <span>1. AI-Prioritized Grievance Queue (${sortedQueue.length})</span>
            </button>

            <button id="admin-tab-schemes" class="px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${activeAdminTab === 'schemes' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-300'}">
              <i data-lucide="file-check-2" class="w-4 h-4"></i>
              <span>2. Submitted Scheme Applications (${schemeApplications.length})</span>
            </button>
          </div>
        </div>

        <div id="admin-tab-content"></div>
      </div>
    `;

    document.getElementById('dept-selector').addEventListener('change', (e) => {
      store.setDeptFilter(e.target.value);
      renderDepartmentPortal(container);
    });

    document.getElementById('admin-tab-grievance').addEventListener('click', () => {
      activeAdminTab = 'grievances';
      renderDepartmentPortal(container);
    });

    document.getElementById('admin-tab-schemes').addEventListener('click', () => {
      activeAdminTab = 'schemes';
      renderDepartmentPortal(container);
    });

    const tabMount = document.getElementById('admin-tab-content');
    if (activeAdminTab === 'grievances') {
      renderAdminGrievanceQueue(tabMount, sortedQueue, activeDept, container);
    } else {
      renderAdminSchemeApplications(tabMount, schemeApplications, container);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function renderAdminGrievanceQueue(container, sortedQueue, activeDept, mainPortalContainer) {
    container.innerHTML = `
      <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div class="p-4 border-b border-slate-800 font-bold text-white text-sm">AI Priority-Sorted Public Complaints Queue</div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950 text-slate-400 uppercase text-[9px] border-b border-slate-800">
              <tr>
                <th class="p-3">Priority Score</th>
                <th class="p-3">Tracking ID & Subject</th>
                <th class="p-3">Subcategory</th>
                <th class="p-3">Citizen & District</th>
                <th class="p-3">Current Status</th>
                <th class="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${sortedQueue.length === 0 ? `
                <tr><td colspan="6" class="p-8 text-center text-slate-500">No grievances assigned to this department.</td></tr>
              ` : sortedQueue.map(g => `
                <tr class="hover:bg-slate-900/60">
                  <td class="p-3">
                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${g.priority === 'Critical' ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950'}">
                      ${g.priority.toUpperCase()} (${g.priorityScore})
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="text-cyan-400 font-mono font-bold text-[10px] block">#${g.trackingId}</span>
                    <span class="font-bold text-white">${g.title}</span>
                  </td>
                  <td class="p-3"><span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">${g.subcategory}</span></td>
                  <td class="p-3">${g.citizenName} (${g.citizenDistrict})</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">${g.status}</span></td>
                  <td class="p-3 text-right">
                    <button id="dept-action-btn-${g.id}" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">Manage & Action</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div id="dept-modal-mount"></div>
    `;

    sortedQueue.forEach(g => {
      document.getElementById(`dept-action-btn-${g.id}`)?.addEventListener('click', () => {
        openDeptActionModal(g, activeDept, mainPortalContainer);
      });
    });
  }

  function openDeptActionModal(grievance, activeDept, mainContainer) {
    const mount = document.getElementById('dept-modal-mount');
    mount.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div class="glass-panel w-full max-w-xl p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white">Action Complaint #${grievance.trackingId}</h4>
            <button id="close-modal" class="text-slate-400">✕</button>
          </div>

          <form id="dept-form" class="space-y-3 text-xs">
            <div>
              <label class="block mb-1 text-slate-300 font-semibold">Workflow Status Stage</label>
              <select id="mod-status" class="w-full p-2.5 rounded-xl glass-input bg-slate-950">
                <option value="In Review">In Review</option>
                <option value="Field Inspection">Field Inspection Dispatched</option>
                <option value="In Progress">Work In Progress</option>
                <option value="Resolved">Resolved & Closed</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 text-slate-300 font-semibold">Assign Field Officer</label>
              <select id="mod-officer" class="w-full p-2.5 rounded-xl glass-input bg-slate-950">
                ${activeDept.fieldOfficers.map(off => `<option value="${off.name} (${off.designation})">${off.name} — ${off.designation}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block mb-1 text-slate-300 font-semibold">Action Remarks Log</label>
              <textarea id="mod-note" required rows="3" class="w-full p-2.5 rounded-xl glass-input" placeholder="Enter work order reference or inspection details..."></textarea>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">Save Resolution Action</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('close-modal').onclick = () => mount.innerHTML = '';
    document.getElementById('dept-form').onsubmit = (e) => {
      e.preventDefault();
      store.updateGrievanceStatus(grievance.id, document.getElementById('mod-status').value, document.getElementById('mod-note').value, document.getElementById('mod-officer').value);
      mount.innerHTML = '';
      renderDepartmentPortal(mainContainer);
    };
  }

  function renderAdminSchemeApplications(container, schemeApps, mainPortalContainer) {
    container.innerHTML = `
      <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div class="p-4 border-b border-slate-800 font-bold text-white text-sm flex items-center justify-between">
          <span>Submitted Citizen Scheme Welfare Applications</span>
          <span class="text-xs text-amber-400">Action & Verification Desk</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950 text-slate-400 uppercase text-[9px] border-b border-slate-800">
              <tr>
                <th class="p-3">App ID</th>
                <th class="p-3">Scheme Name</th>
                <th class="p-3">Citizen Name & Income</th>
                <th class="p-3">Requested Benefit</th>
                <th class="p-3">Attached Documents</th>
                <th class="p-3">Verification Status</th>
                <th class="p-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${schemeApps.length === 0 ? `
                <tr><td colspan="7" class="p-8 text-center text-slate-500">No scheme applications pending verification.</td></tr>
              ` : schemeApps.map(app => `
                <tr class="hover:bg-slate-900/60">
                  <td class="p-3 font-mono font-bold text-cyan-400">#${app.appId}</td>
                  <td class="p-3 font-bold text-white">${app.schemeName}</td>
                  <td class="p-3">
                    <span class="font-bold text-slate-200 block">${app.citizenName}</span>
                    <span class="text-[10px] text-emerald-400">Income: ₹${app.citizenIncome.toLocaleString()} (${app.district})</span>
                  </td>
                  <td class="p-3 font-bold text-amber-300">${app.requestedGrantAmount}</td>
                  <td class="p-3 text-[10px] text-slate-300">${app.attachedDocs.join(', ')}</td>
                  <td class="p-3">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : app.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">
                      ${app.status}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <button id="scheme-act-btn-${app.appId}" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">Verify & Action</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div id="scheme-modal-mount"></div>
    `;

    schemeApps.forEach(app => {
      document.getElementById(`scheme-act-btn-${app.appId}`)?.addEventListener('click', () => {
        openSchemeVerificationModal(app, mainPortalContainer);
      });
    });
  }

  function openSchemeVerificationModal(app, mainContainer) {
    const mount = document.getElementById('scheme-modal-mount');
    mount.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div class="glass-panel w-full max-w-xl p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 class="text-sm font-bold text-white">Verify Application #${app.appId}</h4>
            <button id="close-sc-modal" class="text-slate-400">✕</button>
          </div>

          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <p>Citizen: <strong class="text-white">${app.citizenName}</strong> | Income: <strong class="text-emerald-400">₹${app.citizenIncome.toLocaleString()}</strong></p>
            <p>Scheme: <strong class="text-amber-300">${app.schemeName}</strong></p>
          </div>

          <form id="sc-form" class="space-y-3 text-xs">
            <div>
              <label class="block mb-1 text-slate-300 font-semibold">Verification Action Decision</label>
              <select id="sc-status" class="w-full p-2.5 rounded-xl glass-input bg-slate-950">
                <option value="Approved">Approved & Sanctioned</option>
                <option value="Under Verification">Under Verification (Request Documents)</option>
                <option value="Rejected">Rejected (Ineligible Income/Age)</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 text-slate-300 font-semibold">Official Verification Remarks</label>
              <textarea id="sc-remarks" required rows="3" class="w-full p-2.5 rounded-xl glass-input" placeholder="Enter sanction order reference or verification notes..."></textarea>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">Save Sanction Decision</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('close-sc-modal').onclick = () => mount.innerHTML = '';
    document.getElementById('sc-form').onsubmit = (e) => {
      e.preventDefault();
      store.updateSchemeAppStatus(app.appId, document.getElementById('sc-status').value, document.getElementById('sc-remarks').value);
      mount.innerHTML = '';
      renderDepartmentPortal(mainContainer);
    };
  }

  // ==========================================
  // 12. SUPER ADMIN PORTAL RENDERER
  // ==========================================
  function renderSuperAdminPortal(container) {
    const { departments, grievances } = store;

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div class="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 to-indigo-950/30">
          <h2 class="text-2xl font-extrabold text-white">Super Admin Governance & Analytics</h2>
          <p class="text-xs text-slate-300 mt-1">Platform monitoring and department SLA compliance.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="glass-panel p-6 rounded-3xl border border-slate-800">
            <h4 class="text-sm font-bold text-white mb-3">Category Volume Breakdown</h4>
            <div class="h-64 relative flex items-center justify-center"><canvas id="c-doughnut"></canvas></div>
          </div>
          <div class="glass-panel p-6 rounded-3xl border border-slate-800">
            <h4 class="text-sm font-bold text-white mb-3">Department SLA Performance Leaderboard</h4>
            <div class="h-64 relative"><canvas id="c-bar"></canvas></div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      if (!window.Chart) return;
      const counts = {};
      grievances.forEach(g => counts[g.category] = (counts[g.category] || 0) + 1);

      const dCtx = document.getElementById('c-doughnut');
      if (dCtx) {
        new window.Chart(dCtx, {
          type: 'doughnut',
          data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#06b6d4', '#059669', '#d97706', '#e11d48', '#8b5cf6', '#3b82f6'] }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#cbd5e1', font: { size: 10 } } } } }
        });
      }

      const bCtx = document.getElementById('c-bar');
      if (bCtx) {
        new window.Chart(bCtx, {
          type: 'bar',
          data: { labels: departments.map(d => d.code), datasets: [{ label: 'Total Grievances', data: departments.map(d => d.totalGrievances), backgroundColor: '#3b82f6' }, { label: 'Resolved', data: departments.map(d => d.resolvedGrievances), backgroundColor: '#10b981' }] },
          options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
        });
      }
    }, 100);

    if (window.lucide) window.lucide.createIcons();
  }

  // ==========================================
  // 13. MAIN APP BOOTSTRAPPER WITH AUTH ROUTING
  // ==========================================
  function initApp() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    function render() {
      const { isAuthenticated, currentUser } = store;

      if (!isAuthenticated || !currentUser) {
        appContainer.innerHTML = `<main id="portal-mount" class="flex-1 gradient-bg-main min-h-screen"></main>`;
        renderAuthScreen(document.getElementById('portal-mount'));
        return;
      }

      appContainer.innerHTML = `
        <div id="header-mount"></div>
        <main id="portal-mount" class="flex-1 gradient-bg-main min-h-[calc(100vh-120px)]"></main>
        <footer class="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
          JanSeva AI — Intelligent Public Grievance Management & Government Scheme Recommendation
        </footer>
      `;

      renderHeader(document.getElementById('header-mount'));
      const mount = document.getElementById('portal-mount');

      if (currentUser.role === 'citizen') {
        renderCitizenPortal(mount);
      } else if (currentUser.role === 'dept_admin') {
        renderDepartmentPortal(mount);
      } else if (currentUser.role === 'super_admin') {
        renderSuperAdminPortal(mount);
      }
    }

    store.subscribe(render);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
