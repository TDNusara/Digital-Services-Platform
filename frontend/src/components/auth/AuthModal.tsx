import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, Briefcase, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register_customer' | 'apply_worker';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register_customer' | 'apply_worker'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setErrorMsg('');
    }
  }, [isOpen, initialTab]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        onClose();
      } else if (tab === 'register_customer') {
        await register({
          email,
          password,
          fullName,
          phone,
          role: 'CUSTOMER',
        });
        onClose();
      } else if (tab === 'apply_worker') {
        await register({
          email,
          password,
          fullName,
          phone,
          role: 'WORKER',
          headline,
          experienceYears,
          bio,
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={16} color="var(--primary-400)" />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>
              {tab === 'login'
                ? 'Sign In to TaskPulse'
                : tab === 'register_customer'
                ? 'Create Customer Account'
                : 'Apply as Freelance Specialist'}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            padding: '0.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: tab === 'login' ? 'var(--primary-600)' : 'transparent',
              color: '#FFFFFF',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register_customer'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: tab === 'register_customer' ? 'var(--primary-600)' : 'transparent',
              color: '#FFFFFF',
            }}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => { setTab('apply_worker'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: tab === 'apply_worker' ? 'var(--primary-600)' : 'transparent',
              color: '#FFFFFF',
            }}
          >
            Join as Worker
          </button>
        </div>

        {errorMsg && (
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
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab !== 'login' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Perera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter strong password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {tab !== 'login' && (
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          {tab === 'apply_worker' && (
            <>
              <div className="form-group">
                <label className="form-label">Professional Headline</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Excel Modeling Specialist & Data Analyst"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brief Bio & Qualifications</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your domain expertise, tools mastered, and typical project turnaround..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : tab === 'login'
              ? 'Sign In to Account'
              : tab === 'register_customer'
              ? 'Create Customer Account'
              : 'Submit Worker Application'}
          </button>
        </form>
      </div>
    </div>
  );
};
