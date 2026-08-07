import React, { useState, useEffect } from 'react';
import { RoleType, UserAccount } from './types';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<RoleType>('landing');
  const [targetLoginRole, setTargetLoginRole] = useState<RoleType>('customer');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('trustshield_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setCurrentUser({
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              token
            });
            setCurrentRole(data.user.role.toLowerCase() as RoleType);
          }
        })
        .catch(err => console.error('Auth verification error', err));
    }
  }, []);

  const handleNavigateLogin = (role?: RoleType) => {
    if (role && role !== 'landing' && role !== 'login') {
      setTargetLoginRole(role);
    } else {
      setTargetLoginRole('customer');
    }
    setCurrentRole('login');
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    const roleLower = user.role.toLowerCase() as RoleType;
    setCurrentRole(roleLower);
  };

  const handleRoleChange = (role: RoleType) => {
    if (!currentUser || currentUser.role.toLowerCase() !== role) {
      // Require authentication for target role
      handleNavigateLogin(role);
    } else {
      setCurrentRole(role);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('trustshield_token');
    setCurrentUser(null);
    setCurrentRole('login');
  };

  const handleGoHome = () => {
    setCurrentRole('landing');
  };

  if (currentRole === 'landing') {
    return <LandingPage onNavigateLogin={handleNavigateLogin} />;
  }

  if (currentRole === 'login') {
    return (
      <LoginPage 
        initialRole={targetLoginRole}
        onLoginSuccess={handleLoginSuccess}
        onBackLanding={handleGoHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Universal Header */}
      <Header 
        currentRole={currentRole} 
        user={currentUser}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
      />

      {/* Role-Based Dashboard View */}
      {currentRole === 'customer' && <CustomerDashboard />}
      {currentRole === 'seller' && <SellerDashboard />}
      {currentRole === 'admin' && <AdminDashboard />}
    </div>
  );
};

export default App;
