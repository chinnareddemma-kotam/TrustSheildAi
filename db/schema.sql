-- TrustShield AI Database Schema (PostgreSQL + pgvector extension)
-- Data Sovereignty: India VPC / AWS ap-south-1 Pinned Region

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users & Roles (Customer, Seller, Admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('customer', 'seller', 'admin')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_region VARCHAR(50) DEFAULT 'in-south-1' NOT NULL -- DPDP compliance data sovereignty tag
);

-- 2. Sellers Table (Track seller tier, health metrics, fairness parity)
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    store_name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) CHECK (tier IN ('New', 'Silver', 'Gold', 'Platinum')) DEFAULT 'New',
    account_health_score INT DEFAULT 100,
    order_defect_rate DECIMAL(5,2) DEFAULT 0.00,
    late_dispatch_rate DECIMAL(5,2) DEFAULT 0.00,
    cancellation_rate DECIMAL(5,2) DEFAULT 0.00,
    is_established BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Listings & Authenticity Embeddings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES sellers(id),
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    msrp DECIMAL(10,2) NOT NULL,
    image_url TEXT NOT NULL,
    image_embedding vector(512), -- Vision-language vector representation
    status VARCHAR(50) CHECK (status IN ('Active', 'Under Review', 'Rejected', 'Listing Held')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions & Orders (For Risk Scoring)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES sellers(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('COD', 'UPI', 'CreditCard', 'NetBanking')),
    ip_address VARCHAR(45) NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    shipping_address_pincode VARCHAR(10) NOT NULL,
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    status VARCHAR(50) CHECK (status IN ('Delivered', 'Under Review', 'Cancelled', 'Blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reviews (OpSpam & Graph Ring Detection)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id),
    customer_id UUID REFERENCES users(id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    review_vector vector(384), -- NLP embedding
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_ring_coordinated BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) CHECK (status IN ('Approved', 'Flagged', 'Removed')) DEFAULT 'Approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Cases & Flagged Anomalies
CREATE TABLE cases (
    id VARCHAR(50) PRIMARY KEY,
    case_type VARCHAR(100) NOT NULL, -- Return Fraud, COD Abuse, Counterfeit, Fake Review Ring
    entity_type VARCHAR(50) NOT NULL, -- Order, Listing, Review, Seller
    entity_id VARCHAR(255) NOT NULL,
    risk_score INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Under Review', 'Listing Held', 'Investigating', 'Pending', 'Resolved')) DEFAULT 'Under Review',
    assigned_to VARCHAR(100) DEFAULT 'Unassigned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Deterministic Audit Trail (Cryptographically Hash-Chained Log)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    agent_name VARCHAR(100) NOT NULL, -- Risk Scoring Agent, Authenticity Agent, Review Moderation Agent
    action_taken VARCHAR(100) NOT NULL,
    risk_score INT NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- SLM, LLM
    cost_usd DECIMAL(8,6) NOT NULL,
    execution_latency_ms INT NOT NULL,
    plain_language_rationale TEXT NOT NULL,
    feature_contributions JSONB NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
