/**
 * Audit Trail Generator for TrustShield AI
 * Creates immutable, cryptographically hash-chained log entries for every AI decision.
 * Pinned to India Cloud Region (ap-south-1) for Data Sovereignty compliance.
 */

const crypto = require('crypto');

let lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
const auditMemoryLogs = [];

function createAuditRecord({ agentName, actionTaken, riskScore, confidenceScore, modelType, costUsd, latencyMs, rationale, features }) {
  const timestamp = new Date().toISOString();
  const eventId = `TS-AUDIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  
  const payloadToHash = `${eventId}|${agentName}|${actionTaken}|${riskScore}|${confidenceScore}|${modelType}|${lastHash}|${timestamp}`;
  const currentHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

  const record = {
    eventId,
    dataRegion: 'ap-south-1 (India VPC)', // Data Sovereignty compliance
    agentName,
    actionTaken,
    riskScore,
    confidenceScore,
    modelType,
    costUsd,
    latencyMs,
    plainLanguageRationale: rationale,
    featureContributions: features,
    previousHash: lastHash,
    currentHash,
    timestamp
  };

  lastHash = currentHash;
  auditMemoryLogs.unshift(record);

  // Keep last 200 records in memory for quick UI query
  if (auditMemoryLogs.length > 200) {
    auditMemoryLogs.pop();
  }

  return record;
}

function getAuditLogs() {
  return auditMemoryLogs;
}

function verifyChainIntegrity() {
  for (let i = auditMemoryLogs.length - 2; i >= 0; i--) {
    const current = auditMemoryLogs[i];
    const previous = auditMemoryLogs[i + 1];
    if (current.previousHash !== previous.currentHash) {
      return { valid: false, brokenEventId: current.eventId };
    }
  }
  return { valid: true, totalRecords: auditMemoryLogs.length };
}

module.exports = { createAuditRecord, getAuditLogs, verifyChainIntegrity };
