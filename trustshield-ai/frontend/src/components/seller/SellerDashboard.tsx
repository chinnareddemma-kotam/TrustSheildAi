import React, { useState, useEffect } from 'react';
import { 
  Store, Plus, Package, Clock, ShieldCheck, AlertCircle, 
  CheckCircle2, FileText, BarChart2, Star, RefreshCw, X, ArrowUpRight
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  price: number;
  msrp: number;
  imageUrl: string;
  brandAuthDoc?: string;
  status: string;
  authenticityScore?: number;
  counterfeitProbability?: number;
  riskLevel?: string;
  createdAt: string;
}

export const SellerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [sellerProfile, setSellerProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State for Add Product
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState<number>(2999);
  const [msrp, setMsrp] = useState<number>(4999);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500');
  const [brandAuthDoc, setBrandAuthDoc] = useState('');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('trustshield_token');

  const fetchSellerProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/seller/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.profile) setSellerProfile(data.profile);
    } catch (e) {
      console.error('Failed to fetch seller profile', e);
    }
  };

  const fetchSellerProducts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/seller/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error('Failed to fetch products', e);
    }
  };

  useEffect(() => {
    fetchSellerProfile();
    fetchSellerProducts();
  }, []);

  const handleCreateProduct = async (isSubmit: boolean) => {
    if (!name || !brand || !price || !token) return;
    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name, brand, description, category, price: Number(price), msrp: Number(msrp), imageUrl, brandAuthDoc, isSubmit
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMessage(data.message);
        setName('');
        setBrand('');
        setDescription('');
        fetchSellerProducts();
        fetchSellerProfile();
      }
    } catch (e) {
      console.error('Create product error', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (productId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/products/${productId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        fetchSellerProducts();
      }
    } catch (e) {
      console.error('Submit product error', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-indigo-900/60 border border-emerald-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">TrustShield Verified Seller Portal</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Merchant Seller Control Center</h2>
          <p className="text-xs text-slate-300 mt-1">
            Products pass through Authenticity Agent evaluation before admin approval. Direct publishing is disabled for safety.
          </p>
        </div>

        {/* Quick Add Product Trigger */}
        <button 
          onClick={() => setActiveTab('Add Product')}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['Overview', 'My Products', 'Add Product', 'Approval Requests', 'Trust Score', 'Performance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === tab 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= OVERVIEW TAB ================= */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Total Listings</p>
              <p className="text-2xl font-black text-white mt-1">{products.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Approved Listings</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {products.filter(p => p.status === 'APPROVED').length}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Pending Approval</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {products.filter(p => ['PENDING_APPROVAL', 'AI_REVIEW', 'UNDER_ADMIN_REVIEW'].includes(p.status)).length}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Seller Trust Score</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {sellerProfile?.trustScore ? `${sellerProfile.trustScore}%` : 'Establishing'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Recent Listing Approvals &amp; AI Assessments</h3>
            {!products.length ? (
              <p className="text-xs text-slate-400">No products created yet.</p>
            ) : (
              <div className="space-y-3">
                {products.map(prod => (
                  <div key={prod.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{prod.name}</span>
                        <span className="text-slate-400">({prod.brand})</span>
                      </div>
                      <p className="text-slate-400 mt-0.5">Price: ₹{prod.price} | MSRP: ₹{prod.msrp}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        prod.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {prod.status}
                      </span>

                      {prod.status === 'DRAFT' && (
                        <button 
                          onClick={() => handleSubmitForApproval(prod.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Submit for Approval
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MY PRODUCTS TAB ================= */}
      {activeTab === 'My Products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">All Seller Listings</h3>
            <button 
              onClick={() => setActiveTab('Add Product')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              + Create Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(prod => (
              <div key={prod.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <img src={prod.imageUrl} alt={prod.name} className="w-full h-36 object-cover rounded-2xl bg-slate-950" />
                <h4 className="font-bold text-white text-sm line-clamp-1">{prod.name}</h4>
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Price: ₹{prod.price}</span>
                  <span>MSRP: ₹{prod.msrp}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    prod.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {prod.status}
                  </span>

                  {prod.status === 'DRAFT' && (
                    <button 
                      onClick={() => handleSubmitForApproval(prod.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= ADD PRODUCT TAB ================= */}
      {activeTab === 'Add Product' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <span>Create New Product Listing</span>
          </h3>

          <p className="text-xs text-slate-400">
            Lifecycle: <strong>DRAFT &rarr; PENDING_APPROVAL &rarr; AI_REVIEW &rarr; UNDER_ADMIN_REVIEW &rarr; APPROVED / BLOCKED / REJECTED</strong>.
          </p>

          {submitMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
              {submitMessage}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Product Title</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Apple AirPods Pro (2nd Gen)"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Brand Name</label>
                <input 
                  type="text" 
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Apple"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Fashion">Fashion</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Selling Price (₹)</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Brand MSRP (₹)</label>
                <input 
                  type="number" 
                  value={msrp}
                  onChange={e => setMsrp(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Product Image URL</label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Brand Authorization Document (Optional)</label>
              <input 
                type="text" 
                value={brandAuthDoc}
                onChange={e => setBrandAuthDoc(e.target.value)}
                placeholder="e.g. AUTH-APPLE-9921.pdf"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => handleCreateProduct(false)}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                Save Draft
              </button>

              <button 
                type="button" 
                onClick={() => handleCreateProduct(true)}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TRUST SCORE TAB ================= */}
      {activeTab === 'Trust Score' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Seller Trust Score Analysis</span>
          </h3>

          {!sellerProfile?.trustScore ? (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 text-xs text-center">
              Trust score is being established based on your initial approval history and order fulfillment records.
            </div>
          ) : (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Trust Score</span>
                <span className="text-2xl font-black text-emerald-400">{sellerProfile.trustScore}%</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-slate-300">
                <div className="p-3 bg-slate-900 rounded-xl">Approved Listings: {sellerProfile.approvedListingsCount}</div>
                <div className="p-3 bg-slate-900 rounded-xl">Total Orders: {sellerProfile.totalOrdersCount}</div>
                <div className="p-3 bg-slate-900 rounded-xl">Returns Filed: {sellerProfile.returnCount}</div>
                <div className="p-3 bg-slate-900 rounded-xl">Policy Violations: {sellerProfile.violationsCount}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
