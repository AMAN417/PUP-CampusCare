import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import type { User, UserRole } from '../../types';
import { storage } from '../../utils/storage';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { UserPlus } from 'lucide-react';

interface UserManagementProps {
  onNavigate?: (path: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = () => {
  const { success } = useToast();

  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    department: 'Computer Science & Engineering',
    rollNo: '',
    phone: '',
  });

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      searchQuery === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.rollNo && u.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const toggleUserStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus: 'Active' | 'Inactive' = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    const target = updated.find((u) => u.id === userId);
    if (target) {
      storage.saveUser(target);
      success('User Updated', `${target.name} is now ${target.status}`);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const created: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      rollNo: newUser.role === 'student' ? newUser.rollNo || `PUP2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      phone: newUser.phone || '+91 98000 00000',
      joinedDate: new Date().toISOString().slice(0, 10),
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    storage.saveUser(created);
    setUsers(storage.getUsers());
    setShowAddModal(false);
    setNewUser({
      name: '',
      email: '',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNo: '',
      phone: '',
    });
    success('User Created', `${created.name} added to portal users.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, letterSpacing: '-0.025em' }}>Campus User Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Manage registered students, faculty members, and campus administrative maintenance officers.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          leftIcon={<UserPlus size={18} />}
        >
          Add Demo User
        </Button>
      </div>

      {/* Filter and Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, roll number, or department..."
          />
        </div>

        {/* Role Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            background: 'var(--clay-inset-bg)',
            padding: '4px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--clay-inset-shadow)',
            overflowX: 'auto',
            maxWidth: '100%',
          }}
        >
          {(['ALL', 'student', 'admin', 'faculty'] as (UserRole | 'ALL')[]).map((r) => {
            const isActive = roleFilter === r;
            const labels: Record<string, string> = {
              ALL: 'All Users',
              student: 'Students',
              admin: 'Staff / Admin',
              faculty: 'Faculty',
            };
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                style={{
                  border: 'none',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--pup-maroon)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.825rem',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="custom-table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Department</th>
                <th>Contact Info</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={u.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        {u.rollNo && (
                          <div style={{ fontSize: '0.725rem', color: 'var(--pup-maroon)', fontWeight: 700 }}>
                            Roll: {u.rollNo}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background:
                          u.role === 'admin'
                            ? 'var(--pup-navy-subtle)'
                            : u.role === 'student'
                            ? 'var(--pup-maroon-subtle)'
                            : '#FEF3C7',
                        color:
                          u.role === 'admin'
                            ? 'var(--pup-navy)'
                            : u.role === 'student'
                            ? 'var(--pup-maroon)'
                            : '#B45309',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>{u.department}</td>
                  <td>
                    <div style={{ fontSize: '0.825rem' }}>
                      {u.phone && <div>{u.phone}</div>}
                      {u.hostel && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.hostel}</div>}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {u.joinedDate || '2024'}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        color: u.status === 'Active' ? '#059669' : '#64748B',
                        background: u.status === 'Active' ? '#ECFDF5' : '#F1F5F9',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant={u.status === 'Active' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleUserStatus(u.id)}
                    >
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Campus Demo User"
      >
        <form onSubmit={handleAddUser}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Jaspreet Kaur"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="name@pup.ac.in"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrator / Maintenance Staff</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Roll No. / Staff ID</label>
              <input
                type="text"
                className="form-input"
                value={newUser.rollNo}
                onChange={(e) => setNewUser({ ...newUser, rollNo: e.target.value })}
                placeholder="e.g. PUP2026-CS-012"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              placeholder="Department Name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="+91 98000 00000"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
