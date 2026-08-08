# TrustShield AI 🛡️

### AI-Powered Trust & Safety Platform for Online Marketplaces

**TrustShield AI** is an enterprise-grade AI-powered Trust & Safety platform designed to protect online marketplaces from **transaction fraud, COD abuse, return abuse, counterfeit products, fake reviews, and coordinated review manipulation**.

The platform combines **multi-agent AI, behavioral risk analysis, computer vision, review intelligence, explainable AI, verified-purchase protection, and secure audit trails** into a unified marketplace security system.

---

## 🚀 Key Capabilities

* 🤖 Multi-agent AI Trust & Safety architecture
* 💳 Transaction and checkout fraud detection
* 📦 COD refusal and return-abuse detection
* 🏷️ Counterfeit product detection
* ⭐ Fake and manipulated review detection
* ✅ Verified-purchase-only reviews
* 👤 Customer Trust Score
* 🏪 Seller Trust Score
* 🛍️ Product Safety Score
* 🧠 Explainable AI decisions
* 🔍 Fraud-ring investigation
* 🕸️ Customer–Seller–Product relationship analysis
* 🔐 Secure audit trails
* ⚡ Real-time risk monitoring
* 👨‍💼 Human-in-the-loop investigation
* 📊 Enterprise Trust & Safety dashboards

---

# 🏗️ System Architecture

```text
                         TRUSTSHIELD AI
                              │
                              ▼
                    ┌───────────────────┐
                    │   React Frontend  │
                    │ Customer / Seller │
                    │      / Admin      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    API Gateway    │
                    │ Authentication &  │
                    │    Rate Limits    │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Multi-Agent       │
                    │ Orchestrator      │
                    │     LangGraph     │
                    └─────────┬─────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
      ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
      │ Risk Agent  │ │ Authenticity │ │ Review Agent │
      │             │ │    Agent     │ │              │
      └──────┬──────┘ └──────┬───────┘ └──────┬───────┘
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                    ┌───────────────────┐
                    │ AI Decision       │
                    │ Gateway           │
                    └─────────┬─────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                   SLM       LLM       HITL
                              │
                              ▼
                    ┌───────────────────┐
                    │ Explainability    │
                    │ Engine / SHAP      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Audit Trail       │
                    │ SHA-256 Hash Chain │
                    └───────────────────┘
```

---

# 🤖 AI Agents

## 1. Risk Scoring Agent

Analyzes customer and transaction behavior to identify potentially fraudulent transactions.

### Signals

* Transaction amount
* Payment method
* COD history
* Customer trust score
* Order velocity
* Location risk
* IP/session behavior
* Device fingerprint
* Historical transaction patterns
* Return/refusal behavior

### Output

```text
Risk Score: 0–100

LOW       → Approve
MEDIUM    → Additional verification
HIGH      → Manual review / Block
```

---

## 2. Authenticity & Counterfeit Agent

Protects marketplaces from counterfeit and unauthorized products.

### Analysis

* Product image similarity
* Brand/logo similarity
* Price vs MSRP anomaly
* Product metadata
* Seller authorization
* Brand certificates
* Product embeddings
* Vector similarity

### Example

```text
Product: Premium Wireless Earbuds

Price: ₹2,999
MSRP: ₹24,900

Logo Match: 94%
Price Anomaly: HIGH
Seller Authorization: FAILED

Counterfeit Probability: 98%

Decision: HOLD
```

---

## 3. Review Moderation Agent

Detects fake reviews and coordinated review manipulation.

### Signals

* Review text similarity
* Review timing
* Rating bursts
* Reviewer behavior
* Review velocity
* Account age
* Product relationship
* Review clusters
* Suspicious reviewer networks
* Verified-purchase status

### Important Protection

Only customers with a **delivered purchase for the product** can submit a review.

```text
Customer
   │
   ▼
Delivered Order?
   │
 ┌─┴─┐
YES  NO
 │    │
 ▼    ▼
Review  BLOCK
Allowed
```

---

# 🧠 Multi-Agent Orchestration

TrustShield AI does not allow individual agents to make isolated final decisions.

Instead:

```text
Risk Agent
     │
Authenticity Agent
     │
Review Agent
     │
     ▼
AI Decision Gateway
     │
     ▼
Global Confidence Score
     │
 ┌───┼───────────┐
 ▼   ▼           ▼
SLM LLM       Human Review
```

### Confidence Routing

* **High confidence** → Local/Small Language Model
* **Medium confidence** → Large Language Model
* **Low confidence** → Human investigation
* **Model/API failure** → Safe fallback model or deterministic rules

This improves **latency, cost efficiency, reliability, and decision quality**.

---

# 👤 Customer Dashboard

Customers receive a dedicated marketplace safety experience.

### Features

* Customer Trust Score
* Order history
* Order risk analysis
* Safe checkout recommendations
* Fraud protection
* Notifications
* Review eligibility
* Verified purchase badge
* Review submission
* Account activity
* Privacy information

### Example

```text
Customer Trust Score

        92
     ────────
      TRUSTED

Safe Orders: 24
Returns: 1
COD Refusals: 0
Verified Reviews: 12
```

---

# 🏪 Seller Dashboard

Sellers receive marketplace integrity analytics.

### Features

* Seller Trust Score
* Product Safety Score
* Product listing health
* Counterfeit detection
* Brand authorization
* Review analytics
* Verified vs unverified review statistics
* AI listing advisor
* Listing approval status
* Product risk alerts
* Seller notifications

---

# 🛡️ Admin Trust & Safety Center

The Admin dashboard provides a centralized security operations center.

### Features

* Real-time fraud KPIs
* Fraud detection statistics
* Counterfeit investigations
* Fake review investigations
* Fraud-ring visualization
* Customer/Seller/Product relationship graph
* Investigation timeline
* AI decision replay
* Human overrides
* SHAP explanations
* Audit trail
* Model monitoring
* AI cost monitoring
* System health
* RAG investigation assistant
* PDF investigation reports

---

# 📊 Trust Scores

TrustShield AI calculates three major trust indicators.

### Customer Trust Score

```text
0 ─────────────── 100
│       │          │
Risky   Moderate   Trusted
```

Based on:

* Purchase history
* Returns
* COD refusals
* Account behavior
* Review behavior
* Transaction risk

### Seller Trust Score

Based on:

* Product authenticity
* Customer complaints
* Review patterns
* Listing behavior
* Brand authorization
* Counterfeit history

### Product Safety Score

```text
SAFE       🟢
CAUTION    🟡
HIGH RISK  🔴
```

---

# 🛒 Intelligent Checkout Protection

TrustShield AI does more than simply approve or reject an order.

For moderate/high-risk orders, the platform can recommend safer actions:

```text
High Risk Transaction

Risk Score: 82

AI Recommendation:

✓ Switch COD → Prepaid
✓ Enable OTP verification
✓ Confirm delivery location
✓ Additional identity verification
```

This reduces unnecessary customer rejection while maintaining marketplace security.

---

# 🔐 Privacy Architecture

Customers **do not need to manually provide their IP address or device information**.

The backend securely captures required signals from the request/session.

```text
Customer
   │
   │ Customer ID
   ▼
FastAPI Backend
   │
   ├── IP/session metadata
   ├── User-Agent
   └── Device/session fingerprint
          │
          ▼
      Hash / Protect
          │
          ▼
      Risk Engine
```

Sensitive identifiers are never exposed unnecessarily in the frontend.

---

# ⭐ Verified Purchase Protection

TrustShield AI prevents users from posting reviews for products they never purchased.

### Review flow

```text
Customer selects product
          │
          ▼
Check customer orders
          │
          ▼
Delivered order exists?
       /       \
     YES        NO
      │          │
      ▼          ▼
Allow Review   Block Review
      │
      ▼
verified_purchase = TRUE
```

This significantly reduces simple review-manipulation attacks.

---

# 🕸️ Fraud Ring Detection

TrustShield AI can analyze relationships between:

```text
Customer
   │
   ├── Device
   ├── Session
   ├── IP Hash
   ├── Review
   └── Order
          │
          ▼
       Product
          │
          ▼
        Seller
```

Suspicious clusters can be visualized as investigation graphs.

Example:

```text
Customer A ─────┐
Customer B ─────┼── Shared Device ── Suspicious Cluster
Customer C ─────┤
Customer D ─────┘
```

---

# 🔎 Explainable AI

Every important AI decision provides an explanation.

Example:

```text
Risk Score: 87

Why?

+ High COD refusal history
+ Unusual order velocity
+ High transaction amount
+ Suspicious session behavior

Recommendation:
Additional verification required.
```

SHAP-based feature importance can be used where applicable.

---

# 👨‍💼 Human-in-the-Loop

AI decisions can be reviewed by authorized administrators.

```text
AI Decision
     │
     ▼
Manual Review
     │
 ┌───┴────┐
 ▼        ▼
Approve   Reject
     │
     ▼
Audit Trail
     │
     ▼
Future Model Improvement
```

Admin overrides are recorded for governance and future model improvement.

---

# 📚 RAG Investigation Assistant

Administrators can query marketplace intelligence through an AI investigation assistant.

The assistant can retrieve information from:

* Marketplace policies
* Brand documentation
* Seller authorization records
* Audit logs
* Investigation records
* Trust & Safety knowledge base

Vector search is provided using **Qdrant**.

---

# 🧬 Model Governance

TrustShield AI monitors AI models throughout their lifecycle.

Tracked metrics include:

* Model version
* Training date
* Precision
* Recall
* F1-score
* Inference latency
* Prediction distribution
* Feature drift
* Model usage
* SLM vs LLM routing
* Estimated inference cost

---

# 📈 Enterprise Analytics

The platform provides business-level Trust & Safety metrics:

* Revenue protected
* Fraud prevented
* Counterfeit listings blocked
* Fake reviews blocked
* Orders investigated
* Estimated money saved
* Customer trust growth
* Seller trust growth
* AI inference cost
* AI latency
* Manual review volume

---

# ⚡ Real-Time Monitoring

FastAPI WebSockets can provide real-time dashboard updates.

```text
Digital Twin / Marketplace Events
              │
              ▼
          Event Engine
              │
              ▼
          WebSocket
              │
              ▼
       React Dashboards
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
   Customer Seller  Admin
```

---

# 🧪 Dataset Integration

TrustShield AI is designed around three major Trust & Safety data domains:

### IEEE-CIS Fraud Detection

Used for:

* Transaction fraud modeling
* Device behavior
* Transaction patterns
* Fraud risk scoring

### OpSpam

Used for:

* Fake review detection
* Review spam classification
* Review manipulation analysis

### Counterfeit Product Dataset

Used for:

* Product authenticity
* Image similarity
* Counterfeit detection
* Brand/logo analysis

Dataset files are kept outside the Git repository when licensing, size, or access restrictions apply.

---

# 🗄️ Data Layer

### PostgreSQL

Primary transactional database for:

* Users
* Customers
* Sellers
* Products
* Orders
* Reviews
* Notifications
* Risk scores
* Audit logs

### Redis

Used for:

* Caching
* Rate limiting
* Sessions
* Background task coordination

### Qdrant

Used for:

* Product embeddings
* Brand knowledge
* Logo embeddings
* Investigation RAG
* Similarity search

---

# ⚙️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* Lucide React
* Framer Motion
* React Flow / graph visualization

## Backend

* FastAPI
* Python
* SQLAlchemy
* PostgreSQL
* Redis
* Celery
* WebSockets

## AI / ML

* Scikit-learn
* LightGBM
* PyTorch
* Transformers
* OpenCV
* SHAP
* LangGraph
* LangChain
* Qdrant

## DevOps

* Docker
* Docker Compose
* GitHub Actions

---

# 📁 Project Structure

```text
TrustShieldAI/
│
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── risk/
│   │   │   ├── authenticity/
│   │   │   └── review/
│   │   ├── routers/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── orchestrator.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── customer/
│   │   │   ├── seller/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── ml/
│   ├── fraud/
│   ├── review/
│   ├── counterfeit/
│   ├── explainability/
│   └── models/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── synthetic/
│
├── qdrant/
│
├── scripts/
│   ├── seed.py
│   ├── train_models.py
│   └── digital_twin.py
│
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

# 🔑 Role-Based Access Control

TrustShield AI separates the platform into role-specific experiences.

| Role        | Main Responsibility                |
| ----------- | ---------------------------------- |
| Customer    | Safe purchasing & verified reviews |
| Seller      | Product and seller integrity       |
| Reviewer    | Trust & Safety investigation       |
| Admin       | Marketplace security operations    |
| Super Admin | Platform governance                |

Each API endpoint validates the authenticated user's role and permissions.

---

# 🔒 Security

Security controls include:

* JWT authentication
* Refresh tokens
* Role-based authorization
* Password hashing
* API rate limiting
* Input validation
* Secure session handling
* IP/device hashing
* Audit logging
* Cryptographic hash chains
* Human override tracking
* Environment-based secrets
* CORS configuration
* Security headers

---

# 🧪 Testing

Run backend tests using:

```bash
pytest
```

Run frontend tests using the configured frontend test framework.

Recommended test areas:

* Authentication
* RBAC
* Order risk scoring
* Verified purchase validation
* Review moderation
* Counterfeit detection
* AI routing
* API security
* Audit logs
* WebSocket events

---

# 🐳 Docker Deployment

The project is designed to support containerized deployment.

Start services:

```bash
docker compose up --build
```

Expected services:

```text
Frontend
Backend API
PostgreSQL
Redis
Qdrant
Celery Worker
```

---

# 🌐 Local Development

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trustshield
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333

JWT_SECRET=change-this-secret

LLM_API_KEY=your-api-key
```

**Never commit real API keys, passwords, database credentials, or private datasets to GitHub.**

---

# 📌 Project Status

TrustShield AI is being developed as an enterprise-oriented Trust & Safety marketplace platform.

Current development areas include:

* Multi-role dashboards
* AI risk scoring
* Counterfeit detection
* Review moderation
* Verified purchases
* Multi-agent orchestration
* Explainable AI
* Fraud investigation
* Real-time monitoring
* RAG investigation assistant
* Model governance
* Enterprise security

---

# 🎯 Vision

TrustShield AI aims to transform marketplace Trust & Safety from reactive moderation into **proactive, explainable, AI-driven marketplace protection**.

Instead of relying on a single fraud model, the platform combines:

**Behavior + Transactions + Products + Reviews + Relationships + AI Explainability + Human Oversight**

to create a safer marketplace for customers, sellers, and platform operators.

---

## 🛡️ TrustShield AI

**Detect → Investigate → Explain → Protect**

Built for safer, smarter and more trustworthy marketplaces.
