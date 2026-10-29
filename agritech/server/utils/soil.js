// Rule-based soil health analysis (values: N/P/K in kg/ha, moisture & organic matter in %)
module.exports = function analyzeSoil(s) {
  let score = 100;
  const recs = [];
  const rate = (cond, penalty, msg) => {
    if (cond) {
      score -= penalty;
      recs.push(msg);
    }
  };
  if (s.ph != null) {
    rate(s.ph < 5.5, 25, 'Soil is strongly acidic: apply agricultural lime or dolomite.');
    rate(s.ph >= 5.5 && s.ph < 6, 10, 'Soil is slightly acidic: add lime and organic compost.');
    rate(s.ph > 7.5 && s.ph <= 8.5, 10, 'Soil is slightly alkaline: add gypsum or sulphur and organic matter.');
    rate(s.ph > 8.5, 25, 'Soil is strongly alkaline: apply gypsum, improve drainage and leach salts.');
  }
  if (s.nitrogen != null) rate(s.nitrogen < 280, 15, 'Low nitrogen: apply urea, farmyard manure, or grow legumes in rotation.');
  if (s.phosphorus != null) rate(s.phosphorus < 11, 15, 'Low phosphorus: apply single super phosphate or DAP.');
  if (s.potassium != null) rate(s.potassium < 120, 15, 'Low potassium: apply muriate of potash or wood ash.');
  if (s.moisture != null) {
    rate(s.moisture < 20, 10, 'Soil is dry: irrigate and consider mulching to hold moisture.');
    rate(s.moisture > 60, 10, 'Soil is waterlogged: improve drainage to protect roots.');
  }
  if (s.organicMatter != null) rate(s.organicMatter < 2, 10, 'Low organic matter: add compost, green manure or crop residue.');
  score = Math.max(0, score);
  const rating = score >= 80 ? 'Good' : score >= 55 ? 'Moderate' : 'Poor';
  if (!recs.length) recs.push('Soil looks healthy. Maintain current practices and re-test each season.');
  return { score, rating, recommendations: recs };
};
