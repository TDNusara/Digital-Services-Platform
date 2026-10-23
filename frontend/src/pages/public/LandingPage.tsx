import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Table,
  Presentation,
  Briefcase,
  Code,
  Search,
  BookOpen,
  Palette,
  FileCheck,
  Layers,
  TrendingUp,
  Star,
  Users,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  categories: any[];
  onSelectCategory: (slug: string) => void;
  openNewOrderModal: () => void;
  setCurrentTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  categories,
  onSelectCategory,
  openNewOrderModal,
  setCurrentTab,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen size={24} color="#818CF8" />;
      case 'FileText': return <FileText size={24} color="#38BDF8" />;
      case 'Table': return <Table size={24} color="#34D399" />;
      case 'Presentation': return <Presentation size={24} color="#FBBF24" />;
      case 'Briefcase': return <Briefcase size={24} color="#F472B6" />;
      case 'Search': return <Search size={24} color="#A78BFA" />;
      case 'Code': return <Code size={24} color="#2DD4BF" />;
      case 'Palette': return <Palette size={24} color="#FB923C" />;
      case 'FileCheck': return <FileCheck size={24} color="#60A5FA" />;
      case 'Layers': return <Layers size={24} color="#C084FC" />;
      case 'TrendingUp': return <TrendingUp size={24} color="#4ADE80" />;
      default: return <Sparkles size={24} color="#818CF8" />;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ padding: '5rem 0 4rem 0', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          {/* Trust Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--primary-300)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.75rem',
            }}
          >
            <ShieldCheck size={16} color="var(--primary-400)" />
            <span>The Managed Digital Services Platform — Quality Checked on Every Job</span>
          </div>

          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: '920px',
              margin: '0 auto 1.5rem auto',
            }}
          >
            Professional Digital, Document & Technical Services{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Delivered Flawlessly.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              maxWidth: '720px',
              margin: '0 auto 2.5rem auto',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}
          >
            Get expert assistance with Microsoft Word reports, advanced Excel models, high-stakes investor pitch decks, ATS resumes, Python scripts, and bespoke digital tasks. Every order is reviewed and verified by an Administrator before release.
          </p>

          {/* CTA Cluster */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3.5rem',
            }}
          >
            <button className="btn btn-primary btn-lg" onClick={openNewOrderModal}>
              <Sparkles size={18} />
              <span>Request a Service</span>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setCurrentTab('catalog')}>
              <span>Browse Digital Services</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => setCurrentTab('register-customer')}
              style={{ borderColor: 'rgba(99, 102, 241, 0.5)', color: 'var(--primary-300)' }}
            >
              <Users size={18} />
              <span>Register as Customer</span>
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => setCurrentTab('register-worker')}
              style={{ borderColor: 'rgba(56, 189, 248, 0.5)', color: '#38BDF8' }}
            >
              <Briefcase size={18} />
              <span>Join as Specialist</span>
            </button>
          </div>

          {/* Trust Metric Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1050px',
              margin: '0 auto',
            }}
          >
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <CheckCircle2 size={20} color="var(--success)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Admin Quality Gate
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Work is reviewed and corrected before customer delivery.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <ShieldCheck size={20} color="var(--accent-cyan)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  100% Escrow Protection
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Funds are released to the worker only when you approve the deliverable.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <Clock size={20} color="var(--warning)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  On-Time Guarantee
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Strict turnaround countdown timers and worker assignment tracking.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <Award size={20} color="#C084FC" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Verified Freelancers
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Workers undergo skill evaluation and credential verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 12 Core Categories Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Comprehensive Service Categories
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto' }}>
              Explore our wide catalog of digital and document services tailored for business owners, corporate executives, researchers, and job applicants.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="glass-card interactive"
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setCurrentTab('catalog');
                }}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem', color: 'var(--text-main)' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {cat.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--primary-400)',
                  }}
                >
                  <span>{cat._count?.services || 0} Digital Services</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The TaskPulse Managed Agency Advantage */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Why Clients Choose TaskPulse
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              How our managed quality-gate model outperforms open freelance platforms.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              maxWidth: '1000px',
              margin: '0 auto',
            }}
          >
            {/* Traditional Freelance sites */}
            <div
              className="glass-card"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.25)',
                background: 'rgba(239, 68, 68, 0.03)',
              }}
            >
              <h3 style={{ color: '#F87171', marginBottom: '1rem', fontSize: '1.25rem' }}>
                ⚠️ Traditional Open Freelance Sites
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#EF4444' }}>✕</span> Unmonitored direct negotiations and high risk of ghosting.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#EF4444' }}>✕</span> Zero quality check before delivery; high defect rate.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#EF4444' }}>✕</span> Cumbersome refund arbitration when deliverables are poor.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#EF4444' }}>✕</span> Currency conversion markups and non-local payment barriers.
                </li>
              </ul>
            </div>

            {/* TaskPulse Advantage */}
            <div
              className="glass-card"
              style={{
                borderColor: 'rgba(99, 102, 241, 0.5)',
                background: 'rgba(99, 102, 241, 0.05)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <h3 style={{ color: '#818CF8', marginBottom: '1rem', fontSize: '1.25rem' }}>
                ✨ The TaskPulse Managed Guarantee
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Administrator assigns verified, vetted specialists.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Quality Assurance (QC) gate inspects files prior to release.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> 100% Escrow safe: payment released upon customer signoff.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> PayHere integration supporting local LKR & cards seamlessly.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 4-Step Stepper */}
      <section style={{ padding: '4rem 0', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              How TaskPulse Works
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              From initial upload to verified delivery in 4 streamlined steps.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1.75rem',
            }}
          >
            <div className="glass-card" style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--primary-400)',
                  marginBottom: '0.75rem',
                }}
              >
                01
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Submit Request & Files</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Select a fixed-price service or describe custom requirements and upload relevant documents.
              </p>
            </div>

            <div className="glass-card" style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--accent-cyan)',
                  marginBottom: '0.75rem',
                }}
              >
                02
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Quotation & Escrow</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Admin reviews requirements and provides a transparent quote. Pay securely via PayHere into platform escrow.
              </p>
            </div>

            <div className="glass-card" style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#C084FC',
                  marginBottom: '0.75rem',
                }}
              >
                03
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Execution & QC Gate</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Assigned worker completes the task. Admin inspects deliverables against specifications for quality.
              </p>
            </div>

            <div className="glass-card" style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--success)',
                  marginBottom: '0.75rem',
                }}
              >
                04
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Download & Approve</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Download your completed files, request revisions if needed, and release funds with a 5-star rating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Reviews Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Verified Client Testimonials
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              See what professionals and business owners say about TaskPulse.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div className="glass-card">
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: '#FBBF24' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FBBF24" />
                ))}
              </div>
              <p style={{ fontSize: '0.925rem', fontStyle: 'italic', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                "TaskPulse transformed my raw financial data into an investor-grade Excel dashboard in under 36 hours. The quality check made sure every formula was accurate."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  N
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Niroshan Fernando</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>SME Managing Director</div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: '#FBBF24' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FBBF24" />
                ))}
              </div>
              <p style={{ fontSize: '0.925rem', fontStyle: 'italic', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                "Got my executive CV restructured with ATS keywords. Landed 3 interviews within a fortnight! Outstanding professionalism and smooth payment with PayHere."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '50%',
                    backgroundColor: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  A
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Anushka De Silva</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Senior Business Analyst</div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: '#FBBF24' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FBBF24" />
                ))}
              </div>
              <p style={{ fontSize: '0.925rem', fontStyle: 'italic', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                "Our 40-page technical proposal needed strict corporate styling and auto-updating tables. Delivered cleanly ahead of schedule."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '50%',
                    backgroundColor: '#06B6D4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  K
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kavinda Rajapaksha</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Tech Lead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '3rem 0',
          backgroundColor: 'rgba(11, 15, 25, 0.95)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
              Task<span style={{ color: 'var(--primary-400)' }}>Pulse</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)', margin: 0 }}>
              © 2026 TaskPulse Digital Services Platform. All rights reserved.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Academic Integrity Policy</span>
            <span style={{ color: 'var(--text-muted)' }}>Escrow & Refund Terms</span>
            <span style={{ color: 'var(--text-muted)' }}>PayHere Sandbox Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
