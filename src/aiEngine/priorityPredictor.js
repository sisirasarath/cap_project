/**
 * AI Priority & Urgency Prediction Engine
 * Computes multi-factor risk score considering:
 * - Severity keywords
 * - Public safety & health threat
 * - Affected population count
 * - Sentiment & urgency tone
 * - Category weighting
 */

import { preprocessText } from './nlpProcessor.js';

// High-severity risk vocabulary
const CRITICAL_KEYWORDS = [
  'dying', 'death', 'casualty', 'electrocution', 'sparking', 'collapse', 'collapsed',
  'blood', 'fire', 'explosion', 'landslide', 'submerged', 'hospitalized', 'icu', 'heart attack',
  'contaminating', 'poisonous', 'bleeding', 'toxic', 'trauma', 'emergency'
];

const HIGH_KEYWORDS = [
  'blocked', 'broken', 'no water', 'power cut', 'outage', 'flood', 'overflowing',
  'hazard', 'dangerous', 'severe', 'urgent', 'disability', 'pension delay', 'crop loss'
];

/**
 * Predict complaint priority and compute numeric severity score (0-100)
 * @param {Object} params { complaintText, category, subcategory, affectedPeople, isDuplicate }
 * @returns {Object} { priority, score, factorsBreakdown }
 */
export function predictPriority({ complaintText, category, subcategory, affectedPeople = 1, isDuplicate = false }) {
  const { lemmas, sentimentScore } = preprocessText(complaintText);
  let totalScore = 20; // Base score

  // 1. Severity Keyword Match
  let keywordScore = 0;
  lemmas.forEach(word => {
    if (CRITICAL_KEYWORDS.includes(word)) {
      keywordScore += 25;
    } else if (HIGH_KEYWORDS.includes(word)) {
      keywordScore += 12;
    }
  });
  keywordScore = Math.min(40, keywordScore);
  totalScore += keywordScore;

  // 2. Category Sensitivity Multiplier
  let categoryWeight = 0;
  if (category === 'Disaster' || category === 'Medical') {
    categoryWeight = 25;
  } else if (category === 'Electricity' || category === 'Water Supply') {
    categoryWeight = 18;
  } else if (category === 'Infrastructure' || category === 'Agriculture') {
    categoryWeight = 12;
  } else {
    categoryWeight = 8;
  }
  totalScore += categoryWeight;

  // 3. Affected Population Count Impact
  let countWeight = 0;
  const count = Number(affectedPeople) || 1;
  if (count > 500) {
    countWeight = 20;
  } else if (count > 100) {
    countWeight = 15;
  } else if (count > 20) {
    countWeight = 10;
  } else if (count > 5) {
    countWeight = 5;
  }
  totalScore += countWeight;

  // 4. Sentiment / Urgency Multiplier
  const sentimentWeight = Math.round(sentimentScore * 15);
  totalScore += sentimentWeight;

  // 5. Duplicate Complaint Escalation
  if (isDuplicate) {
    totalScore += 10;
  }

  // Bound total score between 0 and 100
  totalScore = Math.min(100, Math.max(10, Math.round(totalScore)));

  // Output Priority Level
  let priority = 'Low';
  let badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';

  if (totalScore >= 80) {
    priority = 'Critical';
    badgeColor = 'bg-red-600 text-white border-red-700 animate-pulse';
  } else if (totalScore >= 60) {
    priority = 'High';
    badgeColor = 'bg-amber-500 text-white border-amber-600';
  } else if (totalScore >= 40) {
    priority = 'Medium';
    badgeColor = 'bg-emerald-600 text-white border-emerald-700';
  } else {
    priority = 'Low';
    badgeColor = 'bg-slate-200 text-slate-700 border-slate-300';
  }

  return {
    priority,
    score: totalScore,
    badgeColor,
    factorsBreakdown: {
      keywordScore,
      categoryWeight,
      countWeight,
      sentimentWeight,
      duplicateBonus: isDuplicate ? 10 : 0
    }
  };
}
