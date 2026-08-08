import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, ShieldCheck, Clock, AlertTriangle, ChevronRight, 
  HelpCircle, CheckCircle2, Lock, Zap, FileText, X, AlertCircle, 
  ShoppingCart, Star, Send, ArrowRight, RefreshCw, Eye, Tag
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
  status: string;
  authenticityScore: number;
  counterfeitProbability: number;
  riskLevel: string;
  sellerName: string;
  sellerTrustScore: number;
  isPurchasable: boolean;
}

interface Order {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
  sellerName: string;
  items: Array<{ productId: string; quantity: number; price: number; productName: string; imageUrl: string }>;
}

export const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cart & Checkout State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('COD');
  const [checkoutResult, setCheckoutResult] = useState<any | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Return Request Form
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('Wrong item received / Empty box');
  const [returnDesc, setReturnDesc] = useState('');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  // Review Submission Form
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewResult, setReviewResult] = useState<any | null>(null);

  const token = localStorage.getItem('trustshield_token');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?role=CUSTOMER');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error('Failed to fetch products', e);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/customer/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    }
  };

  const fetchReturns = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/customer/returns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.returns) setReturnsList(data.returns);
    } catch (e) {
      console.error('Failed to fetch returns', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchReturns();
  }, []);

  const addToCart = (product: Product) => {
    if (!product.isPurchasable) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (!cart.length || !token) return;
    setCheckingOut(true);
    setCheckoutResult(null);

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity })),
          paymentMethod
        })
      });

      const data = await res.json();
      setCheckoutResult(data);
      if (res.ok && data.status === 'PLACED') {
        setCart([]);
        fetchOrders();
      }
    } catch (e) {
      console.error('Checkout error', e);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId || !token) return;

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: returnOrderId,
          reason: returnReason,
          description: returnDesc
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReturnSubmitted(true);
        fetchReturns();
      }
    } catch (e) {
      console.error('Return error', e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProductId || !token) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: reviewProductId,
          rating: reviewRating,
          reviewText
        })
      });
      const data = await res.json();
      setReviewResult(data);
      setReviewText('');
    } catch (e) {
      console.error('Review error', e);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/60 border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">TrustShield Verified Customer Experience</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Protected Marketplace Shopping</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Every product is pre-screened by the Authenticity Agent. All transactions and COD orders undergo real-time Risk Scoring.
          </p>
        </div>

        {/* Cart Trigger */}
        <button 
          onClick={() => setShowCheckoutModal(true)}
          className="relative px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          <span className="ml-1 px-2 py-0.5 bg-indigo-950/80 rounded-lg text-indigo-200">₹{cartTotal.toLocaleString()}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['Shop', 'My Orders', 'Returns', 'Reviews', 'Safety Center'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === tab 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= SHOP TAB ================= */}
      {activeTab === 'Shop' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span>Available Marketplace Products</span>
            </h3>
            <span className="text-xs text-slate-400">
              Only <strong className="text-emerald-400 font-bold">APPROVED</strong> products are purchasable
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(prod => (
              <div key={prod.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover opacity-90 hover:scale-105 transition duration-300" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {prod.status === 'APPROVED' ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>APPROVED</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{prod.status.replace(/_/g, ' ')}</span>
                        </span>
                      )}
                    </div>

                    {/* Authenticity Badge */}
                    {prod.authenticityScore && (
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono font-bold text-indigo-300 backdrop-blur-md">
                        Score: {prod.authenticityScore}/100
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">{prod.brand}</span>
                      <span>Seller: {prod.sellerName} (Trust: {prod.sellerTrustScore ? `${prod.sellerTrustScore}%` : 'New'})</span>
                    </div>

                    <h4 className="text-base font-bold text-white line-clamp-1">{prod.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{prod.description}</p>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-black text-white">₹{prod.price.toLocaleString()}</span>
                      {prod.msrp > prod.price && (
                        <span className="text-xs text-slate-500 line-through">₹{prod.msrp.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Trust Verification</span>
                  </button>

                  <button
                    disabled={!prod.isPurchasable}
                    onClick={() => addToCart(prod)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      prod.isPurchasable
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{prod.isPurchasable ? 'Add to Cart' : 'Not Purchasable'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MY ORDERS TAB ================= */}
      {activeTab === 'My Orders' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>My Order History</span>
          </h3>

          {!orders.length ? (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-400">
              No orders placed yet. Browse the Shop to place your first verified order!
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(ord => (
                <div key={ord.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-white">{ord.id}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        {ord.paymentMethod}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        ord.status === 'PLACED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Placed on {new Date(ord.createdAt).toLocaleString()} • Seller: {ord.sellerName}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Amount</p>
                      <p className="text-lg font-black text-white">₹{ord.totalAmount.toLocaleString()}</p>
                    </div>

                    <button 
                      onClick={() => { setReturnOrderId(ord.id); setActiveTab('Returns'); }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Request Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= RETURNS TAB ================= */}
      {activeTab === 'Returns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Submit Return Request</span>
            </h3>

            {returnSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Return request submitted! Sent to Admin &amp; Risk Scoring Agent for claim validation.</span>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Order ID</label>
                  <select 
                    value={returnOrderId} 
                    onChange={e => setReturnOrderId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="">-- Choose Order --</option>
                    {orders.map(o => <option key={o.id} value={o.id}>{o.id} (₹{o.totalAmount})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Return Reason</label>
                  <select 
                    value={returnReason} 
                    onChange={e => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Empty box claim / Weight discrepancy">Empty box claim / Weight discrepancy</option>
                    <option value="Counterfeit / Fake product received">Counterfeit / Fake product received</option>
                    <option value="Damaged item">Damaged item</option>
                    <option value="Defective unit">Defective unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Description</label>
                  <textarea 
                    rows={3}
                    value={returnDesc}
                    onChange={e => setReturnDesc(e.target.value)}
                    placeholder="Provide details about the issue..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg">
                  Submit Return Claim
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Your Return Requests</h3>
            {!returnsList.length ? (
              <p className="text-xs text-slate-400">No return requests filed yet.</p>
            ) : (
              <div className="space-y-3">
                {returnsList.map(ret => (
                  <div key={ret.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between font-mono font-bold text-white">
                      <span>Order: {ret.orderId}</span>
                      <span className="text-indigo-400">{ret.status}</span>
                    </div>
                    <p className="text-slate-300 font-semibold">{ret.reason}</p>
                    <p className="text-slate-400 text-[11px]">{ret.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= REVIEWS TAB ================= */}
      {activeTab === 'Reviews' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span>Submit Product Review</span>
          </h3>

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Purchased Product</label>
              <select 
                value={reviewProductId} 
                onChange={e => setReviewProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Rating</label>
              <select 
                value={reviewRating} 
                onChange={e => setReviewRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Good</option>
                <option value={3}>3 Stars - Average</option>
                <option value={2}>2 Stars - Poor</option>
                <option value={1}>1 Star - Suspicious / Bad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Review Text</label>
              <textarea 
                rows={3}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              <span>Submit Review for Moderation</span>
            </button>
          </form>

          {reviewResult && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Review Moderation Result</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  reviewResult.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {reviewResult.status}
                </span>
              </div>
              <p className="text-slate-300">{reviewResult.orchestration?.aiResult?.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* ================= CHECKOUT MODAL ================= */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Marketplace Checkout</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!cart.length ? (
              <p className="text-xs text-slate-400 text-center py-6">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl text-xs">
                      <div>
                        <p className="font-bold text-white">{item.product.name}</p>
                        <p className="text-slate-400">Qty: {item.quantity} × ₹{item.product.price}</p>
                      </div>
                      <p className="font-mono font-bold text-indigo-300">₹{(item.quantity * item.product.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'CARD', 'COD'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method as any)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                          paymentMethod === method 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {checkoutResult && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">TrustShield Risk Check</span>
                      <span className={checkoutResult.status === 'PLACED' ? 'text-emerald-400' : 'text-rose-400'}>
                        {checkoutResult.status}
                      </span>
                    </div>
                    {checkoutResult.riskEvaluation?.aiResult?.explanation && (
                      <div className="p-3 bg-slate-900 rounded-xl text-slate-300 text-[11px] font-mono whitespace-pre-wrap">
                        {checkoutResult.riskEvaluation.aiResult.explanation}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
                >
                  {checkingOut ? 'Running Risk Agent...' : `Confirm Order (₹${cartTotal.toLocaleString()})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PRODUCT DETAIL MODAL ================= */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">TrustShield Authenticity Verification</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-24 h-24 object-cover rounded-2xl bg-slate-950" />
              <div>
                <h4 className="font-bold text-white text-sm">{selectedProduct.name}</h4>
                <p className="text-xs text-slate-400">Brand: {selectedProduct.brand} • Seller: {selectedProduct.sellerName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-emerald-400">₹{selectedProduct.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 line-through">₹{selectedProduct.msrp.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Approval Status</span>
                <span className="text-indigo-400">{selectedProduct.status}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Authenticity Score</span>
                <span className="text-emerald-400">{selectedProduct.authenticityScore || 95}/100</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Counterfeit Risk Level</span>
                <span className="text-amber-400">{selectedProduct.riskLevel || 'LOW'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Seller Trust Status</span>
                <span className="text-slate-200">{selectedProduct.sellerTrustScore ? `${selectedProduct.sellerTrustScore}% Score` : 'Trust score being established'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
