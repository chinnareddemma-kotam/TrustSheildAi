/**
 * Explainability Engine for TrustShield AI
 * Converts numerical risk scores, feature contributions, and model triggers into
 * deterministic, human-readable rationales required by DPDP compliance and audit rules.
 */

function generateExplainabilityReport(agentType, riskScore, featureContributions, modelType) {
  let decision = 'APPROVED';
  let severity = 'LOW';
  
  if (riskScore >= 75) {
    decision = 'BLOCKED / REJECTED';
    severity = 'HIGH';
  } else if (riskScore >= 45) {
    decision = 'HELD FOR HUMAN REVIEW';
    severity = 'MEDIUM';
  }

  let plainLanguageRationale = '';
  const triggers = [];

  switch (agentType) {
    case 'RISK_SCORING':
      if (featureContributions.ipVelocity > 5) {
        triggers.push(`High IP velocity detected (${featureContributions.ipVelocity} orders in 10 mins)`);
      }
      if (featureContributions.codRefusalRate > 0.4) {
        triggers.push(`Historical COD refusal rate exceeds threshold (${(featureContributions.codRefusalRate * 100).toFixed(1)}%)`);
      }
      if (featureContributions.deviceMatch === false) {
        triggers.push('Unrecognized device fingerprint paired with high-value order');
      }
      if (featureContributions.addressMismatch) {
        triggers.push('Shipping PIN code flags high return-fraud cluster');
      }

      plainLanguageRationale = triggers.length > 0
        ? `Order flagged with Risk Score ${riskScore}/100 [${severity}]. Primary factors: ${triggers.join('; ')}. Evaluated via ${modelType} model (IEEE-CIS Fraud Dataset calibrated).`
        : `Order evaluated as safe (Risk Score ${riskScore}/100). Device fingerprint verified, normal IP velocity, and low COD refusal history.`;
      break;

    case 'AUTHENTICITY':
      if (featureContributions.msrpVariance > 0.6) {
        triggers.push(`Listing price (₹${featureContributions.price}) is ${(featureContributions.msrpVariance * 100).toFixed(0)}% below brand MSRP (₹${featureContributions.msrp})`);
      }
      if (featureContributions.logoSimilarity < 0.5) {
        triggers.push(`Vision embeddings show low logo authenticity match (${(featureContributions.logoSimilarity * 100).toFixed(1)}%)`);
      }
      if (featureContributions.missingBrandAuth) {
        triggers.push('Seller lacks registered brand authorization documents for luxury item category');
      }
      if (featureContributions.uncertifiedCosmetics) {
        triggers.push('Uncertified cosmetic formulation detected without mandatory safety lab compliance');
      }

      plainLanguageRationale = triggers.length > 0
        ? `Listing flagged for counterfeit/unauthorized risk (Score ${riskScore}/100 [${severity}]). Key triggers: ${triggers.join('; ')}. Evaluated via ${modelType} Vision-Language model.`
        : `Listing passed integrity checks (Score ${riskScore}/100). Image embeddings match registered brand logos and pricing aligns with MSRP bounds.`;
      break;

    case 'REVIEW_MODERATION':
      if (featureContributions.burstVelocity > 10) {
        triggers.push(`Coordinated burst of ${featureContributions.burstVelocity} reviews posted within 5-minute window`);
      }
      if (featureContributions.aiTextProbability > 0.75) {
        triggers.push(`NLP analysis indicates high probability of synthetic AI-generated review text (${(featureContributions.aiTextProbability * 100).toFixed(1)}%)`);
      }
      if (featureContributions.graphDegreeCentrality > 0.8) {
        triggers.push('Graph network analysis detected review ring co-citation cluster among accounts created <48 hrs ago');
      }

      plainLanguageRationale = triggers.length > 0
        ? `Review submission flagged for manipulation (Score ${riskScore}/100 [${severity}]). Triggers: ${triggers.join('; ')}. Evaluated via ${modelType} OpSpam Graph-NLP Engine.`
        : `Review verified as authentic (Score ${riskScore}/100). Natural text sentiment structure and clean account cluster graph.`;
      break;

    default:
      plainLanguageRationale = `Automated evaluation completed with Risk Score ${riskScore}/100.`;
  }

  return {
    decision,
    severity,
    riskScore,
    modelType,
    plainLanguageRationale,
    triggers,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { generateExplainabilityReport };
