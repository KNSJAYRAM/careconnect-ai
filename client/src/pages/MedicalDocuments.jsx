import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Search, Sparkles, Trash2, Calendar, Eye, Paperclip, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const MedicalDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewSnippetModal, setShowViewSnippetModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { addToast } = useToast();

  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'Blood Test',
    description: '',
    contentSnippet: '',
    uploadDate: new Date().toISOString().split('T')[0]
  });

  const categories = ['All', 'Blood Test', 'Scan', 'Prescription', 'Consultation Report', 'Discharge Summary', 'Other'];

  const fetchDocuments = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        addToast('Failed to fetch documents', 'error');
        setError('Failed to load medical documents. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      addToast('File size exceeds the 10MB limit', 'error');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      addToast(`Unsupported file type (${ext}). Allowed: PDF, PNG, JPG, JPEG, TXT, DOCX`, 'error');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Auto-fill document name if empty
    if (!uploadForm.name.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setUploadForm(prev => ({ ...prev, name: nameWithoutExt }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.name || !uploadForm.name.trim()) {
      addToast('Document name is required', 'error');
      return;
    }

    setUploading(true);
    try {
      addToast('Analyzing document & generating AI summary...', 'info');

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', uploadForm.name.trim());
        formData.append('type', uploadForm.type);
        formData.append('description', uploadForm.description || '');
        formData.append('contentSnippet', uploadForm.contentSnippet || '');
        formData.append('uploadDate', uploadForm.uploadDate);

        await api.post('/documents', formData);
      } else {
        await api.post('/documents', uploadForm);
      }

      addToast('Medical document uploaded & AI summarized!', 'success');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        name: '',
        type: 'Blood Test',
        description: '',
        contentSnippet: '',
        uploadDate: new Date().toISOString().split('T')[0]
      });
      fetchDocuments();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error uploading document', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this medical document record?')) {
      try {
        await api.delete(`/documents/${id}`);
        addToast('Document removed', 'info');
        fetchDocuments();
      } catch (err) {
        console.error(err);
        addToast('Error removing document', 'error');
      }
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.type === selectedCategory;
    const matchesSearch = (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Medical Documents</h1>
          <p>Upload medical records, lab reports, and imaging scans for AI analysis.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        backgroundColor: 'var(--bg-surface)',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search document name or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, margin: 0 }}>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setError(null); fetchDocuments(); }}>
            Retry
          </button>
        </div>
      )}

      {/* Documents Display */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-heading" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="card empty-state">
          <FileText size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No medical documents found</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Upload blood test results, radiological scans, or consultation notes to receive plain-language summaries.
          </p>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            <Upload size={16} /> Upload First Document
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredDocs.map((doc, index) => (
            <div
              key={doc._id}
              className="card card-hover animate-fadeInUp"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animationDelay: `${index * 60}ms` }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-blue">
                    {doc.type}
                  </span>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.2rem' }}
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{doc.name}</h3>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} /> {new Date(doc.uploadDate).toLocaleDateString()}
                  {doc.fileUrl && doc.fileUrl.startsWith('/uploads/') && (
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--color-brand-600)' }}>
                      <Paperclip size={12} /> File attached
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {doc.description || 'No description provided.'}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                {doc.contentSnippet && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setShowViewSnippetModal(doc)}
                  >
                    <Eye size={14} /> View Text
                  </button>
                )}
                <Link
                  to={`/documents/${doc._id}/summary`}
                  className="btn btn-teal btn-sm"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <Sparkles size={14} /> AI Summary
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal isOpen={showUploadModal} onClose={() => { setShowUploadModal(false); setSelectedFile(null); }} title="Upload & Analyze Medical Document">
        <form onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label className="form-label">Attach File (Optional: PDF, PNG, JPG, TXT, DOCX - Max 10MB)</label>
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-app)',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                id="doc-file-input"
                style={{ display: 'none' }}
                accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
                onChange={handleFileChange}
              />
              <label htmlFor="doc-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                {selectedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 600 }}>
                    <CheckCircle size={18} /> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                ) : (
                  <>
                    <Upload size={22} color="var(--color-brand-600)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Click to browse or drop file here</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Supports lab PDFs, doctor prescriptions, imaging scans</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Document Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Routine CBC Blood Test Report"
              value={uploadForm.name}
              onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <select
                className="form-select"
                value={uploadForm.type}
                onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
              >
                <option value="Blood Test">Blood Test</option>
                <option value="Scan">Scan (X-Ray / MRI / Ultrasound)</option>
                <option value="Prescription">Prescription</option>
                <option value="Consultation Report">Consultation Report</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Report Date</label>
              <input
                type="date"
                className="form-input"
                value={uploadForm.uploadDate}
                onChange={(e) => setUploadForm({ ...uploadForm, uploadDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Context</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Annual checkup routine blood work"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Extracted Text Snippet or Key Values (for AI analysis demo)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g., Fasting Blood Sugar: 98 mg/dL, Total Cholesterol: 210 mg/dL, Hemoglobin: 14.2 g/dL..."
              value={uploadForm.contentSnippet}
              onChange={(e) => setUploadForm({ ...uploadForm, contentSnippet: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
            <Sparkles size={16} /> {uploading ? 'Analyzing Document...' : 'Upload & Generate AI Summary'}
          </button>
        </form>
      </Modal>

      {/* View Snippet Modal */}
      {showViewSnippetModal && (
        <Modal isOpen={!!showViewSnippetModal} onClose={() => setShowViewSnippetModal(null)} title={showViewSnippetModal.name}>
          <div style={{ marginBottom: '1rem' }}>
            <span className="badge badge-blue">{showViewSnippetModal.type}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginLeft: '0.5rem' }}>
              Uploaded {new Date(showViewSnippetModal.uploadDate).toLocaleDateString()}
            </span>
          </div>
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
            {showViewSnippetModal.contentSnippet || 'No raw text snippet attached.'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowViewSnippetModal(null)}>Close</button>
            <Link to={`/documents/${showViewSnippetModal._id}/summary`} className="btn btn-teal btn-sm" style={{ textDecoration: 'none' }}>
              <Sparkles size={14} /> Open AI Summary
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MedicalDocuments;
