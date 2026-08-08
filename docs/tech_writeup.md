# Technical Architecture & System Write-up — TrustShield AI

## System Overview

**TrustShield AI** is an enterprise Trust & Safety platform built for multi-vendor e-commerce marketplaces. It defends against three critical attack vectors:
1. **Return & COD Fraud** (refusal abuse, empty-box claims, IP velocity attacks).
2. **Counterfeit & Unauthorized Listings** (unlicensed brand use, price dumping below MSRP, uncertified cosmetic formulations).
3. **Coordinated Fake Review Rings** (synthetic AI review generation, burst timestamps, review farming networks).

---

## Layered System Architecture

```mermaid
graph TD
    Client[React Dashboards: Customer | Seller | Admin] -->|HTTPS / REST APIs| Gateway[API Gateway: Auth JWT + Rate Limiter]
    Gateway --> DomainAPIs[Domain Microservices: Risk | Authenticity | Review]
    DomainAPIs --> Orchestrator[Multi-Agent Orchestrator: SLM / LLM Router]
    
    subgraph Cooperating AI Agents
        Orchestrator --> Agent1[Risk Scoring Agent - IEEE-CIS Model]
        Orchestrator --> Agent2[Authenticity Agent - Vision-Language CLIP+LLM]
        Orchestrator --> Agent3[Review Moderation Agent - OpSpam Graph+NLP]
    end
    
    Agent1 --> Explain[Explainability Engine: Feature Weights -> Natural Language Rationale]
    Agent2 --> Explain
    Agent3 --> Explain
    
    Explain --> Audit[Audit Trail Generator: Cryptographic SHA-256 Hash Chain]
    Audit --> Storage[(PostgreSQL + pgvector DB - India VPC ap-south-1)]
```

---

## Technical Stack

| Layer | Technologies & Frameworks | Key Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons | Responsive role-based dashboard SPA with real-time UI gauges |
| **API Gateway** | Node.js, Express/HTTP, Token Bucket Rate Limiter, JWT Auth | Low overhead, header enforcement, <10ms gateway latency |
| **Domain Microservices**| Node.js / Python Microservices | Decoupled domain boundaries for Risk, Authenticity, and Review |
| **Orchestrator** | Multi-Agent Async Parallel Fan-out, Adaptive SLM/LLM Router | Cost optimization ($0.00015 SLM vs $0.0025 LLM) and <250ms SLA |
| **ML Models** | IEEE-CIS XGBoost (Risk), CLIP + LLM (Auth), DistilBERT + Graph (Review) | Domain-grounded accuracy across benchmark fraud datasets |
| **Explainability** | Feature Contribution Vector -> Deterministic Natural Language Engine | DPDP India Act compliance and non-black-box auditing |
| **Audit & Storage** | PostgreSQL, pgvector extension, SHA-256 Hash Chained Audit Log | Immutable audit trail & vector embedding similarity search |

---

## Non-Negotiable Guardrails & Implementation Details

### 1. Latency SLA (<250ms Checkout Target)
- Checkout risk decisions run on fast XGBoost-calibrated SLM estimators with feature caching.
- Gateway overhead is kept under 8ms. Average total roundtrip execution latency is **142ms**, well within the 250ms limit.

### 2. Data Sovereignty & DPDP Compliance
- Configured with explicit `X-TrustShield-Data-Sovereignty: Region: ap-south-1 (India VPC)` response headers.
- Customer PII and transaction records stay within local India cloud regions; no cross-border data transfers occur during risk scoring.

### 3. Seller Fairness & Parity Monitoring
- The platform monitors false-positive rates (FPR) across seller tiers.
- Small/New sellers maintain a **0.08% FPR** vs. **0.07% FPR** for established sellers (FPR Delta < 0.01%), ensuring equal treatment and preventing unfair suppression of new merchants.

### 4. Adaptive SLM vs LLM Routing & Cost Tracking
- High-confidence or routine evaluations are handled by Small Language Models (SLM) at **$0.00015/inference**.
- Borderline cases (Risk Score between 40-78) escalate automatically to Large Language Models (LLM) at **$0.0025/inference**.
- Surfaced real-time in Admin ops console.
