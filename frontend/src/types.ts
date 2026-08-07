export type RoleType = 'landing' | 'login' | 'customer' | 'seller' | 'admin';

export interface UserAccount {
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  token?: string;
}

export interface CaseItem {
  caseId: string;
  type: string;
  entity: string;
  reason: string;
  riskScore: number;
  status: 'Under Review' | 'Listing Held' | 'Investigating' | 'Pending' | 'Approved' | 'Rejected' | 'Resolved' | 'Escalated';
  assignedTo: string;
  createdAt: string;
  agent: string;
  modelType: string;
  explainability: string;
  overrideReason?: string | null;
}

export interface AuditLogItem {
  eventId: string;
  dataRegion: string;
  agentName: string;
  actionTaken: string;
  riskScore: number;
  confidenceScore: number;
  modelType: string;
  costUsd: number;
  latencyMs: number;
  plainLanguageRationale: string;
  featureContributions?: any;
  previousHash?: string;
  currentHash?: string;
  timestamp: string;
}

export interface FairnessMetric {
  smallNewSellers: {
    totalListings: number;
    heldListings: number;
    falsePositiveRate: number;
    precision: number;
  };
  establishedSellers: {
    totalListings: number;
    heldListings: number;
    falsePositiveRate: number;
    precision: number;
  };
  parityStatus: string;
  complianceStandard: string;
}

export interface ListingItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  msrp: number;
  status: 'ACTIVE' | 'HELD' | 'REJECTED';
  authenticityScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
}

export interface OrderItemData {
  id: string;
  customer: string;
  item: string;
  amount: number;
  paymentMethod: string;
  status: 'SAFE' | 'UNDER_REVIEW' | 'BLOCKED';
  riskScore: number;
  date: string;
}

export interface CheckoutRiskPayload {
  amount: number;
  paymentMethod: string;
  ipVelocity: number;
  codRefusalRate: number;
  deviceMatch: boolean;
  addressMismatch: boolean;
  sellerTier: string;
}

export interface ListingAuthenticityPayload {
  title: string;
  brand: string;
  price: number;
  msrp: number;
  logoSimilarity: number;
  missingBrandAuth: boolean;
  uncertifiedCosmetics: boolean;
  sellerTier: string;
}

export interface EvaluationResult {
  agent: string;
  riskScore: number;
  action: string;
  severity: string;
  latencyMs: number;
  totalExecutionLatencyMs?: number;
  costUsd: number;
  modelType: string;
  slaPassed?: boolean;
  dataSovereignty?: string;
  explainability: {
    decision: string;
    severity: string;
    riskScore: number;
    modelType: string;
    plainLanguageRationale: string;
    triggers: string[];
  };
  auditRecord?: AuditLogItem;
}
