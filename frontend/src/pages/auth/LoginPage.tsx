import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  initialRole?: 'CUSTOMER' | 'WORKER' | 'ADMIN';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  initialRole = 'CUSTOMER',
}) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'WORKER' | 'ADMIN'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roleConfigs = {
    CUSTOMER: {
      title: 'Customer Login',
      subtitle: 'Access your orders, review quotations, make escrow payments, and download quality-checked deliverables.',
      demoEmail: 'customer@example.com',
      demoPass: 'Customer@12345',
      badgeColor: 'var(--primary-400)',
      icon: User,
    },
    WORKER: {
      title: 'Specialist & Freelancer Login',
      subtitle: 'Access your task offers, submit completed drafts for Admin QC, and track your wallet earnings.',
      demoEmail: 'worker@example.com',
      demoPass: 'Worker@12345',
      badgeColor: '#38BDF8',
      icon: Briefcase,
    },
    ADMIN: {
      title: 'Administrator Control Login',
      subtitle: 'Manage client quotations, approve deliverables via quality-check, assign specialists, and oversee platform revenue.',
      demoEmail: 'admin@taskpulse.lk',
      demoPass: 'Admin@12345',
      badgeColor: 'var(--warning)',
      icon: ShieldCheck,
    },
  };

  const currentConfig = roleConfigs[selectedRole];
  const Icon = currentConfig.icon;

  const handleRoleTabClick = (role: 'CUSTOMER' | 'WORKER' | 'ADMIN') => {
    setSelectedRole(role);
    setErrorMessage('');
  };

  const handleFillDemo = (role: 'CUSTOMER' | 'WORKER' | 'ADMIN') => {
    setSelectedRole(role);
    setEmail(roleConfigs[role].demoEmail);
    setPassword(roleConfigs[role].demoPass);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      // Route user to their independent role portal
      if (loggedUser.role === 'ADMIN') {
        onNavigate('admin-control');
      } else if (loggedUser.role === 'WORKER') {
        onNavigate('worker-workspace');
      } else {
        onNavigate('customer-portal');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: '3rem 1.5rem 5rem 1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Back to Home Navigation */}
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-sub)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Home</span>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '3.2rem',
              height: '3.2rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-600), #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Icon size={26} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{currentConfig.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {currentConfig.subtitle}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            padding: '0.3rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleTabClick('CUSTOMER')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.825rem',
              backgroundColor: selectedRole === 'CUSTOMER' ? 'var(--primary-600)' : 'transparent',
              color: selectedRole === 'CUSTOMER' ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabClick('WORKER')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.825rem',
              backgroundColor: selectedRole === 'WORKER' ? 'var(--primary-600)' : 'transparent',
              color: selectedRole === 'WORKER' ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Specialist
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabClick('ADMIN')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.825rem',
              backgroundColor: selectedRole === 'ADMIN' ? 'var(--primary-600)' : 'transparent',
              color: selectedRole === 'ADMIN' ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Admin
          </button>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <span>Email Address</span>
                <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ marginBottom: '0.35rem' }}>
                  <span>Password</span>
                  <span className="required">*</span>
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-sub)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                marginTop: '0.5rem',
              }}
            >
              <span>{isLoading ? 'Signing In...' : `Sign In as ${selectedRole === 'CUSTOMER' ? 'Customer' : selectedRole === 'WORKER' ? 'Specialist' : 'Admin'}`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.6rem', textAlign: 'center' }}>
              Instant 1-Click Demo Fill:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleFillDemo('CUSTOMER')}
                style={{
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('WORKER')}
                style={{
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                💼 Specialist
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('ADMIN')}
                style={{
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer Registration Links */}
        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            Don't have a customer account?{' '}
            <button
              onClick={() => onNavigate('register-customer')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-400)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Register as Customer
            </button>
          </div>
          <div>
            Want to work and earn?{' '}
            <button
              onClick={() => onNavigate('register-worker')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Apply as Freelance Specialist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
