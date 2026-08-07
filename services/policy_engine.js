/**
 * Deterministic Policy Engine
 * Enforces business safety policies on top of raw AI agent outputs.
 * AI agents NEVER decide final actions directly.
 */

const POLICY_VERSION = 'v1.4.0-DETERMINISTIC';

function evaluatePolicy(eventType, aiOutput) {
  let policyName = 'DEFAULT_SAFETY_POLICY';
  let decision = 'ALLOW';
  let reason = 'AI risk metrics within safe operating thresholds.';

  if (eventType === 'PRODUCT_APPROVAL') {
    policyName = 'POL-AUTHENTICITY-01 (Listing Integrity Guard)';
    const counterfeitProb = aiOutput.counterfeitProbability || 0;
    if (counterfeitProb >= 75) {
      decision = 'BLOCK';
      reason = `Counterfeit probability (${counterfeitProb}%) exceeds critical safety threshold (75%). Listing blocked.`;
    } else if (counterfeitProb >= 40) {
      decision = 'HUMAN REVIEW';
      reason = `Counterfeit probability (${counterfeitProb}%) requires mandatory human admin verification before publication.`;
    } else {
      decision = 'ALLOW';
      reason = `Counterfeit probability (${counterfeitProb}%) is acceptable. Product eligible for listing.`;
    }
  } else if (eventType === 'CHECKOUT_RISK') {
    policyName = 'POL-CHECKOUT-02 (COD & Payment Risk Policy)';
    const riskScore = aiOutput.riskScore || 0;
    if (riskScore >= 80) {
      decision = 'HUMAN REVIEW';
      reason = `Risk Score ${riskScore}/100 exceeds COD threshold. Order routed to Fraud Case Queue for manual verification.`;
    } else if (riskScore >= 55) {
      decision = 'HUMAN REVIEW';
      reason = `Moderate risk score ${riskScore}/100. Verification needed.`;
    } else {
      decision = 'ALLOW';
      reason = `Risk Score ${riskScore}/100 is within low risk bounds. Order approved.`;
    }
  } else if (eventType === 'REVIEW_MODERATION') {
    policyName = 'POL-REVIEW-03 (Review Integrity & Ring Defense)';
    const fakeProb = aiOutput.fakeProbability || 0;
    if (fakeProb >= 70) {
      decision = 'BLOCK';
      reason = `Fake probability (${fakeProb}%) indicates synthetic/deceptive content. Review blocked.`;
    } else if (fakeProb >= 45) {
      decision = 'HUMAN REVIEW';
      reason = `Review flagged for potential manipulation ring (${fakeProb}%). Sent to Review Moderation Queue.`;
    } else {
      decision = 'ALLOW';
      reason = `Review validated as authentic.`;
    }
  }

  return {
    policyName,
    policyVersion: POLICY_VERSION,
    decision,
    reason
  };
}

module.exports = { evaluatePolicy };
