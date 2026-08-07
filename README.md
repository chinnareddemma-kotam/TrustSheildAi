<<<<<<< HEAD
# TrustShield AI - AI-Powered Trust & Safety Marketplace Platform

**TrustShield AI** is an enterprise-grade multi-role Trust & Safety e-commerce platform designed to defend online marketplaces against transaction fraud, return abuse, empty-box claims, COD doorstep refusal, counterfeit product listings, and fake review manipulation rings.

Powered by **Three Cooperating AI Agents** coordinated through a real-time **Multi-Agent Orchestrator**, TrustShield AI delivers explainable, low-latency (<250ms SLA) risk scoring and cryptographic audit trails compliant with India's DPDP Act.

---

## 🚀 Demo Credentials & Quick Role Switcher

The application features **THREE completely different user experiences**:

| Role | Email | Password | Redirect Target | Design Theme |
| :--- | :--- | :--- | :--- | :--- |
| **CUSTOMER** | `customer@trustshield.ai` | `customer123` | `/customer/dashboard` | Light UI (Purple/Indigo accents) |
| **SELLER** | `seller@trustshield.ai` | `seller123` | `/seller/dashboard` | Light UI (Emerald/Green accents) |
| **ADMIN** | `admin@trustshield.ai` | `admin123` | `/admin/dashboard` | Dark Enterprise UI (Navy/Purple) |

*A "Demo Credentials" auto-fill button is present on the unified login screen.*

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend Gateway**: Node.js, Express, REST APIs, Rate Limiting (Token Bucket).
- **Database ORM**: Prisma ORM, PostgreSQL schema (`prisma/schema.prisma`), Seed engine (`prisma/seed.js`).
- **AI Architecture**: Microservices API endpoints for Risk Scoring Agent, Authenticity & Integrity Agent, Review Moderation Agent, Multi-Agent Orchestrator, Explainability Engine, and Cryptographic SHA-256 Audit Log Generator.

---

## 🤖 Core AI Agents & Architecture

```
React Dashboard  --->  API Gateway (Port 4000)  --->  Multi-Agent Orchestrator
                                                            |
                                    +-----------------------+-----------------------+
                                    |                       |                       |
                                    v                       v                       v
                           Risk Scoring Agent       Authenticity Agent     Review Moderation Agent
                           - IEEE-CIS Fraud Model   - Multimodal Vision    - Graph NLP Ensemble
                           - <250ms Latency SLA     - MSRP Variance        - Ring Detector
                                    |                       |                       |
                                    +-----------------------+-----------------------+
                                                            |
                                                            v
                                                Explainability Engine
                                                            |
                                                            v
                                               SHA-256 Audit Log Generator
```

1. **Risk Scoring Agent**: Evaluates IP velocity, COD refusal rate history, device fingerprinting, and shipping PIN risk.
2. **Authenticity & Integrity Agent**: Multimodal Vision-Text model inspecting logo geometry match, price-to-MSRP ratio variance, and seller brand authorization documents.
3. **Review Moderation Agent**: Graph network degree centrality model identifying co-citation reviewer clusters, burst submission velocity, and synthetic text probability.
4. **Multi-Agent Orchestrator**: Coordinates parallel execution across all agents under a <250ms SLA budget.
5. **Explainability Engine**: Provides human-readable plain language rationales for every automated decision.
6. **Audit Trail Generator**: Maintains cryptographically linked SHA-256 hash chains for all AI decisions and human admin overrides.

---

## 📦 Setup & Running Locally

### 1. Start API Gateway Backend Server
```bash
# In the project root or gateway directory
node gateway/api_gateway.js
```
*Backend runs on `http://localhost:4000`*

### 2. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🎬 Recommended 8-Minute Demo Walkthrough Flow

1. **Step 1: Landing Page**: Open landing page showcasing platform capabilities, metrics, and agent cards.
2. **Step 2: Login as Seller**: Select **Seller** tab and click "Auto-fill Demo Credentials". Open "AI Listing Pre-Check" and submit a suspicious item (AirPods Pro at ₹2,999 vs ₹24,900 MSRP). Authenticity Agent flags listing as `HELD` with 98% counterfeit probability.
3. **Step 3: Login as Customer**: Select **Customer** tab. Open "Simulate Checkout Risk Live" to test COD payment with high IP velocity. Risk Scoring Agent scores transaction 89 `UNDER_REVIEW`.
4. **Step 4: Login as Admin**: Select **Admin** tab to view the dark enterprise ops console.
5. **Step 5: View Agent Pages & Orchestrator**: Navigate to Risk Agent, Authenticity Agent, Review Moderation Agent (with review ring network graph), and AI Orchestrator.
6. **Step 6: Perform Admin Override**: Open Case `CASE-784511`, enter mandatory override rationale, and click "Confirm Admin Override".
7. **Step 7: Check Audit Trail**: Open Audit Trail tab to verify the cryptographically linked SHA-256 hash chain record of the human override.

---

## 🛡️ Security & Compliance
- **Data Sovereignty**: All API responses output `X-TrustShield-Data-Sovereignty: Region: ap-south-1 (India VPC)`.
- **Fairness & Guardrails**: Enforces equal false-positive rates for small/new vs established sellers.
=======
# TrustSheildAi
TrustShieldAI is an AI-powered Trust &amp; Safety platform for online marketplaces. It uses multi-agent AI to detect transaction fraud, COD/return abuse, counterfeit products, and fake reviews. Risk, Authenticity, and Review agents provide real-time risk scoring, explainable decisions, verified-purchase protection, and secure audit trails at scale.
>>>>>>> 321d13fde3a9eeb798dcc48c81d9cba6f9c2552b
