import React from 'react';
import { RoleType, UserAccount } from '../../types';
import { ShieldCheck, Globe, User, Store, ShieldAlert, LogOut, Home } from 'lucide-react';

interface HeaderProps {
  currentRole: RoleType;
  user: UserAccount | null;
  onRoleChange: (role: RoleType) => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, user, onRoleChange, onLogout, onGoHome }) => {
  return (
    <header className={`${currentRole === 'admin' ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800'} border-b sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 transition-colors duration-200`}>
      {/* Brand & Data Sovereignty Badge */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={onGoHome}>
        <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-white tracking-tight">TrustShield AI</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              MVP v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>Region: ap-south-1 (India VPC)</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">DPDP Compliant</span>
          </p>
        </div>
      </div>

      {/* Role Switcher Controls */}
      <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 shadow-inner">
        <button
          onClick={() => onRoleChange('customer')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentRole === 'customer'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Customer</span>
        </button>

        <button
          onClick={() => onRoleChange('seller')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentRole === 'seller'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Seller Center</span>
        </button>

        <button
          onClick={() => onRoleChange('admin')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentRole === 'admin'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin Command</span>
        </button>
      </div>

      {/* Profile & Logout */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md ${
            currentRole === 'customer' ? 'bg-indigo-600' : currentRole === 'seller' ? 'bg-emerald-600' : 'bg-purple-600'
          }`}>
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TS'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">
              {user?.name || user?.email || (currentRole.toUpperCase())}
            </p>
            <p className="text-[10px] text-slate-400">
              Role: <span className="text-indigo-300 font-bold uppercase">{user?.role || currentRole}</span>
            </p>
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition ml-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
