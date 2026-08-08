import React from 'react';
import { 
  ShieldCheck, BrainCircuit, ShieldAlert, Cpu, Eye, Lock, ArrowRight, 
  CheckCircle, Zap, Activity, Users, ShoppingBag, BarChart3, Database, ChevronRight 
} from 'lucide-react';
import { RoleType } from '../../types';

interface LandingPageProps {
  onNavigateLogin: (role?: RoleType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Landing Header */}
      <nav className="border-b border-slate-800/80 backdrop-blur bg-slate-950/80 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 p-0.5 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                TrustShield AI
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.4 Production
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Trust & Safety for Every Transaction</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateLogin('customer')}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition text-slate-300"
          >
            Customer Portal
          </button>
          <button 
            onClick={() => onNavigateLogin('seller')}
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 transition text-slate-300"
          >
            Seller Center
          </button>
          <button 
            onClick={() => onNavigateLogin('admin')}
            className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition flex items-center gap-1.5"
          >
            <span>Admin Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 max-w-7xl mx-auto text-center">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-1/3 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
          <SparklesIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
          Multi-Agent Cooperating AI Engine for E-Commerce Protection
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Trust Every Transaction with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Autonomous Cooperating AI
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          TrustShield AI protects online marketplaces against return fraud, empty-box claims, COD abuse, counterfeit listings, and coordinated review rings using real-time explainable multi-agent intelligence.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigateLogin('admin')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition flex items-center gap-2"
          >
            <span>Explore Platform Demo</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigateLogin('customer')}
            className="px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-800 hover:border-slate-700 transition"
          >
            Test Customer Checkout Risk
          </button>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur max-w-4xl mx-auto">
          <div className="p-3">
            <div className="text-2xl font-black text-white">12,840</div>
            <div className="text-xs text-slate-400 mt-1">Orders Scanned Today</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-black text-indigo-400">&lt;148 ms</div>
            <div className="text-xs text-slate-400 mt-1">Inference Latency SLA</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-black text-emerald-400">₹18,40,250</div>
            <div className="text-xs text-slate-400 mt-1">Est. Fraud Saved Today</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-black text-purple-400">99.8%</div>
            <div className="text-xs text-slate-400 mt-1">DPDP Audit Accuracy</div>
          </div>
        </div>
      </section>

      {/* Three Cooperating AI Agents Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white">Three Cooperating AI Agents</h2>
          <p className="text-slate-400 text-sm mt-2">Specialized neural agents orchestrated to protect every touchpoint of the transaction lifecycle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Agent 1 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 hover:border-indigo-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">1. Risk Scoring Agent</h3>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-4">IEEE-CIS Fraud Dataset Calibrated</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Detects suspicious checkout activity, empty-box claims, return fraud, and COD doorstep refusal abuse in under 250ms.
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Device fingerprint &amp; IP velocity correlation</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> COD refusal rate history tracking</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Address PIN code return risk scoring</li>
            </ul>
          </div>

          {/* Agent 2 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 hover:border-emerald-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2. Authenticity &amp; Integrity Agent</h3>
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-4">CLIP Vision + Multimodal LLM</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Inspects seller product listings, logo geometry match, price vs MSRP variance, brand authorization docs, and cosmetics lab safety.
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Vector vision logo distortion check</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Automated price-to-MSRP ratio validator</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Brand authorization document verification</li>
            </ul>
          </div>

          {/* Agent 3 */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 hover:border-purple-500/50 transition group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">3. Review Moderation Agent</h3>
            <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-4">Graph Degree Centrality + NLP</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Identifies coordinated fake-review rings, synthetic AI-generated review text, and burst rating manipulation.
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Reviewer graph network co-citation clustering</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Synthetic LLM text probability detector</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Burst submission velocity anomaly detection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive System Architecture Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Multi-Agent System Architecture</h2>
              <p className="text-xs text-slate-400 mt-1">End-to-end flow from React Dashboard through API Gateway down to Cryptographic Audit Trail.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Pinned Data Region: <strong>ap-south-1 (India VPC)</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-indigo-400 font-bold mb-1">React Client</div>
              <div className="text-[10px] text-slate-500">Customer / Seller / Admin</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 text-indigo-300">
              <div className="font-bold mb-1">API Gateway</div>
              <div className="text-[10px] text-slate-500">JWT Auth &amp; Rate Limiter</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-300">
              <div className="font-bold mb-1">Orchestrator</div>
              <div className="text-[10px] text-slate-500">3 Cooperating Agents</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300">
              <div className="font-bold mb-1">Explainability Engine</div>
              <div className="text-[10px] text-slate-500">Human Rationale Engine</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300">
              <div className="font-bold mb-1">Audit Trail</div>
              <div className="text-[10px] text-slate-500">SHA-256 Hash Chain Log</div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Call to Action */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">Choose Your Experience to Launch Demo</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10">Select one of the three completely distinct user interfaces to explore TrustShield AI in action.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button 
            onClick={() => onNavigateLogin('customer')}
            className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-500 transition text-left group"
          >
            <ShoppingBag className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="font-bold text-white text-lg">Customer Portal</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Browse products, test checkout risk scores, report seller issues, and submit reviews.</p>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">Login as Customer &rarr;</span>
          </button>

          <button 
            onClick={() => onNavigateLogin('seller')}
            className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 transition text-left group"
          >
            <Users className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="font-bold text-white text-lg">Seller Center</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Submit new listings for AI check, monitor account health, and manage listing alerts.</p>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">Login as Seller &rarr;</span>
          </button>

          <button 
            onClick={() => onNavigateLogin('admin')}
            className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 hover:border-purple-500 transition text-left group"
          >
            <ShieldAlert className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="font-bold text-white text-lg">Admin Command Center</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Deep dark dashboard for fraud cases, agent monitoring, audit trail, and human override.</p>
            <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">Login as Admin &rarr;</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>TrustShield AI &copy; 2026. Built with React, TypeScript, Express, Prisma &amp; Cooperating AI Agents. Pinned to India VPC (ap-south-1).</p>
      </footer>
    </div>
  );
};

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
