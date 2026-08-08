/**
 * Deterministic Policy Engine — TrustShield AI
 *
 * AI agents NEVER directly decide the final action.
 * All agent outputs flow through this engine before any system action is taken.
 *
 * Output decisions are normalized to exactly:
 *   ALLOW | REVIEW | BLOCK
 *
 * Every decision is tagged with:
 *   policyName, policyVersion, ruleTriggered, reason
 */

// ─────────────────────────────────────────────────────────────────────────────
// Policy Definitions
// ─────────────────────────────────────────────────────────────────────────────

const POLICIES = {

  // ── LISTING_AUTHENTICITY_V1 ──────────────────────────────────────────────
  LISTING_AUTHENTICITY_V1: {
    name: 'LISTING_AUTHENTICITY',
    version: 'V1',
    description: 'Evaluates AI authenticity assessment and determines listing approval action.',
    evaluate(aiOutput) {
      const prob = aiOutput.counterfeitProbability || 0; // 0–100 scale
      const hasAuth = !!(aiOutput.signals &&
        !aiOutput.signals.some(s => s.toLowerCase().includes('missing') && s.toLowerCase().includes('authorization')));

      // Rule 1: Critical — high counterfeit + no brand auth → BLOCK
      if (prob >= 90 && !hasAuth) {
        return {
          decision: 'BLOCK',
          ruleTriggered: 'COUNTERFEIT_CRITICAL_NO_AUTHORIZATION',
          reason: `Counterfeit probability (${prob}%) exceeds critical threshold (90%) and brand authorization is unavailable. Listing blocked to protect consumers.`,
        };
      }

      // Rule 2: High counterfeit risk → BLOCK
      if (prob >= 75) {
        return {
          decision: 'BLOCK',
          ruleTriggered: 'COUNTERFEIT_HIGH_RISK',
          reason: `Counterfeit probability (${prob}%) exceeds the high-risk blocking threshold (75%). Requires admin investigation before any listing can proceed.`,
        };
      }

      // Rule 3: Moderate risk → REVIEW
      if (prob >= 40) {
        return {
          decision: 'REVIEW',
          ruleTriggered: 'COUNTERFEIT_MODERATE_RISK',
          reason: `Counterfeit probability (${prob}%) is above the moderate-risk threshold (40%). Mandatory admin review required before publication.`,
        };
      }

      // Rule 4: Low risk → ALLOW
      return {
        decision: 'ALLOW',
        ruleTriggered: 'COUNTERFEIT_LOW_RISK',
        reason: `Counterfeit probability (${prob}%) is within acceptable limits. Product is eligible for listing.`,
      };
    },
  },

  // ── CHECKOUT_RISK_V1 ─────────────────────────────────────────────────────
  CHECKOUT_RISK_V1: {
    name: 'CHECKOUT_RISK',
    version: 'V1',
    description: 'Evaluates transaction risk score for COD and payment fraud gating.',
    evaluate(aiOutput) {
      const score = aiOutput.riskScore || 0; // 0–100 scale

      // Rule 1: Severe — very high risk score → BLOCK
      if (score >= 90) {
        return {
          decision: 'BLOCK',
          ruleTriggered: 'RISK_SCORE_CRITICAL',
          reason: `Risk Score ${score}/100 exceeds the critical threshold (90). Transaction blocked. COD payment is unavailable for this order.`,
        };
      }

      // Rule 2: High risk — route for human review
      if (score >= 65) {
        return {
          decision: 'REVIEW',
          ruleTriggered: 'RISK_SCORE_HIGH',
          reason: `Risk Score ${score}/100 exceeds the high-risk threshold (65). Order routed to Fraud Case Queue for human verification before dispatch.`,
        };
      }

      // Rule 3: Moderate — additional verification
      if (score >= 40) {
        return {
          decision: 'REVIEW',
          ruleTriggered: 'RISK_SCORE_MODERATE',
          reason: `Risk Score ${score}/100 exceeds the moderate-risk threshold (40). Order flagged for manual review.`,
        };
      }

      // Rule 4: Low risk → ALLOW
      return {
        decision: 'ALLOW',
        ruleTriggered: 'RISK_SCORE_LOW',
        reason: `Risk Score ${score}/100 is within safe operating bounds. Order approved to proceed.`,
      };
    },
  },

  // ── REVIEW_MODERATION_V1 ─────────────────────────────────────────────────
  REVIEW_MODERATION_V1: {
    name: 'REVIEW_MODERATION',
    version: 'V1',
    description: 'Evaluates fake-review probability and coordinated ring indicators.',
    evaluate(aiOutput) {
      const prob = aiOutput.fakeProbability || 0; // 0–100 scale

      // Rule 1: High fake probability → BLOCK
      if (prob >= 70) {
        return {
          decision: 'BLOCK',
          ruleTriggered: 'FAKE_REVIEW_HIGH_PROBABILITY',
          reason: `Fake review probability (${prob}%) exceeds the blocking threshold (70%). Review suppressed from public display to protect review integrity.`,
        };
      }

      // Rule 2: Moderate — flag for human review
      if (prob >= 40) {
        return {
          decision: 'REVIEW',
          ruleTriggered: 'FAKE_REVIEW_MODERATE_RISK',
          reason: `Fake review probability (${prob}%) is above the moderate-risk threshold (40%). Sent to Review Moderation Queue for human verification.`,
        };
      }

      // Rule 3: Authentic → ALLOW
      return {
        decision: 'ALLOW',
        ruleTriggered: 'REVIEW_AUTHENTIC',
        reason: `Fake review probability (${prob}%) is below the threshold. Review validated as authentic and approved for display.`,
      };
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main evaluatePolicy function
// ─────────────────────────────────────────────────────────────────────────────

function evaluatePolicy(eventType, aiOutput) {
  let policy;

  if (eventType === 'PRODUCT_APPROVAL') {
    policy = POLICIES.LISTING_AUTHENTICITY_V1;
  } else if (eventType === 'CHECKOUT_RISK') {
    policy = POLICIES.CHECKOUT_RISK_V1;
  } else if (eventType === 'REVIEW_MODERATION') {
    policy = POLICIES.REVIEW_MODERATION_V1;
  } else {
    return {
      policyName: 'DEFAULT_PASSTHROUGH',
      policyVersion: 'V0',
      decision: 'REVIEW',
      ruleTriggered: 'UNKNOWN_EVENT_TYPE',
      reason: `No policy registered for event type: ${eventType}. Defaulting to human review.`,
    };
  }

  const ruleResult = policy.evaluate(aiOutput);

  return {
    policyName: policy.name,
    policyVersion: policy.version,
    decision: ruleResult.decision,           // ALLOW | REVIEW | BLOCK
    ruleTriggered: ruleResult.ruleTriggered,
    reason: ruleResult.reason,
  };
}

module.exports = { evaluatePolicy };
