/**
 * AI Category & Subcategory Classification Engine
 * Uses weighted TF-IDF keyword vector matching & rule-based scoring
 */

import { preprocessText } from './nlpProcessor.js';

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
    weight: 1.2, // Higher sensitivity for disaster complaints
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

/**
 * Classify a grievance into a primary category and subcategory with confidence score
 * @param {string} complaintText 
 * @returns {Object} { category, subcategory, confidence, scoreBreakdown }
 */
export function classifyGrievance(complaintText) {
  const { lemmas, keywords } = preprocessText(complaintText);
  
  if (!keywords || keywords.length === 0) {
    return {
      category: 'Infrastructure',
      subcategory: 'Roads & Potholes',
      confidence: 0.35,
      keywords: []
    };
  }

  const categoryScores = {};
  const subcategoryScores = {};

  // Evaluate vocabulary matches
  Object.entries(CATEGORY_VOCABULARY).forEach(([catName, catData]) => {
    let catScore = 0;
    let maxSubScore = 0;
    let bestSub = Object.keys(catData.subcategories)[0];

    Object.entries(catData.subcategories).forEach(([subName, subKeywords]) => {
      let subScore = 0;
      subKeywords.forEach(kw => {
        // Direct match
        if (lemmas.includes(kw) || complaintText.toLowerCase().includes(kw)) {
          subScore += 3;
        }
        // Substring / fuzzy match
        lemmas.forEach(lemma => {
          if (lemma.includes(kw) || kw.includes(lemma)) {
            subScore += 1.5;
          }
        });
      });

      if (subScore > maxSubScore) {
        maxSubScore = subScore;
        bestSub = subName;
      }
      catScore += subScore;
    });

    // Apply category multiplier
    catScore *= catData.weight;

    categoryScores[catName] = catScore;
    subcategoryScores[catName] = { subcategory: bestSub, score: maxSubScore };
  });

  // Find top category
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

  return {
    category: topCategory,
    subcategory: bestSubcategory,
    confidence: Number(confidence.toFixed(2)),
    matchedKeywords: keywords.slice(0, 6)
  };
}
