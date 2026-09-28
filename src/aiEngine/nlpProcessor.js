/**
 * NLP Preprocessing Engine
 * Provides Tokenization, Stop-word removal, Lemmatization simulation,
 * Severity Keyword Extraction, and Sentiment Scoring.
 */

// Common English & Malayalam-English stopwords
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

// Basic Lemmatization Dictionary mapping plurals and verb forms to roots
const LEMMA_DICT = {
  'roads': 'road',
  'potholes': 'pothole',
  'leaks': 'leak',
  'leaking': 'leak',
  'leakage': 'leak',
  'broken': 'break',
  'damages': 'damage',
  'damaged': 'damage',
  'floods': 'flood',
  'flooded': 'flood',
  'flooding': 'flood',
  'hospitals': 'hospital',
  'surgeries': 'surgery',
  'transplants': 'transplant',
  'outages': 'outage',
  'transformers': 'transformer',
  'lines': 'line',
  'wires': 'wire',
  'drains': 'drain',
  'drainages': 'drainage',
  'blocked': 'block',
  'blocking': 'block',
  'blockage': 'block',
  'accidents': 'accident',
  'emergency': 'emergency',
  'emergencies': 'emergency',
  'schools': 'school',
  'teachers': 'teacher',
  'scholarships': 'scholarship',
  'pensions': 'pension'
};

// Sentiment analysis dictionary
const NEGATIVE_VALENCE_KEYWORDS = [
  'terrible', 'worst', 'danger', 'dangerous', 'life-threatening', 'collapsed', 'urgent',
  'critical', 'hazard', 'hazardous', 'dying', 'death', 'casualty', 'severe', 'horrible',
  'unusable', 'overflowing', 'toxic', 'electrocution', 'sparking', 'destroyed', 'blocked'
];

/**
 * Preprocess complaint text through NLP pipeline
 * @param {string} text 
 * @returns {Object} Processed tokens, lemmas, clean text, and extracted metadata
 */
export function preprocessText(text) {
  if (!text || typeof text !== 'string') {
    return { cleanText: '', tokens: [], lemmas: [], keywords: [], sentimentScore: 0 };
  }

  // 1. Lowercasing & Character Normalization
  const rawClean = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');

  // 2. Tokenization
  const rawTokens = rawClean.split(/\s+/).filter(Boolean);

  // 3. Stop-word removal
  const filteredTokens = rawTokens.filter(token => !STOP_WORDS.has(token) && token.length > 1);

  // 4. Lemmatization
  const lemmas = filteredTokens.map(token => LEMMA_DICT[token] || token);

  // 5. Sentiment / Urgency Indicator Calculation
  let negativeCount = 0;
  lemmas.forEach(word => {
    if (NEGATIVE_VALENCE_KEYWORDS.includes(word)) {
      negativeCount += 1;
    }
  });

  const sentimentScore = Math.min(1.0, (negativeCount * 0.25)); // 0.0 to 1.0 urgency multiplier

  return {
    rawText: text,
    cleanText: lemmas.join(' '),
    tokens: rawTokens,
    filteredTokens,
    lemmas,
    keywords: Array.from(new Set(lemmas)),
    sentimentScore
  };
}
