import React, { useEffect, useState, useCallback } from 'react';
import { CheckSquare, PlusCircle, Trash2, Edit2, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const Followups = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  const fetchFollowups = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get('/followups');
      setFollowups(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        addToast('Error loading follow-ups', 'error');
        setError('Failed to load. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  const openAddModal = () => {
    setEditingFollowup(null);
    setForm({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setEditingFollowup(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      dueDate: item.dueDate || new Date().toISOString().split('T')[0],
      status: item.status || 'Pending'
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.title.trim() || !form.dueDate) {
      addToast('Title and due date are required', 'error');
      return;
    }

    try {
      if (editingFollowup) {
        await api.put(`/followups/${editingFollowup._id}`, form);
        addToast('Follow-up task updated successfully', 'success');
      } else {
        await api.post('/followups', form);
        addToast('Follow-up task created', 'success');
      }
      setShowAddModal(false);
      setEditingFollowup(null);
      setForm({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0], status: 'Pending' });
      fetchFollowups();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error saving follow-up', 'error');
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/followups/${item._id}`, { status: nextStatus });
      addToast(`Task marked as ${nextStatus}`, 'success');
      fetchFollowups();
    } catch (err) {
      console.error(err);
      addToast('Failed to update task', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this follow-up task?')) {
      try {
        await api.delete(`/followups/${id}`);
        addToast('Task deleted', 'info');
        fetchFollowups();
      } catch (err) {
        console.error(err);
        addToast('Error deleting task', 'error');
      }
    }
  };

  const isTaskOverdue = (item) => {
    if (item.status === 'Completed') return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return item.dueDate < todayStr;
  };

  const getStatusBadge = (item) => {
    if (item.status === 'Completed') {
      return <span className="badge badge-completed"><CheckCircle2 size={12} /> Completed</span>;
    }
    if (isTaskOverdue(item) || item.status === 'Overdue') {
      return <span className="badge badge-overdue"><AlertCircle size={12} /> Overdue</span>;
    }
    return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Follow-up Task Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track post-consultation tasks, diagnostic test follow-ups, and self-care logs.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <PlusCircle size={16} /> Create Task
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, margin: 0, color: 'var(--text-main)' }}>{error}</p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setError(null); fetchFollowups(); }}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-heading" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      ) : followups.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={40} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3>No follow-up tasks pending</h3>
          <p>Create tasks to remind yourself of lab re-checks, prescription refills, or lifestyle trackers.</p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <PlusCircle size={16} /> Add First Follow-up
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {followups.map((item, index) => {
            const overdue = isTaskOverdue(item);
            return (
              <div
                key={item._id}
                className="card card-hover animate-fadeInUp"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.1rem 1.5rem',
                  borderLeft: item.status === 'Completed'
                    ? '4px solid #16a34a'
                    : overdue
                    ? '4px solid #ef4444'
                    : '4px solid #d97706',
                  opacity: item.status === 'Completed' ? 0.8 : 1,
                  animationDelay: `${index * 60}ms`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={item.status === 'Completed'}
                    onChange={() => handleToggleStatus(item)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-brand-600)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        textDecoration: item.status === 'Completed' ? 'line-through' : 'none',
                        color: item.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-main)'
                      }}>
                        {item.title}
                      </h3>
                      {getStatusBadge(item)}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      {item.description || 'No notes provided.'}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} /> Due Date: {item.dueDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.3rem' }}
                    title="Edit task"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0.3rem' }}
                    title="Delete task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create / Edit Follow-up */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingFollowup(null); }}
        title={editingFollowup ? 'Edit Follow-up Task' : 'Create Follow-up Task'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Review Blood Panel with Dr. Sarah"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input
              type="date"
              className="form-input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detail specific action items or doctor notes..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {editingFollowup ? 'Update Task' : 'Save Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Followups;
