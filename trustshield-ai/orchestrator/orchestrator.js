/**
 * Multi-Agent Orchestrator — TrustShield AI
 *
 * Coordinates event handling through the full pipeline:
 *   Event → Agent Execution → AI Assessment → Policy Engine → Decision → AuditLog
 *
 * The orchestrator ensures:
 *   1. AI agents NEVER write the final decision directly.
 *   2. Every automated decision flows through the Policy Engine.
 *   3. Every decision produces a rich, queryable AuditLog record.
 *   4. All AgentExecution records are linked to entity IDs for timeline reconstruction.
 */

const db = require('../db/db');
const { evaluateRiskScore } = require('../services/risk_agent');
const { evaluateAuthenticity } = require('../services/authenticity_agent');
const { evaluateReview } = require('../services/review_agent');
const { evaluatePolicy } = require('../services/policy_engine');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: write AuditLog with all versioned policy fields
// ─────────────────────────────────────────────────────────────────────────────
function writeAuditLog({
  actor, role, entityType, entityId,
  agent, modelVersion,
  action, decision, riskScore,
  explanation, policyName, policyVersion, ruleTriggered,
  humanOverride = 0, overrideReason = null,
}) {
  const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString();

  db.prepare(`
    INSERT INTO AuditLog (
      id, timestamp, actor, role, entityType, entity,
      agent, modelVersion, action, decision, riskScore,
      explanation, policyName, policyVersion, ruleTriggered,
      humanOverride, overrideReason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, timestamp, actor, role, entityType, entityId,
    agent, modelVersion, action, decision, riskScore,
    explanation, policyName, policyVersion, ruleTriggered,
    humanOverride, overrideReason
  );

  return { id, timestamp };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: write AgentExecution record
// ─────────────────────────────────────────────────────────────────────────────
function writeAgentExecution({ agent, caseId, modelVersion, result, confidence, latency }) {
  const id = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();
  db.prepare(`
    INSERT INTO AgentExecution (id, agent, caseId, timestamp, modelVersion, result, confidence, latency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, agent, caseId, timestamp, modelVersion, result, confidence, latency);
  return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// processEvent — main entry point called by API routes
// ─────────────────────────────────────────────────────────────────────────────
function processEvent(event) {
  const { type, payload, actor = 'SYSTEM', role = 'SYSTEM' } = event;
  const timestamp = new Date().toISOString();

  // ──────────────────────────────────────────────────────────────────────────
  // PRODUCT_SUBMITTED
  // Pipeline: Authenticity Agent → LISTING_AUTHENTICITY_V1 policy → AuditLog
  // ──────────────────────────────────────────────────────────────────────────
  if (type === 'PRODUCT_SUBMITTED') {

    // Step 1: AI Agent assessment (raw output — no final decision made here)
    const aiResult = evaluateAuthenticity(payload);

    // Step 2: Deterministic Policy Engine maps AI output → final decision
    const policyResult = evaluatePolicy('PRODUCT_APPROVAL', aiResult);
    // policyResult.decision is normalized: ALLOW | REVIEW | BLOCK

    // Step 3: Determine product status from policy decision
    let newStatus = 'UNDER_ADMIN_REVIEW'; // default for REVIEW
    if (policyResult.decision === 'ALLOW') {
      newStatus = 'APPROVED';
    } else if (policyResult.decision === 'BLOCK') {
      newStatus = 'BLOCKED';
    }

    // Step 4: Record AgentExecution (links to product/entity for timeline)
    writeAgentExecution({
      agent: 'Authenticity Agent',
      caseId: payload.id,
      modelVersion: aiResult.modelVersion,
      result: policyResult.decision,
      confidence: aiResult.authenticityScore,
      latency: aiResult.latency,
    });

    // Step 5: Record AuthenticityAssessment
    const assessmentId = `auth-ass-${Date.now()}`;
    db.prepare(`
      INSERT INTO AuthenticityAssessment (id, productId, authenticityScore, counterfeitProbability, riskLevel, recommendation, explanation, modelVersion, latency, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assessmentId, payload.id,
      aiResult.authenticityScore, aiResult.counterfeitProbability,
      aiResult.riskLevel, aiResult.recommendation,
      aiResult.explanation, aiResult.modelVersion,
      aiResult.latency, timestamp
    );

    // Step 6: Update Product with AI assessment + policy-determined status
    db.prepare(`
      UPDATE Product
      SET status = ?, authenticityScore = ?, counterfeitProbability = ?, riskLevel = ?, updatedAt = ?
      WHERE id = ?
    `).run(newStatus, aiResult.authenticityScore, aiResult.counterfeitProbability, aiResult.riskLevel, timestamp, payload.id);

    // Step 7: Open FraudCase for non-ALLOW decisions so Admin can investigate
    if (policyResult.decision !== 'ALLOW') {
      const caseNumber = `CASE-${Math.floor(100000 + Math.random() * 900000)}`;
      db.prepare(`
        INSERT INTO FraudCase (id, caseNumber, type, entityId, riskScore, status, assignedTo, agent, explanation, overrideReason, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `fc-${Date.now()}`, caseNumber, 'LISTING_COUNTERFEIT',
        payload.id, aiResult.counterfeitProbability,
        'UNDER_REVIEW', 'Unassigned T&S Admin',
        'Authenticity Agent', aiResult.explanation, null, timestamp
      );
    }

    // Step 8: Write rich AuditLog preserving both the AI assessment and the policy decision
    writeAuditLog({
      actor, role,
      entityType: 'PRODUCT',
      entityId: payload.id,
      agent: 'Authenticity Agent',
      modelVersion: aiResult.modelVersion,
      action: 'PRODUCT_SUBMITTED',
      decision: policyResult.decision,
      riskScore: aiResult.counterfeitProbability,
      explanation: buildExplanation({
        agentName: 'Authenticity Agent',
        agentAssessment: `Counterfeit probability: ${aiResult.counterfeitProbability}% | Authenticity score: ${aiResult.authenticityScore}/100`,
        signals: aiResult.signals || [],
        policyResult,
      }),
      policyName: policyResult.policyName,
      policyVersion: policyResult.policyVersion,
      ruleTriggered: policyResult.ruleTriggered,
    });

    return { aiResult, policyResult, newStatus };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CHECKOUT_EVALUATION
  // Pipeline: Risk Scoring Agent → CHECKOUT_RISK_V1 policy → AuditLog
  // ──────────────────────────────────────────────────────────────────────────
  if (type === 'CHECKOUT_EVALUATION') {

    // Step 1: AI Agent assessment
    const aiResult = evaluateRiskScore(payload);

    // Step 2: Policy Engine
    const policyResult = evaluatePolicy('CHECKOUT_RISK', aiResult);

    // Step 3: Record AgentExecution
    writeAgentExecution({
      agent: 'Risk Scoring Agent',
      caseId: payload.orderId || 'CHECKOUT-EVAL',
      modelVersion: aiResult.modelVersion,
      result: policyResult.decision,
      confidence: aiResult.riskScore,
      latency: aiResult.latency,
    });

    // Step 4: Record RiskAssessment
    db.prepare(`
      INSERT INTO RiskAssessment (id, entityType, entityId, riskScore, riskLevel, recommendation, explanation, modelVersion, latency, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `risk-ass-${Date.now()}`, 'CHECKOUT',
      payload.orderId || 'CHECKOUT-EVAL',
      aiResult.riskScore, aiResult.riskLevel,
      aiResult.recommendation, aiResult.explanation,
      aiResult.modelVersion, aiResult.latency, timestamp
    );

    // Step 5: Open FraudCase for REVIEW / BLOCK decisions
    if (policyResult.decision === 'REVIEW' || policyResult.decision === 'BLOCK') {
      const caseNumber = `CASE-${Math.floor(100000 + Math.random() * 900000)}`;
      db.prepare(`
        INSERT INTO FraudCase (id, caseNumber, type, entityId, riskScore, status, assignedTo, agent, explanation, overrideReason, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `fc-${Date.now()}`, caseNumber, 'COD_FRAUD',
        payload.orderId || 'CHECKOUT-EVAL',
        aiResult.riskScore, 'UNDER_REVIEW',
        'Unassigned T&S Admin', 'Risk Scoring Agent',
        aiResult.explanation, null, timestamp
      );
    }

    // Step 6: Write rich AuditLog
    writeAuditLog({
      actor, role,
      entityType: 'ORDER',
      entityId: payload.orderId || 'CHECKOUT-EVAL',
      agent: 'Risk Scoring Agent',
      modelVersion: aiResult.modelVersion,
      action: 'RISK_ANALYSIS',
      decision: policyResult.decision,
      riskScore: aiResult.riskScore,
      explanation: buildExplanation({
        agentName: 'Risk Scoring Agent',
        agentAssessment: `Risk Score: ${aiResult.riskScore}/100 | Risk Level: ${aiResult.riskLevel}`,
        signals: aiResult.signals || [],
        policyResult,
      }),
      policyName: policyResult.policyName,
      policyVersion: policyResult.policyVersion,
      ruleTriggered: policyResult.ruleTriggered,
    });

    return { aiResult, policyResult };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // REVIEW_SUBMITTED
  // Pipeline: Review Moderation Agent → REVIEW_MODERATION_V1 policy → AuditLog
  // ──────────────────────────────────────────────────────────────────────────
  if (type === 'REVIEW_SUBMITTED') {

    // Step 1: AI Agent assessment
    const aiResult = evaluateReview(payload);

    // Step 2: Policy Engine
    const policyResult = evaluatePolicy('REVIEW_MODERATION', aiResult);

    // Map ALLOW/REVIEW/BLOCK to review status strings
    let reviewStatus = 'APPROVED';
    if (policyResult.decision === 'BLOCK') reviewStatus = 'BLOCKED';
    else if (policyResult.decision === 'REVIEW') reviewStatus = 'FLAGGED';

    // Step 3: Update Review record
    db.prepare(`
      UPDATE Review
      SET status = ?, fakeProbability = ?, riskLevel = ?, explanation = ?
      WHERE id = ?
    `).run(reviewStatus, aiResult.fakeProbability, aiResult.riskLevel, aiResult.explanation, payload.id);

    // Step 4: Record AgentExecution
    writeAgentExecution({
      agent: 'Review Moderation Agent',
      caseId: payload.id,
      modelVersion: aiResult.modelVersion,
      result: policyResult.decision,
      confidence: aiResult.fakeProbability,
      latency: aiResult.latency,
    });

    // Step 5: Record ReviewAssessment
    db.prepare(`
      INSERT INTO ReviewAssessment (id, reviewId, fakeProbability, riskLevel, recommendation, explanation, modelVersion, latency, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `rev-ass-${Date.now()}`, payload.id,
      aiResult.fakeProbability, aiResult.riskLevel,
      aiResult.recommendation, aiResult.explanation,
      aiResult.modelVersion, aiResult.latency, timestamp
    );

    // Step 6: Write rich AuditLog
    writeAuditLog({
      actor, role,
      entityType: 'REVIEW',
      entityId: payload.id,
      agent: 'Review Moderation Agent',
      modelVersion: aiResult.modelVersion,
      action: 'REVIEW_ANALYZED',
      decision: policyResult.decision,
      riskScore: aiResult.fakeProbability,
      explanation: buildExplanation({
        agentName: 'Review Moderation Agent',
        agentAssessment: `Fake review probability: ${aiResult.fakeProbability}% | Risk level: ${aiResult.riskLevel}`,
        signals: aiResult.signals || [],
        policyResult,
      }),
      policyName: policyResult.policyName,
      policyVersion: policyResult.policyVersion,
      ruleTriggered: policyResult.ruleTriggered,
    });

    return { aiResult, policyResult, status: reviewStatus };
  }

  throw new Error(`Unknown event type: ${type}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// buildExplanation — constructs the human-readable explanation block
// stored in AuditLog.explanation for Admin display
// ─────────────────────────────────────────────────────────────────────────────
function buildExplanation({ agentName, agentAssessment, signals, policyResult }) {
  const signalLines = signals && signals.length
    ? signals.map(s => `  • ${s}`).join('\n')
    : '  (No additional risk signals)';

  return `AGENT: ${agentName}
AI ASSESSMENT: ${agentAssessment}
IMPORTANT SIGNALS:
${signalLines}
POLICY APPLIED: ${policyResult.policyName} ${policyResult.policyVersion}
RULE TRIGGERED: ${policyResult.ruleTriggered}
POLICY REASON: ${policyResult.reason}
FINAL DECISION: ${policyResult.decision}
HUMAN OVERRIDE: NO`;
}

module.exports = { processEvent, writeAuditLog };
