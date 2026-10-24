import React, { useState } from 'react';
import {
  Briefcase,
  User,
  Mail,
  Lock,
  Phone,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WorkerRegisterPageProps {
  onNavigate: (page: string) => void;
  categories: any[];
}

export const WorkerRegisterPage: React.FC<WorkerRegisterPageProps> = ({
  onNavigate,
  categories,
}) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [bio, setBio] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Full name, email address, and password are required.');
      return;
    }

    if (!headline.trim()) {
      setErrorMessage('Please specify your professional headline / specialty.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role: 'WORKER',
        headline: headline.trim(),
        experienceYears: parseInt(experienceYears) || 0,
        bio: bio.trim() || undefined,
        categoryIds: selectedCategoryIds,
        password,
      });
      // Redirect directly to the independent Worker Workspace!
      onNavigate('worker-workspace');
    } catch (err: any) {
      setErrorMessage(err.message || 'Worker application failed. Please check your details.');
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
      <div style={{ width: '100%', maxWidth: '580px' }}>
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
              background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Briefcase size={26} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Join as a Freelance Specialist</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Deliver verified student assignments, corporate reports, Excel models, CV revamps, and earn an 80% direct payout.
          </p>
        </div>

        {/* Card */}
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
                <span>Full Name</span>
                <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  color="var(--text-sub)"
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kamal Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
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
                    placeholder="worker@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Phone Number</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    color="var(--text-sub)"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+94 76 555 4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Professional Headline / Specialty</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Excel Analyst & Report Typesetting Specialist"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Experience</span>
                </label>
                <select
                  className="form-select"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                >
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                  <option value="5">5+ Years</option>
                  <option value="8">8+ Years</option>
                  <option value="10">10+ Years</option>
                </select>
              </div>
            </div>

            {/* Service Categories of Expertise */}
            {categories.length > 0 && (
              <div className="form-group">
                <label className="form-label">
                  <span>Primary Specializations (Select all that apply)</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {categories.map((c) => {
                    const isSelected = selectedCategoryIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategory(c.id)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: isSelected ? '1px solid #38BDF8' : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-sub)',
                        }}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <span>Brief Bio & Software Tools</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Detail software expertise (Word, Excel, PowerPoint, Python, Canva) or previous work completed..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Password</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Confirm Password</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Award size={18} color="#38BDF8" />
              <span>Specialist submissions are quality-checked by our admin team before client delivery. Fast payouts guaranteed.</span>
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
                backgroundColor: '#0284C7',
                borderColor: '#0284C7',
              }}
            >
              <span>{isLoading ? 'Submitting Application...' : 'Submit Specialist Application'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered as a specialist?{' '}
          <button
            onClick={() => onNavigate('login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#38BDF8',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
