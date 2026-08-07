/**
 * Multi-Agent Orchestrator
 * Coordinates event handling, agent execution, decision fusion, policy evaluation, and audit logging.
 */

const db = require('../db/db');
const { evaluateRiskScore } = require('../services/risk_agent');
const { evaluateAuthenticity } = require('../services/authenticity_agent');
const { evaluateReview } = require('../services/review_agent');
const { evaluatePolicy } = require('../services/policy_engine');

function processEvent(event) {
  const { type, payload, actor = 'SYSTEM', role = 'SYSTEM' } = event;
  const timestamp = new Date().toISOString();

  if (type === 'PRODUCT_SUBMITTED') {
    // 1. Invoke Authenticity Agent
    const aiResult = evaluateAuthenticity(payload);
    
    // 2. Evaluate Policy
    const policyResult = evaluatePolicy('PRODUCT_APPROVAL', aiResult);

    // 3. Record Agent Execution
    const execId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO AgentExecution (id, agent, caseId, timestamp, modelVersion, result, confidence, latency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(execId, 'Authenticity Agent', payload.id, timestamp, aiResult.modelVersion, policyResult.decision, aiResult.authenticityScore, aiResult.latency);

    // 4. Record Authenticity Assessment
    const assessmentId = `auth-ass-${Date.now()}`;
    db.prepare(`
      INSERT INTO AuthenticityAssessment (id, productId, authenticityScore, counterfeitProbability, riskLevel, recommendation, explanation, modelVersion, latency, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assessmentId,
      payload.id,
      aiResult.authenticityScore,
      aiResult.counterfeitProbability,
      aiResult.riskLevel,
      aiResult.recommendation,
      aiResult.explanation,
      aiResult.modelVersion,
      aiResult.latency,
      timestamp
    );

    // 5. Update Product Status based on Policy Decision
    let newStatus = 'UNDER_ADMIN_REVIEW';
    if (policyResult.decision === 'ALLOW') {
      newStatus = 'APPROVED';
    } else if (policyResult.decision === 'BLOCK') {
      newStatus = 'BLOCKED';
    }

    db.prepare(`
      UPDATE Product 
      SET status = ?, authenticityScore = ?, counterfeitProbability = ?, riskLevel = ?, updatedAt = ?
      WHERE id = ?
    `).run(newStatus, aiResult.authenticityScore, aiResult.counterfeitProbability, aiResult.riskLevel, timestamp, payload.id);

    // 6. Create FraudCase if requires review/block
    if (policyResult.decision !== 'ALLOW') {
      const caseNumber = `CASE-${Math.floor(100000 + Math.random() * 900000)}`;
      db.prepare(`
        INSERT INTO FraudCase (id, caseNumber, type, entityId, riskScore, status, assignedTo, agent, explanation, overrideReason, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `fc-${Date.now()}`,
        caseNumber,
        'LISTING_COUNTERFEIT',
        payload.id,
        aiResult.counterfeitProbability,
        'UNDER_REVIEW',
        'Unassigned T&S Admin',
        'Authenticity Agent',
        aiResult.explanation,
        null,
        timestamp
      );
    }

    // 7. Audit Log
    db.prepare(`
      INSERT INTO AuditLog (id, timestamp, actor, role, entity, agent, modelVersion, action, decision, riskScore, explanation, policy, humanOverride, overrideReason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit-${Date.now()}`,
      timestamp,
      actor,
      role,
      payload.id,
      'Authenticity Agent',
      aiResult.modelVersion,
      'PRODUCT_SUBMITTED',
      newStatus,
      aiResult.counterfeitProbability,
      aiResult.explanation,
      `${policyResult.policyName}: ${policyResult.reason}`,
      0,
      null
    );

    return { aiResult, policyResult, newStatus };
  }

  if (type === 'CHECKOUT_EVALUATION') {
    // 1. Risk Scoring Agent
    const aiResult = evaluateRiskScore(payload);

    // 2. Policy Engine
    const policyResult = evaluatePolicy('CHECKOUT_RISK', aiResult);

    // 3. Agent Execution Record
    const execId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO AgentExecution (id, agent, caseId, timestamp, modelVersion, result, confidence, latency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(execId, 'Risk Scoring Agent', payload.orderId || 'CHECKOUT-SIM', timestamp, aiResult.modelVersion, policyResult.decision, aiResult.riskScore, aiResult.latency);

    // 4. Risk Assessment
    db.prepare(`
      INSERT INTO RiskAssessment (id, entityType, entityId, riskScore, riskLevel, recommendation, explanation, modelVersion, latency, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `risk-ass-${Date.now()}`,
      'CHECKOUT',
      payload.orderId || 'CHECKOUT-SIM',
      aiResult.riskScore,
      aiResult.riskLevel,
      aiResult.recommendation,
      aiResult.explanation,
      aiResult.modelVersion,
      aiResult.latency,
      timestamp
    );

    // 5. Create FraudCase if HUMAN REVIEW / BLOCK
    if (policyResult.decision === 'HUMAN REVIEW') {
      const caseNumber = `CASE-${Math.floor(100000 + Math.random() * 900000)}`;
      db.prepare(`
        INSERT INTO FraudCase (id, caseNumber, type, entityId, riskScore, status, assignedTo, agent, explanation, overrideReason, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `fc-${Date.now()}`,
        caseNumber,
        'COD_FRAUD',
        payload.orderId || 'CHECKOUT-SIM',
        aiResult.riskScore,
        'UNDER_REVIEW',
        'Unassigned T&S Admin',
        'Risk Scoring Agent',
        aiResult.explanation,
        null,
        timestamp
      );
    }

    // 6. Audit Log
    db.prepare(`
      INSERT INTO AuditLog (id, timestamp, actor, role, entity, agent, modelVersion, action, decision, riskScore, explanation, policy, humanOverride, overrideReason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit-${Date.now()}`,
      timestamp,
      actor,
      role,
      payload.orderId || 'CHECKOUT-SIM',
      'Risk Scoring Agent',
      aiResult.modelVersion,
      'RISK_ANALYSIS',
      policyResult.decision,
      aiResult.riskScore,
      aiResult.explanation,
      `${policyResult.policyName}: ${policyResult.reason}`,
      0,
      null
    );

    return { aiResult, policyResult };
  }

  if (type === 'REVIEW_SUBMITTED') {
    // 1. Review Agent
    const aiResult = evaluateReview(payload);

    // 2. Policy Engine
    const policyResult = evaluatePolicy('REVIEW_MODERATION', aiResult);

    let status = 'APPROVED';
    if (policyResult.decision === 'BLOCK') {
      status = 'BLOCKED';
    } else if (policyResult.decision === 'HUMAN REVIEW') {
      status = 'FLAGGED';
    }

    // 3. Update Review in DB
    db.prepare(`
      UPDATE Review
      SET status = ?, fakeProbability = ?, riskLevel = ?, explanation = ?
      WHERE id = ?
    `).run(status, aiResult.fakeProbability, aiResult.riskLevel, aiResult.explanation, payload.id);

    // 4. Agent Execution Record
    const execId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO AgentExecution (id, agent, caseId, timestamp, modelVersion, result, confidence, latency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(execId, 'Review Moderation Agent', payload.id, timestamp, aiResult.modelVersion, policyResult.decision, aiResult.fakeProbability, aiResult.latency);

    // 5. Review Assessment Record
    db.prepare(`
      INSERT INTO ReviewAssessment (id, reviewId, fakeProbability, riskLevel, recommendation, explanation, modelVersion, latency, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `rev-ass-${Date.now()}`,
      payload.id,
      aiResult.fakeProbability,
      aiResult.riskLevel,
      aiResult.recommendation,
      aiResult.explanation,
      aiResult.modelVersion,
      aiResult.latency,
      timestamp
    );

    // 6. Audit Log
    db.prepare(`
      INSERT INTO AuditLog (id, timestamp, actor, role, entity, agent, modelVersion, action, decision, riskScore, explanation, policy, humanOverride, overrideReason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit-${Date.now()}`,
      timestamp,
      actor,
      role,
      payload.id,
      'Review Moderation Agent',
      aiResult.modelVersion,
      'REVIEW_ANALYZED',
      status,
      aiResult.fakeProbability,
      aiResult.explanation,
      `${policyResult.policyName}: ${policyResult.reason}`,
      0,
      null
    );

    return { aiResult, policyResult, status };
  }

  throw new Error(`Unknown event type: ${type}`);
}

module.exports = { processEvent };
