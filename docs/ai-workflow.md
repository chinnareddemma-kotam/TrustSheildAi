# TrustShield AI - Multi-Agent Workflow & Explainability Engine

This document details the decision flows, model routing logic, explainability rules, and admin override workflow across the three cooperating AI agents.

## 1. Risk Scoring Agent Workflow (Checkout Risk & COD Abuse)

### Input Features Evaluated
- `amount`: Order value in INR
- `paymentMethod`: `COD` | `UPI` | `CreditCard` | `NetBanking`
- `ipVelocity`: Orders initiated from IP subnet within 10 minutes
- `codRefusalRate`: Historical doorstep refusal percentage (0.0 to 1.0)
- `deviceMatch`: Boolean fingerprint match against registered devices
- `addressMismatch`: High return-fraud PIN code cluster flag

### Decision Matrix & Model Routing
- **Risk Score < 45**: Decision = `ALLOW` | Model = `SLM (XGBoost Fast)` | Latency ~40ms
- **45 <= Risk Score <= 75**: Decision = `HELD FOR REVIEW` | Model = `LLM (Deep Context)` | Latency ~140ms
- **Risk Score > 75**: Decision = `BLOCK` | Model = `LLM (Deep Context)` | Latency ~180ms

### Plain-Language Rationale Template
```
Order flagged with Risk Score {score}/100 [{severity}]. Primary factors:
High IP velocity ({ipVelocity} orders in 10 mins); Historical COD refusal rate exceeds threshold ({codRefusalRate}%);
Unrecognized device fingerprint paired with high-value order.
```

---

## 2. Authenticity & Integrity Agent Workflow (Counterfeit Detection)

### Input Features Evaluated
- `title` & `brand`: Product listing metadata
- `price` vs `msrp`: Price variance against registered brand MSRP
- `logoSimilarity`: Vision embedding similarity (0.0 to 1.0)
- `missingBrandAuth`: Missing official brand authorization letter flag
- `uncertifiedCosmetics`: Uncertified chemical formulation flag

### Trigger Rules
- **Price Variance > 50% below MSRP**: +35 Risk Points
- **Logo Similarity < 0.60**: +40 Risk Points
- **Missing Brand Auth**: +30 Risk Points

---

## 3. Review Moderation Agent Workflow (Fake Review Rings)

### Input Features Evaluated
- `reviewText`: Text content scanned for synthetic AI markers
- `burstVelocity`: Number of reviews posted to same seller in 5-minute window
- `graphDegreeCentrality`: Graph degree centrality metric (0.0 to 1.0)
- `aiTextProbability`: DistilBERT NLP synthetic text probability (0.0 to 1.0)

---

## 4. Human Admin Override Workflow

When a human security admin overrides an AI decision:
1. Admin selects `APPROVE` or `REJECT` in the Case Management Console.
2. Admin enters a mandatory plain-language rationale (`overrideReason`).
3. Backend API emits an immutable audit event tagged with `agentName: "ADMIN_OVERRIDE_HUMAN"`.
4. Cryptographic SHA-256 hash chain updates to preserve full chain integrity.
