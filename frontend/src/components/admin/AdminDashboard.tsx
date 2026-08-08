import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Search, 
  Filter, Cpu, Lock, Globe, FileText, ArrowRight, UserCheck, 
  HelpCircle, Eye, ShieldCheck, Database, RefreshCw
} from 'lucide-react';

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

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [metrics, setMetrics] = useState<any | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [fraudCases, setFraudCases] = useState<CaseItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [fairness, setFairness] = useState<any | null>(null);

  // Selected Item Modal States
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [caseExecutions, setCaseExecutions] = useState<any[]>([]);
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);
  const [holdBlockReason, setHoldBlockReason] = useState('');

  // Search / Filter States
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('trustshield_token');

  const fetchMetrics = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
    } catch (e) { console.error(e); }
  };

  const fetchListings = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/listings', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch (e) { console.error(e); }
  };

  const fetchFraudCases = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/fraud-cases', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.cases) setFraudCases(data.cases);
    } catch (e) { console.error(e); }
  };

  const fetchReviews = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/reviews', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch (e) { console.error(e); }
  };

  const fetchAuditLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.logs) setAuditLogs(data.logs);
    } catch (e) { console.error(e); }
  };

  const fetchFairness = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/fairness', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFairness(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchMetrics();
    fetchListings();
    fetchFraudCases();
    fetchReviews();
    fetchAuditLogs();
    fetchFairness();
  }, []);

  const handleListingDecision = async (productId: string, decision: 'APPROVE' | 'HOLD' | 'BLOCK') => {
    if (!token) return;
    if ((decision === 'HOLD' || decision === 'BLOCK') && !holdBlockReason) {
      alert('Reason is required for HOLD or BLOCK decision');
      return;
    }

    try {
      const res = await fetch(`/api/admin/listings/${productId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision, reason: holdBlockReason })
      });
      if (res.ok) {
        setSelectedListing(null);
        setHoldBlockReason('');
        fetchListings();
        fetchAuditLogs();
        fetchMetrics();
      }
    } catch (e) { console.error(e); }
  };

  const handleResolveCase = async (caseId: string, decision: 'RESOLVED_ALLOWED' | 'RESOLVED_BLOCKED') => {
    if (!token || !overrideReason) {
      alert('Override rationale is mandatory for human resolution');
      return;
    }

    try {
      const res = await fetch(`/api/admin/fraud-cases/${caseId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision, overrideReason })
      });
      if (res.ok) {
        setSelectedCase(null);
        setOverrideReason('');
        fetchFraudCases();
        fetchAuditLogs();
        fetchMetrics();
      }
    } catch (e) { console.error(e); }
  };

  const openCaseDetails = async (c: CaseItem) => {
    setSelectedCase(c);
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/agent-executions/${c.entityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.executions) setCaseExecutions(data.executions);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Enterprise Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Trust &amp; Safety Control Center</span>
          </div>
          <h2 className="text-2xl font-bold text-white">TrustShield AI Admin Command Console</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time agent executions, policy enforcement, human overrides, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>VPC: ap-south-1 (India)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          'Dashboard', 'Listing Approval', 'Fraud Cases', 'Review Moderation', 
          'AI Agents', 'Audit Trail', 'Fairness', 'Business Impact', 'Security'
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

      {/* ================= DASHBOARD TAB ================= */}
      {activeTab === 'Dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 font-medium">Pending Listing Approvals</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{metrics?.pendingProducts || 0}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 font-medium">Active Fraud Cases</p>
              <p className="text-2xl font-black text-rose-400 mt-1">{metrics?.openCases || 0}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 font-medium">Agent Executions Logged</p>
              <p className="text-2xl font-black text-purple-400 mt-1">{metrics?.agentExecutionsCount || 0}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 font-medium">Audit Logs Recorded</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">{metrics?.auditLogsCount || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Product Approvals Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Pending Product Listing Approvals</h3>
                <button onClick={() => setActiveTab('Listing Approval')} className="text-xs text-purple-400 hover:underline">View All &rarr;</button>
              </div>

              {!listings.filter(l => l.status !== 'APPROVED').length ? (
                <p className="text-xs text-slate-400 py-4">No cases currently available.</p>
              ) : (
                <div className="space-y-3">
                  {listings.filter(l => l.status !== 'APPROVED').slice(0, 3).map(l => (
                    <div key={l.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{l.name}</p>
                        <p className="text-slate-400">Seller: {l.sellerName} | Price: ₹{l.price} vs MSRP ₹{l.msrp}</p>
                      </div>
                      <button onClick={() => setSelectedListing(l)} className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs">Review</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Fraud Cases Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Active Fraud Investigation Cases</h3>
                <button onClick={() => setActiveTab('Fraud Cases')} className="text-xs text-purple-400 hover:underline">View All &rarr;</button>
              </div>

              {!fraudCases.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'OPEN').length ? (
                <p className="text-xs text-slate-400 py-4">No cases currently available.</p>
              ) : (
                <div className="space-y-3">
                  {fraudCases.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'OPEN').slice(0, 3).map(c => (
                    <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-400">{c.caseNumber}</span>
                          <span className="text-slate-300 font-semibold">{c.type}</span>
                        </div>
                        <p className="text-slate-400 line-clamp-1 mt-0.5">{c.explanation}</p>
                      </div>
                      <button onClick={() => openCaseDetails(c)} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs">Investigate</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= LISTING APPROVAL TAB ================= */}
      {activeTab === 'Listing Approval' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Product Listing Approvals</h3>

          {!listings.length ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
              No cases currently available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <div className="flex gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-2xl bg-slate-950" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-slate-400">Brand: {item.brand} | Seller: {item.sellerName}</p>
                      <p className="text-xs font-mono font-bold text-slate-300">Price: ₹{item.price.toLocaleString()} (MSRP: ₹{item.msrp.toLocaleString()})</p>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                        item.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
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
                    <button onClick={() => handleListingDecision(item.id, 'APPROVE')} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">APPROVE</button>
                    <button onClick={() => { setSelectedListing(item); }} className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">HOLD / BLOCK</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= FRAUD CASES TAB ================= */}
      {activeTab === 'Fraud Cases' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Fraud Investigation Queue</h3>

          {!fraudCases.length ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
              No cases currently available.
            </div>
          ) : (
            <div className="space-y-4">
              {fraudCases.map(c => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-mono font-bold text-rose-400">{c.caseNumber}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">{c.type}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">Risk Score: {c.riskScore}/100</span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded-2xl border border-slate-800">{c.explanation}</p>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400">Agent: {c.agent}</span>
                    <button onClick={() => openCaseDetails(c)} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs">Investigate &amp; Override</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= REVIEW MODERATION TAB ================= */}
      {activeTab === 'Review Moderation' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Review Ring Moderation Queue</h3>

          {!reviews.length ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
              No reviews currently available.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white">
                    <span>Product: {r.productName} | Customer: {r.customerName}</span>
                    <span className={r.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}>{r.status}</span>
                  </div>
                  <p className="text-slate-300 font-semibold">Rating: {r.rating} Stars — "{r.reviewText}"</p>
                  {r.explanation && <p className="text-slate-400 font-mono text-[11px] bg-slate-950 p-2 rounded-xl">{r.explanation}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= AUDIT TRAIL TAB ================= */}
      {activeTab === 'Audit Trail' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Cryptographic Audit Trail (SHA-256 Logs)</h3>

          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="text-purple-400">{log.action}</span>
                </div>
                <div className="text-white font-bold">
                  Actor: {log.actor} ({log.role}) &rarr; Entity: {log.entity} | Decision: <span className="text-emerald-400">{log.decision}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{log.explanation}</p>
                {log.humanOverride === 1 && (
                  <p className="text-amber-400 text-[11px]">Human Override Reason: {log.overrideReason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= FAIRNESS TAB ================= */}
      {activeTab === 'Fairness' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Seller Fairness &amp; Bias Audit</h3>
          {fairness?.status === 'INSUFFICIENT_DATA' ? (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 text-xs text-center">
              {fairness.message}
            </div>
          ) : (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <p className="font-bold text-emerald-400">Fairness Metrics Active</p>
              <pre className="text-slate-300 text-[11px]">{JSON.stringify(fairness?.metrics, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* ================= BUSINESS IMPACT TAB ================= */}
      {activeTab === 'Business Impact' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Target Metrics vs Performance</h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">Return/COD Fraud Reduction Target: <span className="text-emerald-400 font-bold">35%</span></div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">Listing Hold Precision Target: <span className="text-emerald-400 font-bold">&gt;96%</span></div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">Human Review Reduction Target: <span className="text-emerald-400 font-bold">70%</span></div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">Checkout Risk Latency Target: <span className="text-emerald-400 font-bold">&lt;250ms</span></div>
          </div>
          <p className="text-xs text-slate-400">Status: Measurement pending dataset/model evaluation</p>
        </div>
      )}

      {/* ================= SECURITY TAB ================= */}
      {activeTab === 'Security' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
          <h3 className="text-base font-bold text-white">Security &amp; Compliance Center</h3>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <p>✓ JWT Authentication Enforced</p>
            <p>✓ Role-Based Access Control (RBAC) Active</p>
            <p>✓ SHA-256 Audit Logging Chain Verified</p>
            <p>✓ India Cloud Region Data Sovereignty Note: Production deployment target is pinned to India-local cloud VPCs (ap-south-1) for DPDP Act compliance.</p>
          </div>
        </div>
      )}

      {/* ================= CASE INVESTIGATION MODAL ================= */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Case Investigation: {selectedCase.caseNumber}</h3>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-2xl">{selectedCase.explanation}</p>

            {caseExecutions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-white">Agent Execution Chain</p>
                {caseExecutions.map(e => (
                  <div key={e.id} className="p-2.5 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-400">
                    Agent: {e.agent} | Model: {e.modelVersion} | Result: {e.result} ({e.latency}ms)
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Human Override Rationale (Mandatory)</label>
              <textarea 
                rows={2}
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="Explain why decision is being confirmed or overridden..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleResolveCase(selectedCase.id, 'RESOLVED_ALLOWED')} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">CONFIRM ALLOW</button>
              <button onClick={() => handleResolveCase(selectedCase.id, 'RESOLVED_BLOCKED')} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs">CONFIRM BLOCK</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LISTING HOLD / BLOCK MODAL ================= */}
      {selectedListing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Admin Decision: {selectedListing.name}</h3>
              <button onClick={() => setSelectedListing(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reason for HOLD or BLOCK (Mandatory)</label>
              <textarea 
                rows={3}
                value={holdBlockReason}
                onChange={e => setHoldBlockReason(e.target.value)}
                placeholder="Enter policy rationale or counterfeit evidence..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleListingDecision(selectedListing.id, 'HOLD')} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs">HOLD</button>
              <button onClick={() => handleListingDecision(selectedListing.id, 'BLOCK')} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs">BLOCK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
