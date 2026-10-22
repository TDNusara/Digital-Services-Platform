import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  FileCheck,
  Tag,
} from 'lucide-react';

interface ServiceCatalogPageProps {
  categories: any[];
  services: any[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onSelectServiceToOrder: (service: any) => void;
}

export const ServiceCatalogPage: React.FC<ServiceCatalogPageProps> = ({
  categories,
  services,
  selectedCategory,
  onSelectCategory,
  onSelectServiceToOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter((s) => {
    const matchesCat = !selectedCategory || s.category?.slug === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shortSummary?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Services Catalog
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Browse fixed-price standard packages or submit bespoke service requests.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="var(--text-sub)"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by keywords (e.g. ATS Resume, Excel Formulas, Pitch Deck, Python)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-sub)', marginRight: '0.25rem' }}>
            Categories:
          </span>
          <button
            onClick={() => onSelectCategory(null)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === null ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
              backgroundColor: selectedCategory === null ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === null ? 'var(--primary-300)' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            All Categories ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedCategory === cat.slug ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                backgroundColor: selectedCategory === cat.slug ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === cat.slug ? 'var(--primary-300)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FileCheck size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No services found matching criteria</h3>
          <p style={{ marginTop: '0.5rem' }}>
            Try resetting your search filter or request a custom bespoke quote.
          </p>
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearchTerm('');
              onSelectCategory(null);
            }}
            style={{ marginTop: '1.5rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {filteredServices.map((service) => {
            let fieldCount = 0;
            try {
              const schema = JSON.parse(service.requirementSchema);
              fieldCount = Array.isArray(schema) ? schema.length : 0;
            } catch (e) {
              fieldCount = 0;
            }

            return (
              <div
                key={service.id}
                className="glass-card interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary-300)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {service.category?.name || 'Digital Service'}
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-sub)',
                      }}
                    >
                      <Clock size={14} />
                      <span>{service.turnaroundHours}h Turnaround</span>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem', color: 'var(--text-main)' }}>
                    {service.title}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {service.shortSummary}
                  </p>

                  {fieldCount > 0 && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.775rem',
                        color: 'var(--accent-cyan)',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1rem',
                      }}
                    >
                      <Tag size={12} />
                      <span>{fieldCount} requirement specifications defined</span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      Starting Price
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {service.basePrice > 0 ? (
                        <span>LKR {service.basePrice.toLocaleString()}</span>
                      ) : (
                        <span style={{ color: 'var(--primary-300)', fontSize: '1.1rem' }}>
                          Custom Quoted
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelectServiceToOrder(service)}
                  >
                    <span>Order Service</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
