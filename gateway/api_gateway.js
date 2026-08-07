/**
 * Full API Gateway & Backend Microservices Server for TrustShield AI
 * Handles Auth, Customer, Seller, Admin, Risk Scoring, Authenticity Check, Review Moderation,
 * Multi-Agent Orchestration, Admin Overrides, Audit Logging, and Data Sovereignty headers.
 */

const http = require('http');
const url = require('url');
const crypto = require('crypto');
const { orchestrateEvaluation } = require('../orchestrator/orchestrator');
const { getAuditLogs, verifyChainIntegrity, createAuditRecord } = require('../audit-trail/audit_logger');
const { evaluateCheckoutRisk } = require('../services/risk-scoring/risk_agent');
const { evaluateListingAuthenticity } = require('../services/authenticity/authenticity_agent');
const { evaluateReviewSubmission } = require('../services/review-moderation/review_agent');

const PORT = process.env.PORT || 4000;

// Rate Limiter state
const RATE_LIMIT_CAPACITY = 100;
let tokens = RATE_LIMIT_CAPACITY;
setInterval(() => {
  tokens = Math.min(RATE_LIMIT_CAPACITY, tokens + 10);
}, 1000);

// Dynamic In-Memory Store
let casesStore = [
  {
    caseId: 'CASE-784512',
    type: 'Return Fraud / COD Abuse',
    entity: 'Order #ORD-45822',
    reason: 'Empty box claim, weight mismatch & high COD refusal (42%)',
    riskScore: 92,
    status: 'Under Review',
    assignedTo: 'Ananya Sharma',
    createdAt: '2026-08-07 14:22',
    agent: 'Risk Scoring Agent',
    modelType: 'LLM (Deep Context)',
    explainability: 'Order flagged with Risk Score 92/100 [HIGH]. Primary factors: High IP velocity (7 orders/10 mins); Historical COD refusal rate 42%; Device mismatch paired with high-value order.',
    overrideReason: null
  },
  {
    caseId: 'CASE-784511',
    type: 'Counterfeit Listing',
    entity: 'Product #PROD-104 (AirPods Pro)',
    reason: 'Logo mismatch 34%, price 88% below MSRP (₹2,999 vs ₹24,900)',
    riskScore: 98,
    status: 'Listing Held',
    assignedTo: 'Vikram Mehta',
    createdAt: '2026-08-07 13:45',
    agent: 'Authenticity & Integrity Agent',
    modelType: 'LLM (Multimodal Vision-Text)',
    explainability: 'Listing flagged for counterfeit risk (Score 98/100 [HIGH]). Triggers: Listing price (₹2,999) is 88% below brand MSRP (₹24,900); Vision embeddings show low logo match (34.0%); Seller lacks registered brand authorization.',
    overrideReason: null
  },
  {
    caseId: 'CASE-784510',
    type: 'Fake Review Ring',
    entity: 'Seller Seller_248',
    reason: 'Burst of 18 reviews in 3 mins from newly created accounts (<24h)',
    riskScore: 94,
    status: 'Investigating',
    assignedTo: 'Rajesh Kumar',
    createdAt: '2026-08-07 11:10',
    agent: 'Review Moderation Agent',
    modelType: 'LLM (Graph-NLP Ensemble)',
    explainability: 'Review submission flagged for manipulation (Score 94/100 [HIGH]). Triggers: Coordinated burst of 18 reviews posted within 5-minute window; Synthetic AI text probability (88.0%); Graph degree centrality network cluster (0.85).',
    overrideReason: null
  },
  {
    caseId: 'CASE-784509',
    type: 'COD Abuse',
    entity: 'User User_78291',
    reason: '8 COD refusals in 30 days across multiple delivery PINs',
    riskScore: 89,
    status: 'Pending',
    assignedTo: 'Priya Nair',
    createdAt: '2026-08-07 09:30',
    agent: 'Risk Scoring Agent',
    modelType: 'SLM (XGBoost Fast)',
    explainability: 'User restricted from COD payment option due to 8 consecutive doorstep payment refusals.',
    overrideReason: null
  }
];

let listingsStore = [
  { id: 'LST-101', title: 'boAt Airdopes 141 Bluetooth Earbuds', brand: 'boAt', price: 1299, msrp: 4490, status: 'ACTIVE', authenticityScore: 97, riskLevel: 'LOW', category: 'Electronics' },
  { id: 'LST-102', title: 'Puma Men Running Shoes', brand: 'Puma', price: 2499, msrp: 5999, status: 'ACTIVE', authenticityScore: 94, riskLevel: 'LOW', category: 'Footwear' },
  { id: 'LST-103', title: 'Noise ColorFit Pro 4 Smartwatch', brand: 'Noise', price: 1999, msrp: 4999, status: 'ACTIVE', authenticityScore: 98, riskLevel: 'LOW', category: 'Wearables' },
  { id: 'LST-104', title: 'Apple AirPods Pro (2nd Gen) - Premium White', brand: 'Apple', price: 2999, msrp: 24900, status: 'HELD', authenticityScore: 23, riskLevel: 'HIGH', category: 'Electronics' }
];

let ordersStore = [
  { id: 'ORD-45821', customer: 'Priya Sharma', item: 'boAt Airdopes 141', amount: 1299, paymentMethod: 'UPI', status: 'SAFE', riskScore: 12, date: '2026-08-07 10:15' },
  { id: 'ORD-45822', customer: 'Ananya Roy', item: 'Apple AirPods Pro', amount: 2999, paymentMethod: 'COD', status: 'UNDER_REVIEW', riskScore: 89, date: '2026-08-07 14:20' }
];

let alertsStore = [
  { id: 'ALT-901', title: 'Large scale fake review ring detected', severity: 'CRITICAL', entity: 'Seller_248', timestamp: '10 mins ago', details: '18 reviews from single subnet' },
  { id: 'ALT-902', title: 'Counterfeit product batch detected', severity: 'HIGH', entity: 'Listing #LST-104', timestamp: '25 mins ago', details: 'AirPods Pro price 88% below MSRP' },
  { id: 'ALT-903', title: 'COD abuse spike in Bangalore region', severity: 'HIGH', entity: 'User_78291', timestamp: '1 hour ago', details: '8 refusals in 30 days' },
  { id: 'ALT-904', title: 'Unauthorized brand listing detected', severity: 'MEDIUM', entity: 'Seller_655', timestamp: '2 hours ago', details: 'Missing authorization docs' }
];

let riskySellersStore = [
  { sellerId: 'Seller_248', riskScore: 92, issues: 'Counterfeit, Fake Reviews', status: 'FLAGGED' },
  { sellerId: 'Seller_678', riskScore: 88, issues: 'High Return Rate, Empty Box', status: 'FLAGGED' },
  { sellerId: 'Seller_902', riskScore: 76, issues: 'Policy Violations', status: 'WARNING' },
  { sellerId: 'Seller_311', riskScore: 65, issues: 'COD Abuse', status: 'WARNING' },
  { sellerId: 'Seller_655', riskScore: 62, issues: 'Brand Authorization Missing', status: 'WARNING' }
];

const fairnessMetricsStore = {
  smallNewSellers: { totalListings: 1240, heldListings: 48, falsePositiveRate: 0.08, precision: 0.964 },
  establishedSellers: { totalListings: 8900, heldListings: 320, falsePositiveRate: 0.07, precision: 0.971 },
  parityStatus: 'PASSED (FPR Delta < 0.01%)',
  complianceStandard: 'India DPDP Act & Fair Marketplace Standard'
};

const server = http.createServer(async (req, res) => {
  // Global CORS & Data Sovereignty Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-TrustShield-Data-Sovereignty', 'Region: ap-south-1 (India VPC)');
  res.setHeader('X-TrustShield-DPDP-Compliant', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Rate limiting token bucket check
  if (tokens <= 0) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rate limit exceeded (100 req/sec capacity)' }));
    return;
  }
  tokens--;

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  const getJsonBody = () => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch (e) { resolve({}); }
    });
  });

  try {
    // HEALTH & STATUS
    if (pathname === '/api/v1/health' || pathname === '/api/agents/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'UP',
        service: 'TrustShield AI API Gateway',
        region: 'ap-south-1 (India VPC)',
        avgLatencyMs: 148,
        targetSlaMs: 250,
        dataSovereignty: 'LOCAL_VPC_PINNED',
        agents: [
          { name: 'Risk Scoring Agent', status: 'OPERATIONAL', latencyMs: 42, model: 'XGBoost + LLM' },
          { name: 'Authenticity & Integrity Agent', status: 'OPERATIONAL', latencyMs: 78, model: 'Multimodal Vision-Text' },
          { name: 'Review Moderation Agent', status: 'OPERATIONAL', latencyMs: 38, model: 'Graph-NLP Ensemble' }
        ]
      }));
      return;
    }

    // AUTH APIs
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await getJsonBody();
      let role = 'CUSTOMER';
      let name = 'Priya Sharma';

      if (email.includes('seller')) { role = 'SELLER'; name = 'TechMart Electronics'; }
      if (email.includes('admin')) { role = 'ADMIN'; name = 'Rajesh Kumar (Risk Lead)'; }

      const token = `jwt_trustshield_${role.toLowerCase()}_${Date.now()}`;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        token,
        user: { email, role, name, id: `usr_${Date.now()}` }
      }));
      return;
    }

    if (pathname === '/api/auth/me') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        user: { email: 'user@trustshield.ai', name: 'Priya Sharma', role: 'CUSTOMER' }
      }));
      return;
    }

    // CUSTOMER APIs
    if (pathname === '/api/customer/dashboard') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        customerName: 'Priya Sharma',
        verified: true,
        summary: { ordersPlaced: 12, safeOrders: 11, underReview: 1, blocked: 0 },
        riskScore: 12,
        riskLevel: 'LOW',
        recentOrders: ordersStore
      }));
      return;
    }

    if (pathname === '/api/orders') {
      if (req.method === 'POST') {
        const body = await getJsonBody();
        // Run Risk Agent Evaluation
        const evalResult = evaluateCheckoutRisk(body);

        const newOrder = {
          id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          customer: body.customerName || 'Priya Sharma',
          item: body.itemTitle || 'Marketplace Item',
          amount: body.amount || 1999,
          paymentMethod: body.paymentMethod || 'COD',
          status: evalResult.riskScore >= 75 ? 'BLOCKED' : (evalResult.riskScore >= 45 ? 'UNDER_REVIEW' : 'SAFE'),
          riskScore: evalResult.riskScore,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };

        ordersStore.unshift(newOrder);

        // If high risk, generate Fraud Case dynamically!
        if (evalResult.riskScore >= 45) {
          const newCase = {
            caseId: `CASE-${Math.floor(700000 + Math.random() * 100000)}`,
            type: 'Checkout / Return Risk',
            entity: `Order #${newOrder.id}`,
            reason: evalResult.explainability.plainLanguageRationale,
            riskScore: evalResult.riskScore,
            status: 'Under Review',
            assignedTo: 'Ananya Sharma',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            agent: 'Risk Scoring Agent',
            modelType: evalResult.modelType,
            explainability: evalResult.explainability.plainLanguageRationale,
            overrideReason: null
          };
          casesStore.unshift(newCase);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ order: newOrder, evaluation: evalResult }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ orders: ordersStore }));
      return;
    }

    // RISK AGENT API
    if (pathname === '/api/risk/score' && req.method === 'POST') {
      const body = await getJsonBody();
      const evalResult = evaluateCheckoutRisk(body);

      createAuditRecord({
        agentName: 'Risk Scoring Agent',
        actionTaken: evalResult.action,
        riskScore: evalResult.riskScore,
        confidenceScore: 0.96,
        modelType: evalResult.modelType,
        costUsd: evalResult.costUsd,
        latencyMs: evalResult.latencyMs,
        rationale: evalResult.explainability.plainLanguageRationale,
        features: evalResult.features
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(evalResult));
      return;
    }

    // SELLER APIs
    if (pathname === '/api/seller/dashboard') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        accountHealth: 86,
        orderDefectRate: 1.2,
        lateDispatchRate: 0.7,
        cancellationRate: 0.3,
        listingsSummary: { total: listingsStore.length, active: listingsStore.filter(l => l.status === 'ACTIVE').length, held: listingsStore.filter(l => l.status === 'HELD').length, rejected: listingsStore.filter(l => l.status === 'REJECTED').length },
        salesSummaryInr: 1840250,
        listings: listingsStore
      }));
      return;
    }

    if (pathname === '/api/authenticity/check' || pathname === '/api/seller/listings/check') {
      if (req.method === 'POST') {
        const body = await getJsonBody();
        const evalResult = evaluateListingAuthenticity(body);

        createAuditRecord({
          agentName: 'Authenticity & Integrity Agent',
          actionTaken: evalResult.action,
          riskScore: evalResult.riskScore,
          confidenceScore: 0.98,
          modelType: evalResult.modelType,
          costUsd: evalResult.costUsd,
          latencyMs: evalResult.latencyMs,
          rationale: evalResult.explainability.plainLanguageRationale,
          features: evalResult.features
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(evalResult));
        return;
      }
    }

    if (pathname === '/api/seller/listings') {
      if (req.method === 'POST') {
        const body = await getJsonBody();
        const evalResult = evaluateListingAuthenticity(body);

        const newListing = {
          id: `LST-${Math.floor(100 + Math.random() * 900)}`,
          title: body.title || 'New Product Listing',
          brand: body.brand || 'Generic',
          price: body.price || 1999,
          msrp: body.msrp || 4999,
          status: evalResult.riskScore >= 75 ? 'REJECTED' : (evalResult.riskScore >= 45 ? 'HELD' : 'ACTIVE'),
          authenticityScore: 100 - evalResult.riskScore,
          riskLevel: evalResult.severity,
          category: body.category || 'General'
        };

        listingsStore.unshift(newListing);

        if (evalResult.riskScore >= 45) {
          casesStore.unshift({
            caseId: `CASE-${Math.floor(700000 + Math.random() * 100000)}`,
            type: 'Counterfeit / Listing Abuse',
            entity: `Listing #${newListing.id} (${newListing.title})`,
            reason: evalResult.explainability.plainLanguageRationale,
            riskScore: evalResult.riskScore,
            status: 'Listing Held',
            assignedTo: 'Vikram Mehta',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            agent: 'Authenticity & Integrity Agent',
            modelType: evalResult.modelType,
            explainability: evalResult.explainability.plainLanguageRationale,
            overrideReason: null
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ listing: newListing, evaluation: evalResult }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ listings: listingsStore }));
      return;
    }

    // REVIEW MODERATION API
    if (pathname === '/api/reviews/analyze' || pathname === '/api/reviews') {
      if (req.method === 'POST') {
        const body = await getJsonBody();
        const evalResult = evaluateReviewSubmission(body);

        createAuditRecord({
          agentName: 'Review Moderation Agent',
          actionTaken: evalResult.action,
          riskScore: evalResult.riskScore,
          confidenceScore: 0.94,
          modelType: evalResult.modelType,
          costUsd: evalResult.costUsd,
          latencyMs: evalResult.latencyMs,
          rationale: evalResult.explainability.plainLanguageRationale,
          features: evalResult.features
        });

        if (evalResult.riskScore >= 50) {
          casesStore.unshift({
            caseId: `CASE-${Math.floor(700000 + Math.random() * 100000)}`,
            type: 'Fake Review Ring',
            entity: `Review Cluster #${Math.floor(100 + Math.random() * 900)}`,
            reason: evalResult.explainability.plainLanguageRationale,
            riskScore: evalResult.riskScore,
            status: 'Investigating',
            assignedTo: 'Rajesh Kumar',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            agent: 'Review Moderation Agent',
            modelType: evalResult.modelType,
            explainability: evalResult.explainability.plainLanguageRationale,
            overrideReason: null
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(evalResult));
        return;
      }
    }

    // MULTI-AGENT ORCHESTRATOR API
    if (pathname === '/api/orchestrator/analyze' || pathname === '/api/v1/evaluate') {
      const body = await getJsonBody();
      const result = await orchestrateEvaluation(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // ADMIN APIs
    if (pathname === '/api/admin/dashboard' || pathname === '/api/v1/cases') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        kpis: { ordersScanned: 12840, highRiskOrders: 243, counterfeitListings: 61, fakeReviewsDetected: 1208, estimatedMoneySavedInr: 1840250 },
        cases: casesStore,
        alerts: alertsStore,
        riskySellers: riskySellersStore
      }));
      return;
    }

    if (pathname.startsWith('/api/admin/cases/') && pathname.endsWith('/override') && req.method === 'POST') {
      const parts = pathname.split('/');
      const caseId = parts[4];
      const { overrideDecision, overrideReason } = await getJsonBody();

      const foundCase = casesStore.find(c => c.caseId === caseId);
      if (foundCase) {
        foundCase.status = overrideDecision === 'APPROVE' ? 'Approved' : 'Rejected';
        foundCase.overrideReason = overrideReason;

        createAuditRecord({
          agentName: 'ADMIN_OVERRIDE_HUMAN',
          actionTaken: `OVERRIDE_${overrideDecision}`,
          riskScore: foundCase.riskScore,
          confidenceScore: 1.0,
          modelType: 'Human Admin Override',
          costUsd: 0,
          latencyMs: 10,
          rationale: `Human Admin override applied. Decision: ${overrideDecision}. Rationale: "${overrideReason}"`,
          features: { caseId, overrideReason }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, case: foundCase }));
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Case not found' }));
        return;
      }
    }

    if (pathname === '/api/admin/audit-logs' || pathname === '/api/v1/audit-trail') {
      const logs = getAuditLogs();
      const verification = verifyChainIntegrity();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ auditLogs: logs, verification }));
      return;
    }

    if (pathname === '/api/admin/fairness' || pathname === '/api/v1/fairness') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(fairnessMetricsStore));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));

  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🛡️ TrustShield AI API Gateway & Microservices Server running on port ${PORT}`);
    console.log(`📍 Data Sovereignty: Pinned to ap-south-1 (India VPC)`);
  });
}

module.exports = server;
