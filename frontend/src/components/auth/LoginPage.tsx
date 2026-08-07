import React, { useState } from 'react';
import { ShieldCheck, User, Store, ShieldAlert, ArrowRight, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { RoleType, UserAccount } from '../../types';

interface LoginPageProps {
  initialRole?: RoleType;
  onLoginSuccess: (user: UserAccount) => void;
  onBackLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialRole = 'customer', onLoginSuccess, onBackLanding }) => {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'seller' | 'admin'>(
    initialRole === 'landing' || initialRole === 'login' ? 'customer' : initialRole
  );

  const [email, setEmail] = useState('customer@trustshield.demo');
  const [password, setPassword] = useState('customer123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSelect = (role: 'customer' | 'seller' | 'admin') => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'customer') {
      setEmail('customer@trustshield.demo');
      setPassword('customer123');
    } else if (role === 'seller') {
      setEmail('seller@trustshield.demo');
      setPassword('seller123');
    } else {
      setEmail('admin@trustshield.demo');
      setPassword('admin123');
    }
  };

  const handleDemoCredentials = () => {
    handleRoleSelect(selectedRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token & call success handler
      localStorage.setItem('trustshield_token', data.token);
      onLoginSuccess({
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        token: data.token
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10" />

      {/* Brand Header */}
      <div className="mb-8 text-center cursor-pointer" onClick={onBackLanding}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 p-0.5 shadow-xl shadow-indigo-500/20 mx-auto mb-3">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">TrustShield AI</h1>
        <p className="text-xs text-slate-400 mt-1">Trust &amp; Safety Marketplace Platform</p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Sign In to Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Select demo role to populate pre-seeded credentials</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('customer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              selectedRole === 'customer'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('seller')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              selectedRole === 'seller'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Seller</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              selectedRole === 'admin'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="e.g. user@trustshield.demo"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleDemoCredentials}
              className="w-full py-2 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Auto-fill Demo Credentials</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-indigo-500/30 rounded text-white">
                {selectedRole}
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-2 ${
              selectedRole === 'customer'
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                : selectedRole === 'seller'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Login as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security / Compliance footer notice */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access Control Protected</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Data Sovereignty: Pinned to India VPC (ap-south-1)</p>
        </div>
      </div>

      <button 
        onClick={onBackLanding}
        className="mt-6 text-xs text-slate-400 hover:text-slate-200 transition"
      >
        &larr; Back to Landing Page
      </button>
    </div>
  );
};
