import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  UploadCloud,
  File,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  services: any[];
  preSelectedService: any | null;
  onOrderCreated: (order: any) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  categories,
  services,
  preSelectedService,
  onOrderCreated,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [targetDeadline, setTargetDeadline] = useState('');
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, any>>({});
  const [dynamicSchema, setDynamicSchema] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default target deadline to 48 hours from now
  useEffect(() => {
    const d = new Date(Date.now() + 48 * 3600 * 1000);
    setTargetDeadline(d.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    if (preSelectedService) {
      setSelectedServiceId(preSelectedService.id);
      setTitle(`Order for ${preSelectedService.title}`);
      loadSchemaForService(preSelectedService);
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
      setTitle(`Order for ${services[0].title}`);
      loadSchemaForService(services[0]);
    }
  }, [preSelectedService, services]);

  const loadSchemaForService = (service: any) => {
    try {
      const parsed = typeof service.requirementSchema === 'string'
        ? JSON.parse(service.requirementSchema)
        : service.requirementSchema;
      setDynamicSchema(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setDynamicSchema([]);
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedServiceId(sId);
    const s = services.find((srv) => srv.id === sId);
    if (s) {
      setTitle(`Order for ${s.title}`);
      loadSchemaForService(s);
      setDynamicFormValues({});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDynamicChange = (fieldId: string, val: any) => {
    setDynamicFormValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please specify an order title.');
      return;
    }

    if (!targetDeadline) {
      setErrorMsg('Please choose a desired completion deadline.');
      return;
    }

    // Validate required dynamic fields
    for (const field of dynamicSchema) {
      if (field.required && !dynamicFormValues[field.id]) {
        setErrorMsg(`Please fill in the required field: "${field.label}"`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const selectedService = services.find((s) => s.id === selectedServiceId);
      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('targetDeadline', new Date(targetDeadline).toISOString());
      formData.append('requirementsData', JSON.stringify(dynamicFormValues));

      if (selectedService) {
        formData.append('serviceId', selectedService.id);
        formData.append('categoryId', selectedService.categoryId);
      }

      // Attach files
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await api.post('/orders', formData);
      onOrderCreated(res.order);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
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
              <Sparkles size={16} color="var(--primary-400)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Create New Service Request</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                100% Escrow Protected & Quality Checked
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
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
          {/* Service Selection */}
          <div className="form-group">
            <label className="form-label">
              <span>Select Service Package</span>
              <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={selectedServiceId}
              onChange={handleServiceChange}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {s.basePrice > 0 ? `LKR ${s.basePrice.toLocaleString()}` : 'Custom Quoted'}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Deadline in 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <span>Order Reference Title</span>
                <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Executive CV Revamp for Tech Lead"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Target Deadline</span>
                <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Requirements Form Section */}
          {dynamicSchema.length > 0 && (
            <div
              style={{
                marginTop: '1rem',
                marginBottom: '1.5rem',
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--primary-300)' }}>
                📋 Service Requirement Specifications
              </h4>

              {dynamicSchema.map((field) => (
                <div key={field.id} className="form-group">
                  <label className="form-label">
                    <span>{field.label}</span>
                    {field.required && <span className="required">*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      className="form-select"
                      value={dynamicFormValues[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    >
                      <option value="">-- Choose an option --</option>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="form-textarea"
                      placeholder={field.placeholder || ''}
                      value={dynamicFormValues[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      className="form-input"
                      placeholder={field.placeholder || ''}
                      value={dynamicFormValues[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* File Upload Dropzone */}
          <div className="form-group">
            <label className="form-label">
              <span>Attach Initial Files / Drafts (Optional)</span>
            </label>
            <div
              style={{
                border: '2px dashed var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('order-file-input')?.click()}
            >
              <UploadCloud size={32} color="var(--primary-400)" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Click to browse files (Word, Excel, PowerPoint, PDF, ZIP)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
                Max file size: 50MB per file. Authenticated streaming access only.
              </div>
              <input
                id="order-file-input"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedFiles.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.6rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <File size={14} color="var(--primary-400)" />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                    <span style={{ color: 'var(--text-sub)' }}>
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Summary Banner */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              margin: '1.25rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Estimated Service Fee:
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                {currentService && currentService.basePrice > 0 ? (
                  <span>LKR {currentService.basePrice.toLocaleString()}</span>
                ) : (
                  <span style={{ color: 'var(--primary-300)', fontSize: '1rem' }}>
                    Itemized Quote by Admin
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', textAlign: 'right' }}>
              <div>🛡️ 100% Escrow Protection</div>
              <div>⚡ 2 Free Revisions Included</div>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Submitting Order...</span>
              ) : (
                <>
                  <span>Submit Order for Review</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
