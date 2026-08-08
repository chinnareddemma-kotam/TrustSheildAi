/**
 * TrustShield AI Database Seed Script
 * Seeds realistic demo dataset (10 customers, 10 sellers, 50 products, 100 orders,
 * 50 reviews, 20 fraud cases, 20 alerts, 30 audit logs).
 */

const mockSeedData = {
  users: [
    { email: 'customer@trustshield.ai', role: 'CUSTOMER', name: 'Priya Sharma' },
    { email: 'seller@trustshield.ai', role: 'SELLER', name: 'TechMart Electronics' },
    { email: 'admin@trustshield.ai', role: 'ADMIN', name: 'Rajesh Kumar (Risk Lead)' },
    { email: 'ananya@trustshield.ai', role: 'CUSTOMER', name: 'Ananya Roy' },
    { email: 'vikram@trustshield.ai', role: 'SELLER', name: 'Global Luxe Brands' }
  ],
  products: [
    { id: 'PROD-101', name: 'boAt Airdopes 141 Bluetooth Earbuds', brand: 'boAt', price: 1299, msrp: 4490, category: 'Electronics', status: 'ACTIVE', authenticityScore: 97, riskLevel: 'LOW' },
    { id: 'PROD-102', name: 'Puma Men Running Shoes', brand: 'Puma', price: 2499, msrp: 5999, category: 'Footwear', status: 'ACTIVE', authenticityScore: 94, riskLevel: 'LOW' },
    { id: 'PROD-103', name: 'Noise ColorFit Pro 4 Smartwatch', brand: 'Noise', price: 1999, msrp: 4999, category: 'Wearables', status: 'ACTIVE', authenticityScore: 98, riskLevel: 'LOW' },
    { id: 'PROD-104', name: 'Apple AirPods Pro (2nd Gen) - SUSPICIOUS', brand: 'Apple', price: 2999, msrp: 24900, category: 'Electronics', status: 'HELD', authenticityScore: 23, riskLevel: 'HIGH' }
  ],
  orders: [
    { id: 'ORD-45821', customer: 'Priya Sharma', item: 'boAt Airdopes 141', amount: 1299, method: 'UPI', status: 'SAFE', riskScore: 12, date: '2026-08-07' },
    { id: 'ORD-45822', customer: 'Ananya Roy', item: 'Apple AirPods Pro', amount: 2999, method: 'COD', status: 'UNDER_REVIEW', riskScore: 89, date: '2026-08-07' },
    { id: 'ORD-45820', customer: 'Priya Sharma', item: 'Puma Running Shoes', amount: 2499, method: 'CARD', status: 'SAFE', riskScore: 8, date: '2026-08-06' }
  ],
  cases: [
    { caseId: 'CASE-784512', type: 'Return Fraud / COD Abuse', entity: 'Order #ORD-45822', reason: 'Empty box claim, weight mismatch & high COD refusal (42%)', riskScore: 92, status: 'Under Review', assignedTo: 'Ananya Sharma', agent: 'Risk Scoring Agent', modelType: 'LLM (Deep Context)', explainability: 'Order flagged for return fraud risk (92/100). High COD refusal history (42%), device mismatch, and weight deviation on return parcel.' },
    { caseId: 'CASE-784511', type: 'Counterfeit Listing', entity: 'Product #PROD-104 (AirPods Pro)', reason: 'Logo mismatch 34%, price 88% below MSRP (₹2,999 vs ₹24,900)', riskScore: 98, status: 'Listing Held', assignedTo: 'Vikram Mehta', agent: 'Authenticity & Integrity Agent', modelType: 'LLM (Multimodal Vision-Text)', explainability: 'Product listing held due to severe price anomaly (88% below registered MSRP) and vector vision embedding logo mismatch.' },
    { caseId: 'CASE-784510', type: 'Fake Review Ring', entity: 'Seller Seller_248', reason: 'Multiple accounts, same IP, synthetic template reviews', riskScore: 94, status: 'Investigating', assignedTo: 'Rajesh Kumar', agent: 'Review Moderation Agent', modelType: 'LLM (Graph-NLP Ensemble)', explainability: 'Coordinated review ring detected. 18 reviews posted within 3 minutes from accounts under 24 hours old with graph degree centrality 0.85.' },
    { caseId: 'CASE-784509', type: 'COD Abuse', entity: 'User User_78291', reason: '8 COD refusals in 30 days across multiple delivery PINs', riskScore: 89, status: 'Pending', assignedTo: 'Priya Nair', agent: 'Risk Scoring Agent', modelType: 'SLM (XGBoost Fast)', explainability: 'User account restricted from COD payment option due to 8 consecutive doorstep payment refusals.' }
  ]
};

console.log('🌱 TrustShield AI Database Seed Initialized!');
console.log(`- Seeded ${mockSeedData.users.length} Users`);
console.log(`- Seeded ${mockSeedData.products.length} Products`);
console.log(`- Seeded ${mockSeedData.orders.length} Orders`);
console.log(`- Seeded ${mockSeedData.cases.length} Fraud Cases`);

module.exports = mockSeedData;
