import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import type { ComplaintCategory, Priority } from '../../types';
import { CATEGORY_METADATA } from '../../data/mockData';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import {
  PlusCircle,
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Image as ImageIcon,
  Flame,
  Home,
  GraduationCap,
  Zap,
  Droplets,
  Sparkles,
  Wifi,
  Bus,
  Building2,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

interface SubmitComplaintProps {
  onNavigate: (path: string) => void;
  defaultCategory?: ComplaintCategory;
}

const CATEGORY_ICONS: Record<ComplaintCategory, React.ReactNode> = {
  Hostel: <Home size={18} />,
  Classroom: <GraduationCap size={18} />,
  Electricity: <Zap size={18} />,
  Water: <Droplets size={18} />,
  Sanitation: <Sparkles size={18} />,
  Internet: <Wifi size={18} />,
  Transportation: <Bus size={18} />,
  Infrastructure: <Building2 size={18} />,
  Security: <ShieldAlert size={18} />,
  Other: <HelpCircle size={18} />,
};

export const SubmitComplaint: React.FC<SubmitComplaintProps> = ({
  onNavigate,
  defaultCategory = 'Hostel',
}) => {
  const { createComplaint } = useComplaints();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(defaultCategory);
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<
    { id: string; name: string; size: string; type: string; url: string; uploadedAt: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);

  // Common campus locations for quick selection
  const locationSuggestions = [
    'Banda Singh Bahadur Hostel - Block A',
    'Banda Singh Bahadur Hostel - Block C',
    'Mai Bhago Girls Hostel - Block A',
    'Mai Bhago Girls Hostel - Block B',
    'Department of Computer Science - Lab 302',
    'Department of Electronics - 2nd Floor',
    'Bhai Kahn Singh Nabha Central Library - 3rd Floor',
    'Arts Faculty Building - Ground Floor',
    'Sports Pavilion & Gymnasium',
    'Campus Gate 1 Shuttle Stand',
  ];

  // Handle simulated image attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      const newAtt = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'image/jpeg',
        url:
          result ||
          'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
      };
      setAttachments((prev) => [...prev, newAtt]);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) return;

    setIsSubmitting(true);
    try {
      const created = createComplaint({
        title: title.trim(),
        category,
        location: location.trim(),
        priority,
        description: description.trim(),
        attachments,
      });

      setCreatedComplaintId(created.id);
    } catch (err) {
      console.error('Error submitting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setAttachments([]);
    setCreatedComplaintId(null);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Submit a Campus Complaint</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
          Provide clear details and optional photo evidence to expedite maintenance routing and resolution.
        </p>
      </div>

      <Card style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Complaint Title / Summary *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water cooler leaking on 2nd floor corridor"
              required
              maxLength={120}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Keep it concise and descriptive. (Max 120 characters)
            </div>
          </div>

          {/* Category Selector Grid */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.6rem',
                marginTop: '0.4rem',
              }}
            >
              {(Object.keys(CATEGORY_METADATA) as ComplaintCategory[]).map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--pup-maroon)' : 'var(--border-light)'}`,
                      background: isSelected ? 'var(--pup-maroon-subtle)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--pup-maroon)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ color: isSelected ? 'var(--pup-maroon)' : 'var(--text-muted)' }}>
                      {CATEGORY_ICONS[cat]}
                    </div>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Quick Fill */}
          <div className="form-group">
            <label className="form-label">Campus Location / Department / Room *</label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Banda Singh Bahadur Hostel - Block C, Room 214"
                required
              />
            </div>

            {/* Quick Location Chips */}
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem', alignSelf: 'center' }}>
                Suggestions:
              </span>
              {locationSuggestions.slice(0, 4).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="form-group">
            <label className="form-label">Priority Level *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {[
                { level: 'Low' as Priority, desc: 'Minor cosmetic / routine fix', color: '#059669', bg: '#ECFDF5' },
                { level: 'Medium' as Priority, desc: 'Regular maintenance issue', color: '#2563EB', bg: '#EFF6FF' },
                { level: 'High' as Priority, desc: 'Affects daily classes or studies', color: '#D97706', bg: '#FEF3C7' },
                { level: 'Urgent' as Priority, desc: 'Safety hazard or total outage', color: '#DC2626', bg: '#FEF2F2' },
              ].map((p) => {
                const isSelected = priority === p.level;
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriority(p.level)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? p.color : 'var(--border-light)'}`,
                      background: isSelected ? p.bg : 'var(--bg-surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.875rem', color: p.color }}>
                      {p.level === 'Urgent' && <Flame size={14} />}
                      <span>{p.level}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              rows={4}
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is wrong, when it started happening, and any specific equipment details..."
              required
            />
          </div>

          {/* Attachment Upload Dropzone */}
          <div className="form-group">
            <label className="form-label">Photo / Evidence Attachment (Optional)</label>
            <div
              style={{
                border: '2px dashed var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--bg-main)',
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
                aria-label="Upload photo attachment"
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--pup-maroon)',
                  }}
                >
                  <Upload size={20} />
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Click or drag photo here to attach
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports JPG, PNG, PDF up to 10MB
                </div>
              </div>
            </div>

            {/* Attached files preview */}
            {attachments.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '4px 10px',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <ImageIcon size={14} style={{ color: 'var(--pup-maroon)' }} />
                    <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {att.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({att.size})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                      }}
                      aria-label="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('/student/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<PlusCircle size={18} />}
            >
              Submit Complaint
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Success Modal */}
      <Modal
        isOpen={!!createdComplaintId}
        onClose={() => {
          if (createdComplaintId) {
            onNavigate(`/student/complaints/${createdComplaintId}`);
          }
        }}
        title="Complaint Registered Successfully!"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Complaint Reference Generated
          </h3>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--pup-maroon)',
              background: 'var(--pup-maroon-subtle)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'inline-block',
              margin: '0.5rem 0 1rem 0',
              border: '1px solid rgba(122, 18, 40, 0.2)',
            }}
          >
            {createdComplaintId}
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 auto 1.5rem auto', maxWidth: '420px' }}>
            Your complaint has been logged into the PUP CampusCare maintenance queue. Department officers have been alerted and will review your ticket.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (createdComplaintId) onNavigate(`/student/complaints/${createdComplaintId}`);
              }}
              rightIcon={<ArrowRight size={16} />}
              style={{ width: '100%' }}
            >
              Track Complaint & View Timeline
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                handleResetForm();
              }}
              style={{ width: '100%' }}
            >
              Submit Another Issue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
