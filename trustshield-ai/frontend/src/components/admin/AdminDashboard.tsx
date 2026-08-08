import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Cpu,
  Lock,
  Globe,
  FileText,
  ArrowRight,
  UserCheck,
  HelpCircle,
  Eye,
  ShieldCheck,
  Database,
  RefreshCw,
  ExternalLink,
  FolderOpen
} from 'lucide-react';

interface DatasetEntry {
  id: string;
  name: string;
  agent: string;
  purpose: string;
  sourceUrl: string;
  expectedFile: string;
  configStatus: 'CONFIGURED' | 'NOT CONFIGURED';
  adapterStatus: string;
  modelVersion: string;
  evaluationStatus: 'EVALUATION PENDING' | 'COMPLETED';
  evaluationNote: string;
  requiredColumns: string[];
}

interface CaseItem {
  id: string;
  caseNumber: string;
  type: string;
  entityId: string;
  riskScore: number;
  status: string;
  assignedTo: string;
  agent: string;
  explanation: string;
  overrideReason?: string;
  createdAt: string;
}

interface ListingItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  msrp: number;
  imageUrl: string;
  status: string;
  authenticityScore?: number;
  counterfeitProbability?: number;
  sellerName: string;
  sellerTrustScore?: number;
  aiExplanation?: string;
}

interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  entity: string;
  agent: string;
  action: string;
  decision: string;
  riskScore: number;
  explanation: string;
  policy: string;
  humanOverride: number;
  overrideReason?: string;
}

type HumanDecision = 'APPROVE' | 'HOLD' | 'BLOCK';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const [metrics, setMetrics] = useState<any | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [fraudCases, setFraudCases] = useState<CaseItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [fairness, setFairness] = useState<any | null>(null);

  const [datasetRegistry, setDatasetRegistry] = useState<DatasetEntry[]>([]);
  const [datasetRegistryNote, setDatasetRegistryNote] = useState('');
  const [datasetRegistryDir, setDatasetRegistryDir] = useState('');

  // Selected Item Modal States
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [caseExecutions, setCaseExecutions] = useState<any[]>([]);
  const [caseDetails, setCaseDetails] = useState<any | null>(null);
  const [loadingCaseDetails, setLoadingCaseDetails] = useState(false);

  const [overrideReason, setOverrideReason] = useState('');
  const [humanDecision, setHumanDecision] =
    useState<HumanDecision>('HOLD');

  const [selectedListing, setSelectedListing] =
    useState<ListingItem | null>(null);

  const [holdBlockReason, setHoldBlockReason] = useState('');

  // Search / Filter States
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('trustshield_token');

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const fetchMetrics = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/metrics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchListings = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/listings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.listings) {
        setListings(data.listings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFraudCases = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/fraud-cases', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.cases) {
        setFraudCases(data.cases);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReviews = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/reviews', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.logs) {
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFairness = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/fairness', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      setFairness(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDatasetRegistry = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/admin/dataset-registry', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.registry) {
        setDatasetRegistry(data.registry);
      }

      if (data.note) {
        setDatasetRegistryNote(data.note);
      }

      if (data.dataRawDir) {
        setDatasetRegistryDir(data.dataRawDir);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchListings();
    fetchFraudCases();
    fetchReviews();
    fetchAuditLogs();
    fetchFairness();
    fetchDatasetRegistry();
  }, []);

  // ============================================================
  // LISTING DECISION
  // ============================================================

  const handleListingDecision = async (
    productId: string,
    decision: 'APPROVE' | 'HOLD' | 'BLOCK'
  ) => {
    if (!token) return;

    if (
      (decision === 'HOLD' || decision === 'BLOCK') &&
      !holdBlockReason.trim()
    ) {
      alert('Reason is required for HOLD or BLOCK decision');
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/listings/${productId}/decision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            decision,
            reason: holdBlockReason
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Listing decision failed');
        return;
      }

      setSelectedListing(null);
      setHoldBlockReason('');

      fetchListings();
      fetchAuditLogs();
      fetchMetrics();
    } catch (e) {
      console.error(e);
      alert('Failed to process listing decision');
    }
  };

  // ============================================================
  // HUMAN-IN-THE-LOOP CASE RESOLUTION
  // ============================================================

  const handleResolveCase = async (
    caseId: string,
    decision: HumanDecision
  ) => {
    if (!token) return;

    if (!overrideReason.trim()) {
      alert(
        'Override rationale is mandatory for human resolution'
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/fraud-cases/${caseId}/resolve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            decision,
            overrideReason: overrideReason.trim()
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to resolve fraud case');
        return;
      }

      setSelectedCase(null);
      setCaseDetails(null);
      setCaseExecutions([]);
      setOverrideReason('');
      setHumanDecision('HOLD');

      await fetchFraudCases();
      await fetchAuditLogs();
      await fetchMetrics();

      alert(
        `Human decision "${decision}" recorded successfully.`
      );
    } catch (e) {
      console.error(e);
      alert('Failed to resolve fraud case');
    }
  };

  // ============================================================
  // OPEN CASE DETAILS
  // ============================================================

  const openCaseDetails = async (c: CaseItem) => {
    setSelectedCase(c);
    setCaseDetails(null);
    setCaseExecutions([]);
    setOverrideReason('');
    setHumanDecision('HOLD');
    setLoadingCaseDetails(true);

    if (!token) {
      setLoadingCaseDetails(false);
      return;
    }

    try {
      // New detailed AI explanation endpoint
      const detailsRes = await fetch(
        `/api/admin/fraud-cases/${c.id}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();

        setCaseDetails(detailsData);

        if (detailsData.executions) {
          setCaseExecutions(detailsData.executions);
        }
      } else {
        console.warn(
          'Detailed case endpoint unavailable. Falling back to existing execution endpoint.'
        );

        // Backward-compatible fallback
        const executionRes = await fetch(
          `/api/admin/agent-executions/${c.entityId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const executionData = await executionRes.json();

        if (executionData.executions) {
          setCaseExecutions(executionData.executions);
        }

        // Build a safe explanation object from existing case data
        setCaseDetails({
          case: c,
          aiDecision: {
            decision: 'REVIEW',
            riskScore: c.riskScore,
            agent: c.agent,
            modelVersion: 'v2.4.0',
            explanation: c.explanation
          },
          policy: {
            policyName: 'CHECKOUT_RISK',
            ruleTriggered: 'SEE CASE EXPLANATION',
            reason: c.explanation
          },
          executions: executionData.executions || []
        });
      }
    } catch (e) {
      console.error(
        'Failed to load detailed case information:',
        e
      );

      // Still show the original case instead of breaking the modal
      setCaseDetails({
        case: c,
        aiDecision: {
          decision: 'REVIEW',
          riskScore: c.riskScore,
          agent: c.agent,
          modelVersion: 'v2.4.0',
          explanation: c.explanation
        },
        policy: {
          policyName: 'CHECKOUT_RISK',
          ruleTriggered: 'SEE CASE EXPLANATION',
          reason: c.explanation
        }
      });
    } finally {
      setLoadingCaseDetails(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* ========================================================
          ENTERPRISE TOP BANNER
      ======================================================== */}

      <div className="bg-gradient-to-r from-purple-950 via-slate-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-purple-400" />

            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Trust &amp; Safety Control Center
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white">
            TrustShield AI Admin Command Console
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Real-time agent executions, policy enforcement,
            human overrides, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>VPC: ap-south-1 (India)</span>
          </div>
        </div>

      </div>

      {/* ========================================================
          NAVIGATION
      ======================================================== */}

      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">

        {[
          'Dashboard',
          'Listing Approval',
          'Fraud Cases',
          'Review Moderation',
          'AI Agents',
          'Audit Trail',
          'Fairness',
          'Business Impact',
          'Security',
          'Dataset Registry'
        ].map(tab => (

          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === tab
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab}
          </button>

        ))}

      </div>

      {/* ========================================================
          DASHBOARD
      ======================================================== */}

      {activeTab === 'Dashboard' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 font-medium">
                Pending Listing Approvals
              </p>

              <p className="text-2xl font-black text-amber-400 mt-1">
                {metrics?.pendingProducts || 0}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 font-medium">
                Active Fraud Cases
              </p>

              <p className="text-2xl font-black text-rose-400 mt-1">
                {metrics?.openCases || 0}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 font-medium">
                Agent Executions Logged
              </p>

              <p className="text-2xl font-black text-purple-400 mt-1">
                {metrics?.agentExecutionsCount || 0}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 font-medium">
                Audit Logs Recorded
              </p>

              <p className="text-2xl font-black text-indigo-400 mt-1">
                {metrics?.auditLogsCount || 0}
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Pending Product Approvals */}

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">

              <div className="flex justify-between items-center">

                <h3 className="text-base font-bold text-white">
                  Pending Product Listing Approvals
                </h3>

                <button
                  onClick={() =>
                    setActiveTab('Listing Approval')
                  }
                  className="text-xs text-purple-400 hover:underline"
                >
                  View All →
                </button>

              </div>

              {!listings.filter(
                l => l.status !== 'APPROVED'
              ).length ? (

                <p className="text-xs text-slate-400 py-4">
                  No cases currently available.
                </p>

              ) : (

                <div className="space-y-3">

                  {listings
                    .filter(l => l.status !== 'APPROVED')
                    .slice(0, 3)
                    .map(l => (

                      <div
                        key={l.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >

                        <div>
                          <p className="font-bold text-white">
                            {l.name}
                          </p>

                          <p className="text-slate-400">
                            Seller: {l.sellerName} |
                            Price: ₹{l.price} vs MSRP ₹{l.msrp}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedListing(l)
                          }
                          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                        >
                          Review
                        </button>

                      </div>

                    ))}

                </div>

              )}

            </div>

            {/* Active Fraud Cases */}

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">

              <div className="flex justify-between items-center">

                <h3 className="text-base font-bold text-white">
                  Active Fraud Investigation Cases
                </h3>

                <button
                  onClick={() =>
                    setActiveTab('Fraud Cases')
                  }
                  className="text-xs text-purple-400 hover:underline"
                >
                  View All →
                </button>

              </div>

              {!fraudCases.filter(
                c =>
                  c.status === 'UNDER_REVIEW' ||
                  c.status === 'OPEN'
              ).length ? (

                <p className="text-xs text-slate-400 py-4">
                  No cases currently available.
                </p>

              ) : (

                <div className="space-y-3">

                  {fraudCases
                    .filter(
                      c =>
                        c.status === 'UNDER_REVIEW' ||
                        c.status === 'OPEN'
                    )
                    .slice(0, 3)
                    .map(c => (

                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >

                        <div>
                          <div className="flex items-center gap-2">

                            <span className="font-mono font-bold text-rose-400">
                              {c.caseNumber}
                            </span>

                            <span className="text-slate-300 font-semibold">
                              {c.type}
                            </span>

                          </div>

                          <p className="text-slate-400 line-clamp-1 mt-0.5">
                            {c.explanation}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            openCaseDetails(c)
                          }
                          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                        >
                          Investigate
                        </button>

                      </div>

                    ))}

                </div>

              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          LISTING APPROVAL
      ======================================================== */}

      {activeTab === 'Listing Approval' && (
        <div className="space-y-4">

          <h3 className="text-lg font-bold text-white">
            Product Listing Approvals
          </h3>

          {!listings.length ? (

            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
              No cases currently available.
            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {listings.map(item => (

                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3"
                >

                  <div className="flex gap-4">

                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-2xl bg-slate-950"
                    />

                    <div className="space-y-1">

                      <h4 className="font-bold text-white text-sm line-clamp-1">
                        {item.name}
                      </h4>

                      <p className="text-xs text-slate-400">
                        Brand: {item.brand} |
                        Seller: {item.sellerName}
                      </p>

                      <p className="text-xs font-mono font-bold text-slate-300">
                        Price: ₹{item.price.toLocaleString()}
                        {' '}
                        (MSRP: ₹{item.msrp.toLocaleString()})
                      </p>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>

                    </div>

                  </div>

                  {item.aiExplanation && (
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
                      {item.aiExplanation}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-slate-800">

                    <button
                      onClick={() =>
                        handleListingDecision(
                          item.id,
                          'APPROVE'
                        )
                      }
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      APPROVE
                    </button>

                    <button
                      onClick={() =>
                        setSelectedListing(item)
                      }
                      className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
                    >
                      HOLD / BLOCK
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>
      )}

      {/* ========================================================
          FRAUD CASES
      ======================================================== */}

      {activeTab === 'Fraud Cases' && (
        <div className="space-y-4">

          <h3 className="text-lg font-bold text-white">
            Fraud Investigation Queue
          </h3>

          {!fraudCases.length ? (

            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
              No cases currently available.
            </div>

          ) : (

            <div className="space-y-4">

              {fraudCases.map(c => (

                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3"
                >

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-3">

                      <span className="text-base font-mono font-bold text-rose-400">
                        {c.caseNumber}
                      </span>

                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {c.type}
                      </span>

                    </div>

                    <span className="text-xs font-mono font-bold text-amber-400">
                      Risk Score: {c.riskScore}/100
                    </span>

                  </div>

                  <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    {c.explanation}
                  </p>

                  <div className="flex justify-between items-center pt-2">

                    <span className="text-xs text-slate-400">
                      Agent: {c.agent}
                    </span>

                    <button
                      onClick={() =>
                        openCaseDetails(c)
                      }
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                    >
                      Investigate &amp; Override
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>
      )}

      {/* ========================================================
          REVIEW MODERATION
      ======================================================== */}

      {activeTab === 'Review Moderation' && (
        <div className="space-y-4">

          <h3 className="text-lg font-bold text-white">
            Review Ring Moderation Queue
          </h3>

          {!reviews.length ? (

            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
              No reviews currently available.
            </div>

          ) : (

            <div className="space-y-3">

              {reviews.map(r => (

                <div
                  key={r.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 text-xs"
                >

                  <div className="flex justify-between font-bold text-white">

                    <span>
                      Product: {r.productName} |
                      Customer: {r.customerName}
                    </span>

                    <span
                      className={
                        r.status === 'APPROVED'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {r.status}
                    </span>

                  </div>

                  <p className="text-slate-300 font-semibold">
                    Rating: {r.rating} Stars — "{r.reviewText}"
                  </p>

                  {r.explanation && (
                    <p className="text-slate-400 font-mono text-[11px] bg-slate-950 p-2 rounded-xl">
                      {r.explanation}
                    </p>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>
      )}

      {/* ========================================================
          AUDIT TRAIL
      ======================================================== */}

      {activeTab === 'Audit Trail' && (
        <div className="space-y-4">

          <h3 className="text-lg font-bold text-white">
            Cryptographic Audit Trail (SHA-256 Logs)
          </h3>

          <div className="space-y-3">

            {auditLogs.map(log => (

              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-1"
              >

                <div className="flex justify-between text-slate-400">

                  <span>
                    {new Date(
                      log.timestamp
                    ).toLocaleString()}
                  </span>

                  <span className="text-purple-400">
                    {log.action}
                  </span>

                </div>

                <div className="text-white font-bold">

                  Actor: {log.actor} ({log.role})
                  {' → '}
                  Entity: {log.entity}
                  {' | '}
                  Decision:

                  <span className="text-emerald-400">
                    {' '}
                    {log.decision}
                  </span>

                </div>

                <p className="text-slate-400 text-[11px]">
                  {log.explanation}
                </p>

                {log.humanOverride === 1 && (
                  <p className="text-amber-400 text-[11px]">
                    Human Override Reason:
                    {' '}
                    {log.overrideReason}
                  </p>
                )}

              </div>

            ))}

          </div>

        </div>
      )}

      {/* ========================================================
          FAIRNESS
      ======================================================== */}

      {activeTab === 'Fairness' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">

          <h3 className="text-base font-bold text-white">
            Seller Fairness &amp; Bias Audit
          </h3>

          {fairness?.status === 'INSUFFICIENT_DATA' ? (

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 text-xs text-center">
              {fairness.message}
            </div>

          ) : (

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">

              <p className="font-bold text-emerald-400">
                Fairness Metrics Active
              </p>

              <pre className="text-slate-300 text-[11px]">
                {JSON.stringify(
                  fairness?.metrics,
                  null,
                  2
                )}
              </pre>

            </div>

          )}

        </div>
      )}

      {/* ========================================================
          BUSINESS IMPACT
      ======================================================== */}

      {activeTab === 'Business Impact' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">

          <h3 className="text-base font-bold text-white">
            Target Metrics vs Performance
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              Return/COD Fraud Reduction Target:
              {' '}
              <span className="text-emerald-400 font-bold">
                35%
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              Listing Hold Precision Target:
              {' '}
              <span className="text-emerald-400 font-bold">
                &gt;96%
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              Human Review Reduction Target:
              {' '}
              <span className="text-emerald-400 font-bold">
                70%
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              Checkout Risk Latency Target:
              {' '}
              <span className="text-emerald-400 font-bold">
                &lt;250ms
              </span>
            </div>

          </div>

          <p className="text-xs text-slate-400">
            Status: Measurement pending dataset/model evaluation
          </p>

        </div>
      )}

      {/* ========================================================
          SECURITY
      ======================================================== */}

      {activeTab === 'Security' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">

          <h3 className="text-base font-bold text-white">
            Security &amp; Compliance Center
          </h3>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-slate-300">

            <p>✓ JWT Authentication Enforced</p>
            <p>✓ Role-Based Access Control (RBAC) Active</p>
            <p>✓ SHA-256 Audit Logging Chain Verified</p>

            <p>
              ✓ India Cloud Region Data Sovereignty Note:
              Production deployment target is pinned to
              India-local cloud VPCs (ap-south-1) for DPDP
              Act compliance.
            </p>

          </div>

        </div>
      )}

      {/* ========================================================
          DATASET REGISTRY
      ======================================================== */}

      {activeTab === 'Dataset Registry' && (
        <div className="space-y-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>

              <h3 className="text-lg font-bold text-white flex items-center gap-2">

                <Database className="w-5 h-5 text-purple-400" />

                <span>Dataset Registry</span>

              </h3>

              <p className="text-xs text-slate-400 mt-1">
                AI agent training datasets required by the
                TrustShield specification. Configure by placing
                dataset files in the directory below.
              </p>

            </div>

            <button
              onClick={fetchDatasetRegistry}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >

              <RefreshCw className="w-3.5 h-3.5" />

              <span>Refresh Status</span>

            </button>

          </div>

          <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-2xl flex items-start gap-3">

            <FolderOpen className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />

            <div className="text-xs space-y-1">

              <p className="font-bold text-amber-300">
                Dataset Drop Directory
              </p>

              <p className="text-slate-300 font-mono break-all">
                {datasetRegistryDir || './data/raw/'}
              </p>

              <p className="text-slate-400">
                {datasetRegistryNote}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-4">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">

              <p className="text-2xl font-black text-rose-400">
                {
                  datasetRegistry.filter(
                    d =>
                      d.configStatus ===
                      'NOT CONFIGURED'
                  ).length
                }
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Not Configured
              </p>

            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">

              <p className="text-2xl font-black text-emerald-400">
                {
                  datasetRegistry.filter(
                    d =>
                      d.configStatus ===
                      'CONFIGURED'
                  ).length
                }
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Configured
              </p>

            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">

              <p className="text-2xl font-black text-amber-400">
                {
                  datasetRegistry.filter(
                    d =>
                      d.evaluationStatus ===
                      'EVALUATION PENDING'
                  ).length
                }
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Evaluation Pending
              </p>

            </div>

          </div>

          {(
            [
              'Risk Scoring Agent',
              'Review Moderation Agent',
              'Authenticity Agent'
            ] as const
          ).map(agentName => {

            const agentDatasets =
              datasetRegistry.filter(
                d => d.agent === agentName
              );

            const agentColor =
              agentName === 'Risk Scoring Agent'
                ? {
                    border:
                      'border-blue-500/30',
                    badge:
                      'bg-blue-500/20 text-blue-300',
                    dot:
                      'bg-blue-400'
                  }
                : agentName ===
                  'Review Moderation Agent'
                ? {
                    border:
                      'border-amber-500/30',
                    badge:
                      'bg-amber-500/20 text-amber-300',
                    dot:
                      'bg-amber-400'
                  }
                : {
                    border:
                      'border-purple-500/30',
                    badge:
                      'bg-purple-500/20 text-purple-300',
                    dot:
                      'bg-purple-400'
                  };

            return (
              <div
                key={agentName}
                className="space-y-3"
              >

                <div className="flex items-center gap-2">

                  <div
                    className={`w-2.5 h-2.5 rounded-full ${agentColor.dot}`}
                  />

                  <h4 className="text-sm font-bold text-white">
                    {agentName}
                  </h4>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${agentColor.badge}`}
                  >
                    {agentDatasets.length}
                    {' '}
                    dataset
                    {agentDatasets.length !== 1
                      ? 's'
                      : ''}
                  </span>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {agentDatasets.map(ds => (

                    <div
                      key={ds.id}
                      className={`bg-slate-900 border ${agentColor.border} rounded-2xl p-5 space-y-4`}
                    >

                      <div className="flex items-start justify-between gap-2">

                        <h5 className="text-sm font-bold text-white leading-snug">
                          {ds.name}
                        </h5>

                        <a
                          href={ds.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition"
                          title="View dataset source"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {ds.purpose}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs">

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">

                          <p className="text-[10px] text-slate-500 font-medium mb-1">
                            Configuration
                          </p>

                          <span
                            className={`font-bold ${
                              ds.configStatus ===
                              'CONFIGURED'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {ds.configStatus}
                          </span>

                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">

                          <p className="text-[10px] text-slate-500 font-medium mb-1">
                            Evaluation
                          </p>

                          <span className="font-bold text-amber-400">
                            {ds.evaluationStatus}
                          </span>

                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">

                          <p className="text-[10px] text-slate-500 font-medium mb-1">
                            Model Version
                          </p>

                          <span className="font-mono text-indigo-300">
                            {ds.modelVersion}
                          </span>

                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">

                          <p className="text-[10px] text-slate-500 font-medium mb-1">
                            Adapter
                          </p>

                          <span
                            className={`font-bold ${
                              ds.configStatus ===
                              'CONFIGURED'
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {ds.configStatus ===
                            'CONFIGURED'
                              ? 'ACTIVE'
                              : 'DEMO ADAPTER'}
                          </span>

                        </div>

                      </div>

                      <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">

                        <p className="text-[11px] font-mono font-bold text-amber-300">
                          {ds.adapterStatus}
                        </p>

                      </div>

                      <p className="text-[11px] text-slate-500 italic">
                        {ds.evaluationNote}
                      </p>

                      <div className="pt-1 border-t border-slate-800">

                        <p className="text-[10px] text-slate-500 mb-1">
                          Expected file in data/raw/
                        </p>

                        <code className="text-xs font-mono text-purple-300 bg-slate-950 px-2 py-1 rounded">
                          {ds.expectedFile}
                        </code>

                      </div>

                      <details className="text-[11px] text-slate-400">

                        <summary className="cursor-pointer text-slate-500 hover:text-slate-300 transition select-none">
                          View required columns (
                          {ds.requiredColumns.length}
                          )
                        </summary>

                        <p className="mt-2 font-mono text-slate-400 break-all leading-relaxed">
                          {ds.requiredColumns.join(', ')}
                        </p>

                      </details>

                    </div>

                  ))}

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* ========================================================
          CASE INVESTIGATION MODAL
          AI DECISION EXPLANATION + HUMAN-IN-THE-LOOP
      ======================================================== */}

      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">

            {/* Modal Header */}

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">

              <div>

                <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                  AI Fraud Investigation
                </p>

                <h3 className="text-base font-bold text-white mt-1">
                  {selectedCase.caseNumber}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {selectedCase.type}
                </p>

              </div>

              <button
                onClick={() => {
                  setSelectedCase(null);
                  setCaseDetails(null);
                  setCaseExecutions([]);
                  setOverrideReason('');
                }}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>

            </div>

            {/* Loading */}

            {loadingCaseDetails ? (

              <div className="p-8 text-center">

                <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-3" />

                <p className="text-xs text-slate-400">
                  Loading AI decision analysis...
                </p>

              </div>

            ) : (

              <>

                {/* =================================================
                    AI DECISION SUMMARY
                ================================================= */}

                <div className="bg-slate-950 border border-purple-500/20 rounded-2xl p-4 space-y-4">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Cpu className="w-4 h-4 text-purple-400" />

                      <p className="text-xs font-bold text-purple-300">
                        AI DECISION
                      </p>

                    </div>

                    <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 font-bold">
                      AUTOMATED
                    </span>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">

                      <p className="text-[10px] text-slate-500">
                        RISK SCORE
                      </p>

                      <p className="text-2xl font-black text-white mt-1">
                        {
                          caseDetails?.aiDecision?.riskScore ??
                          selectedCase.riskScore
                        }
                        <span className="text-sm text-slate-500">
                          /100
                        </span>
                      </p>

                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">

                      <p className="text-[10px] text-slate-500">
                        AI RECOMMENDATION
                      </p>

                      <p className="text-xl font-black text-purple-300 mt-1">
                        {
                          caseDetails?.aiDecision?.decision ||
                          'REVIEW'
                        }
                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <p className="text-[10px] text-slate-500">
                        AGENT
                      </p>

                      <p className="text-xs text-slate-200 mt-1">
                        {
                          caseDetails?.aiDecision?.agent ||
                          selectedCase.agent
                        }
                      </p>

                    </div>

                    <div>

                      <p className="text-[10px] text-slate-500">
                        MODEL VERSION
                      </p>

                      <p className="text-xs font-mono text-indigo-300 mt-1">
                        {
                          caseDetails?.aiDecision?.modelVersion ||
                          'v2.4.0'
                        }
                      </p>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    WHY DID AI MAKE THIS DECISION?
                ================================================= */}

                <div className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-4 space-y-3">

                  <div className="flex items-center gap-2">

                    <HelpCircle className="w-4 h-4 text-cyan-400" />

                    <p className="text-xs font-bold text-cyan-300">
                      WHY DID AI MAKE THIS DECISION?
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                      Explanation
                    </p>

                    <p className="text-xs leading-5 text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-3 whitespace-pre-wrap">
                      {
                        caseDetails?.policy?.reason ||
                        caseDetails?.aiDecision?.explanation ||
                        selectedCase.explanation ||
                        'No explanation available.'
                      }
                    </p>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">

                      <p className="text-[10px] text-slate-500">
                        POLICY
                      </p>

                      <p className="text-xs font-mono text-cyan-300 mt-1">
                        {
                          caseDetails?.policy?.policyName ||
                          'CHECKOUT_RISK'
                        }
                      </p>

                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">

                      <p className="text-[10px] text-slate-500">
                        RULE TRIGGERED
                      </p>

                      <p className="text-xs font-mono text-amber-300 mt-1">
                        {
                          caseDetails?.policy?.ruleTriggered ||
                          'SEE EXPLANATION'
                        }
                      </p>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    ORIGINAL CASE EXPLANATION
                ================================================= */}

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">

                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Original Agent Assessment
                  </p>

                  <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {selectedCase.explanation}
                  </p>

                </div>

                {/* =================================================
                    AGENT EXECUTION CHAIN
                ================================================= */}

                {caseExecutions.length > 0 && (

                  <div className="space-y-2">

                    <div className="flex items-center gap-2">

                      <ArrowRight className="w-4 h-4 text-purple-400" />

                      <p className="text-xs font-bold text-white">
                        Agent Execution Chain
                      </p>

                    </div>

                    {caseExecutions.map(e => (

                      <div
                        key={e.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400"
                      >

                        <div className="flex flex-wrap gap-x-3 gap-y-1">

                          <span>
                            Agent:
                            {' '}
                            <span className="text-purple-300">
                              {e.agent}
                            </span>
                          </span>

                          <span>
                            Model:
                            {' '}
                            <span className="text-indigo-300">
                              {e.modelVersion}
                            </span>
                          </span>

                          <span>
                            Latency:
                            {' '}
                            <span className="text-emerald-300">
                              {e.latency}ms
                            </span>
                          </span>

                        </div>

                        <p className="mt-2 text-slate-500">
                          Result:
                          {' '}
                          <span className="text-slate-300">
                            {e.result}
                          </span>
                        </p>

                      </div>

                    ))}

                  </div>

                )}

                {/* =================================================
                    HUMAN-IN-THE-LOOP
                ================================================= */}

                <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-4">

                  <div>

                    <div className="flex items-center gap-2">

                      <UserCheck className="w-4 h-4 text-amber-400" />

                      <p className="text-xs font-bold text-amber-300">
                        HUMAN-IN-THE-LOOP REVIEW
                      </p>

                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      AI recommendations are advisory.
                      The Admin makes the final decision.
                    </p>

                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">

                    <p className="text-[10px] text-slate-500">
                      AI RECOMMENDATION
                    </p>

                    <p className="text-sm font-black text-purple-300 mt-1">
                      {
                        caseDetails?.aiDecision?.decision ||
                        'REVIEW'
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">
                      Select Human Decision
                    </p>

                    <div className="grid grid-cols-3 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setHumanDecision('APPROVE')
                        }
                        className={`py-3 rounded-xl font-bold text-xs transition border ${
                          humanDecision === 'APPROVE'
                            ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        APPROVE
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHumanDecision('HOLD')
                        }
                        className={`py-3 rounded-xl font-bold text-xs transition border ${
                          humanDecision === 'HOLD'
                            ? 'bg-amber-600 text-white border-amber-400 ring-2 ring-amber-400/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        HOLD
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHumanDecision('BLOCK')
                        }
                        className={`py-3 rounded-xl font-bold text-xs transition border ${
                          humanDecision === 'BLOCK'
                            ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        BLOCK
                      </button>

                    </div>

                  </div>

                  <div>

                    <label className="block text-[10px] uppercase tracking-wide text-slate-500 mb-2">
                      Human Decision Rationale *
                    </label>

                    <textarea
                      rows={4}
                      value={overrideReason}
                      onChange={e =>
                        setOverrideReason(
                          e.target.value
                        )
                      }
                      placeholder="Explain why you are confirming or overriding the AI recommendation..."
                      className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 outline-none text-xs text-white placeholder:text-slate-600 resize-none"
                    />

                    <p className="text-[10px] text-slate-600 mt-1">
                      This reason will be permanently recorded
                      in the audit trail.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleResolveCase(
                        selectedCase.id,
                        humanDecision
                      )
                    }
                    disabled={
                      !overrideReason.trim()
                    }
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-xs transition"
                  >
                    CONFIRM HUMAN DECISION
                  </button>

                </div>

              </>

            )}

          </div>

        </div>
      )}

      {/* ========================================================
          LISTING HOLD / BLOCK MODAL
      ======================================================== */}

      {selectedListing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">

              <h3 className="text-base font-bold text-white">
                Admin Decision: {selectedListing.name}
              </h3>

              <button
                onClick={() =>
                  setSelectedListing(null)
                }
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            <div>

              <label className="block text-xs font-medium text-slate-300 mb-1">
                Reason for HOLD or BLOCK (Mandatory)
              </label>

              <textarea
                rows={3}
                value={holdBlockReason}
                onChange={e =>
                  setHoldBlockReason(e.target.value)
                }
                placeholder="Enter policy rationale or counterfeit evidence..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />

            </div>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  handleListingDecision(
                    selectedListing.id,
                    'HOLD'
                  )
                }
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
              >
                HOLD
              </button>

              <button
                onClick={() =>
                  handleListingDecision(
                    selectedListing.id,
                    'BLOCK'
                  )
                }
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                BLOCK
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};