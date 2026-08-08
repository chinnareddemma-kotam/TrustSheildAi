# TrustShield AI — Dataset & AI Model Integration Architecture

This document describes the AI dataset schemas, adapter interfaces, and model training specifications for TrustShield AI.

> **Status Notice**: DEMO AI ADAPTER — DATASET NOT CONFOUND/CONFIGURED  
> In local demo mode, TrustShield AI uses deterministic rule & heuristic-assisted demo adapters. The architecture is modularly designed so that these demo adapters can be swapped with trained PyTorch / ONNX / XGBoost models trained on the datasets documented below.

---

## 1. Required Datasets & Schemas

### A. Risk Scoring Agent
- **IEEE-CIS Fraud Detection Dataset**: Features user IP velocity, transaction amount, V1-V339 anonymized features, device type, and postal code.
- **Kaggle E-Commerce Fraud Dataset**: Features buyer historical purchase count, COD doorstep refusal rate, payment method risk vector, time-delta between sign-up and checkout.
- **Adapter Interface**:
  ```typescript
  interface RiskDatasetAdapter {
    loadModel(weightsPath: string): Promise<void>;
    evaluate(features: {
      customerRefusalRate: number;
      orderAmount: number;
      paymentMethod: 'UPI' | 'CARD' | 'COD';
      ipVelocity: number;
      shippingPinRisk: number;
    }): Promise<{
      riskScore: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      explanation: string;
    }>;
  }
  ```

### B. Authenticity & Integrity Agent
- **Counterfeit Product & Logo Detection Dataset**: Deep learning vision embeddings matching product image logos against authentic brand vector databases.
- **INNV Luxury Fashion Fraud Detection Dataset**: Price-to-MSRP variance distributions, seller authorization document verification, serial number pattern matching.
- **Adapter Interface**:
  ```typescript
  interface AuthenticityDatasetAdapter {
    loadModel(weightsPath: string): Promise<void>;
    evaluate(listing: {
      name: string;
      brand: string;
      price: number;
      msrp: number;
      imageUrl: string;
      brandAuthDoc?: string;
    }): Promise<{
      authenticityScore: number;
      counterfeitProbability: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      explanation: string;
    }>;
  }
  ```

### C. Review Moderation Agent
- **Amazon Fake Reviews Dataset**: Text perplexity analysis, unigram/bigram repetition metrics, verified purchase tagging.
- **OpSpam Corpus**: Deceptive opinion spam vs truthful review classification.
- **Adapter Interface**:
  ```typescript
  interface ReviewDatasetAdapter {
    loadModel(weightsPath: string): Promise<void>;
    evaluate(review: {
      reviewText: string;
      rating: number;
      isVerifiedPurchase: boolean;
      submissionBurstCount: number;
    }): Promise<{
      fakeProbability: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      explanation: string;
    }>;
  }
  ```

---

## 2. Model Swap Instructions

To plug in real trained model weights:
1. Place dataset files under `/data/raw/` (e.g., `/data/raw/ieee_cis_fraud.csv`).
2. Train models using python scripts under `/services/ml_trainer/`.
3. Export exported model weights as ONNX or TensorFlow SavedModel under `/data/models/`.
4. Update `DEMO_MODE=false` in `.env` to enable production model loading.
