import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  initialRole?: 'CUSTOMER' | 'WORKER' | 'ADMIN';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

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
      // Route user automatically to their dedicated role workspace
      if (loggedUser.role === 'ADMIN') {
        onNavigate('admin-control');
      } else if (loggedUser.role === 'WORKER') {
        onNavigate('worker-workspace');
      } else {
        onNavigate('customer-portal');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
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
        minHeight: '82vh',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Back to Home Navigation */}
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-sub)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            padding: 0,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-sub)')}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '3.4rem',
              height: '3.4rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-600), #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Lock size={24} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.45rem', color: '#FFFFFF' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Sign in to access your digital workspace, track orders, and manage deliverables.
          </p>
        </div>

        {/* Login Card */}
        <div
          className="glass-card"
          style={{
            padding: '2.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
          }}
        >
          {errorMessage && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-md)',
                color: '#FCA5A5',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {forgotMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: 'var(--radius-md)',
                color: '#C7D2FE',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                lineHeight: 1.4,
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary-400)' }} />
              <span>To reset your password, please contact support at <strong>support@taskpulse.lk</strong> with your registered email.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                <span>Email Address</span>
                <span className="required" style={{ color: 'var(--danger)', marginLeft: '0.2rem' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    paddingLeft: '2.6rem',
                    height: '2.85rem',
                    fontSize: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  <span>Password</span>
                  <span className="required" style={{ color: 'var(--danger)', marginLeft: '0.2rem' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(!forgotMsg)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-400)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    paddingLeft: '2.6rem',
                    paddingRight: '2.75rem',
                    height: '2.85rem',
                    fontSize: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-sub)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.2rem',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                />
                <span>Remember me on this device</span>
              </label>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Security badge footer */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              color: 'var(--text-sub)',
              fontSize: '0.75rem',
            }}
          >
            <ShieldCheck size={14} color="var(--success)" />
            <span>Encrypted & protected with platform escrow assurance</span>
          </div>
        </div>

        {/* Registration Links */}
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            Need digital services?{' '}
            <button
              onClick={() => onNavigate('register-customer')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-400)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Create a Customer Account
            </button>
          </div>
          <div>
            Are you a specialist?{' '}
            <button
              onClick={() => onNavigate('register-worker')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
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

export default LoginPage;
