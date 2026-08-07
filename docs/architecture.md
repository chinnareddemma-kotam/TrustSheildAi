# TrustShield AI - Platform Architecture & Data Flow

TrustShield AI is an autonomous, multi-agent Trust & Safety platform designed to defend e-commerce marketplaces against transaction fraud, return abuse, empty-box claims, counterfeit listings, and review manipulation rings.

## System Architecture Diagram

```
                              [ React Frontend Dashboard ]
                                          |
                                          | HTTPS / REST APIs
                                          v
                                 [ API Gateway Server ]
                                (Port 4000 / Rate Limiter)
                                          |
          +-------------------------------+-------------------------------+
          |                               |                               |
          v                               v                               v
  [ Risk Scoring API ]          [ Authenticity API ]            [ Review Moderation API ]
  POST /api/risk/score          POST /api/authenticity/check    POST /api/reviews/analyze
          |                               |                               |
          +-------------------------------+-------------------------------+
                                          |
                                          v
                            [ Multi-Agent Orchestrator ]
                            (Parallel Fan-out + Latency SLA)
                                          |
              +---------------------------+---------------------------+
              |                           |                           |
              v                           v                           v
     [ Risk Scoring Agent ]     [ Authenticity Agent ]     [ Review Moderation Agent ]
     - XGBoost Fast Model       - Multimodal CLIP Vision   - Graph Degree Centrality
     - LLM Deep Context         - MSRP Variance Engine     - NLP Synthetic Detector
              |                           |                           |
              +---------------------------+---------------------------+
                                          |
                                          v
                              [ Explainability Engine ]
                              (DPDP Compliant Rationale)
                                          |
                                          v
                            [ SHA-256 Audit Logger ]
                            (Immutable Hash Chain)
                                          |
                                          v
                            [ PostgreSQL + Prisma DB ]
```

## Core Components

### 1. API Gateway & Microservices Layer
- **Port**: 4000
- **Rate Limiter**: Token bucket (100 req/sec capacity)
- **Data Sovereignty Headers**: `X-TrustShield-Data-Sovereignty: Region: ap-south-1 (India VPC)`
- **DPDP Compliance**: Enforces explicit human-readable rationales for every automated decision.

### 2. Multi-Agent Orchestrator
- Coordinates parallel execution across all 3 AI agents.
- **Latency SLA**: Guarantees total evaluation under 250ms for checkout risk.
- **Model Routing**: Small Language Models (SLMs) for rapid standard evaluations; escalation to Large Language Models (LLMs) for complex borderline cases.

### 3. Cooperating AI Agents
1. **Risk Scoring Agent**: IEEE-CIS Fraud dataset calibrated model evaluating IP velocity, COD refusal rate history, device fingerprinting, and shipping PIN risk.
2. **Authenticity & Integrity Agent**: Multimodal Vision-Text model inspecting logo geometry match, price-to-MSRP ratio variance, and seller brand authorization documents.
3. **Review Moderation Agent**: Graph network degree centrality model identifying co-citation reviewer clusters, burst submission velocity, and synthetic text probability.

### 4. Explainability & Audit Trail Generator
- Converts vector outputs and numerical risk scores into human-readable plain language rationales.
- Generates cryptographically linked SHA-256 hash chains for all AI decisions and human admin overrides.
