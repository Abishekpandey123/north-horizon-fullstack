import { useCallback, useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, CircleAlert,
  ClipboardList, Download, Edit3, Eye, FileSpreadsheet, FileText, Filter,
  Globe, LogOut, Plus, RefreshCw, Search, Shield, ShieldAlert,
  ShieldCheck, Trash2, UserCheck, Users, X
} from 'lucide-react';
import {
  adminStorage, api, type AdminUser, type Announcement, type AuditLog,
  type Member, type Pagination, type Program, type Submission, type SubmissionStatus
} from './lib/api';

const statusBadgeLabel: Record<SubmissionStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  archived: 'Archived'
};

type TabKey = 'overview' | 'submissions' | 'programs' | 'announcements' | 'members' | 'users' | 'audit' | 'settings';

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => adminStorage.getToken());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => adminStorage.getUser());

  // Sign In Form States
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Overview / Analytics States
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    archived: number;
    byType: { type: string; count: number }[];
    byTier: { tier: string; count: number }[];
    members: { activeCount: number; votingPower: number };
    recentAudit: AuditLog[];
  }>({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    archived: 0,
    byType: [],
    byTier: [],
    members: { activeCount: 0, votingPower: 0 },
    recentAudit: []
  });

  // Submissions State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [subLoading, setSubLoading] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState('');
  const [subTypeFilter, setSubTypeFilter] = useState('');
  const [selectedSubIds, setSelectedSubIds] = useState<number[]>([]);
  const [inspectSubmission, setInspectSubmission] = useState<Submission | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');

  // Programs State
  const [adminPrograms, setAdminPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Partial<Program> | null>(null);

  // Announcements State
  const [adminAnnouncements, setAdminAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);

  // Members State
  const [adminMembers, setAdminMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);

  // Users State (Super Admin)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<AdminUser> & { password?: string } | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  // System Diagnostics State
  const [systemHealth, setSystemHealth] = useState<{ status: string; uptimeSeconds: number; database: string } | null>(null);

  // Global Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionLabel: 'Confirm',
    onConfirm: () => {}
  });

  // Toast Notification State
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // 1. Load Analytics
  const loadStats = useCallback(async (authToken: string) => {
    setStatsLoading(true);
    try {
      const data = await api.getAdminStats(authToken);
      setStats(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('expired')) {
        adminStorage.clear();
        setToken(null);
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 2. Load Submissions
  const loadSubmissions = useCallback(async (authToken: string, page = 1) => {
    setSubLoading(true);
    try {
      const data = await api.getSubmissions(authToken, {
        search: subSearch,
        status: subStatusFilter,
        type: subTypeFilter,
        page,
        limit: 15
      });
      setSubmissions(data.submissions);
      setPagination(data.pagination);
      setSelectedSubIds([]);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to load inquiries', 'error');
    } finally {
      setSubLoading(false);
    }
  }, [subSearch, subStatusFilter, subTypeFilter, addToast]);

  // 3. Load Programs
  const loadPrograms = useCallback(async (authToken: string) => {
    try {
      const data = await api.getAdminPrograms(authToken);
      setAdminPrograms(data.programs);
    } catch {}
  }, []);

  // 4. Load Announcements
  const loadAnnouncements = useCallback(async (authToken: string) => {
    try {
      const data = await api.getAdminAnnouncements(authToken);
      setAdminAnnouncements(data.announcements);
    } catch {}
  }, []);

  // 5. Load Members
  const loadMembers = useCallback(async (authToken: string) => {
    try {
      const data = await api.getAdminMembers(authToken, memberSearch);
      setAdminMembers(data.members);
    } catch {}
  }, [memberSearch]);

  // 6. Load Users
  const loadUsers = useCallback(async (authToken: string) => {
    if (currentUser?.role !== 'super_admin') return;
    try {
      const data = await api.getAdminUsers(authToken);
      setAdminUsers(data.users);
    } catch {}
  }, [currentUser]);

  // 7. Load Audit Logs
  const loadAuditLogs = useCallback(async (authToken: string, page = 1) => {
    try {
      const data = await api.getAuditLogs(authToken, page);
      setAuditLogs(data.logs);
      setAuditPage(data.page);
      setAuditTotalPages(data.totalPages);
    } catch {}
  }, []);

  // 8. Load Health
  const loadHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setSystemHealth(data);
    } catch {}
  }, []);

  // Trigger loads on Tab or Auth change
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'overview') {
      void loadStats(token);
    } else if (activeTab === 'submissions') {
      void loadSubmissions(token, 1);
    } else if (activeTab === 'programs') {
      void loadPrograms(token);
    } else if (activeTab === 'announcements') {
      void loadAnnouncements(token);
    } else if (activeTab === 'members') {
      void loadMembers(token);
    } else if (activeTab === 'users') {
      void loadUsers(token);
    } else if (activeTab === 'audit') {
      void loadAuditLogs(token, 1);
    } else if (activeTab === 'settings') {
      void loadHealth();
    }
  }, [token, activeTab, loadStats, loadSubmissions, loadPrograms, loadAnnouncements, loadMembers, loadUsers, loadAuditLogs, loadHealth]);

  // Sign In
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.login(loginUsername, loginPassword);
      adminStorage.setToken(res.token);
      adminStorage.setUser(res.user);
      setToken(res.token);
      setCurrentUser(res.user as AdminUser);
      setLoginPassword('');
      addToast(`Welcome back, ${res.user.fullName || res.user.username}!`);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoginLoading(false);
    }
  }

  // Sign Out
  function handleSignOut() {
    setConfirmDialog({
      isOpen: true,
      title: 'Sign Out',
      message: 'Are you sure you want to log out of the administration portal?',
      actionLabel: 'Sign Out',
      isDanger: false,
      onConfirm: () => {
        adminStorage.clear();
        setToken(null);
        setCurrentUser(null);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        addToast('You have been signed out successfully.', 'info');
      }
    });
  }

  // Update Submission Status
  async function updateStatus(id: number, status: SubmissionStatus, notes?: string) {
    if (!token) return;
    try {
      await api.updateSubmissionStatus(token, id, status, notes);
      addToast(`Inquiry #${id} status updated to ${statusBadgeLabel[status]}.`);
      void loadSubmissions(token, pagination.page);
      if (inspectSubmission && inspectSubmission.id === id) {
        setInspectSubmission(prev => prev ? { ...prev, status, admin_notes: notes !== undefined ? notes : prev.admin_notes } : null);
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  }

  // Delete Submission
  function deleteSingleSubmission(id: number) {
    if (!token) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Inquiry',
      message: `Permanently delete inquiry record #${id}? This action cannot be undone.`,
      actionLabel: 'Delete Record',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.deleteSubmission(token, id);
          addToast(`Inquiry #${id} deleted.`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          if (inspectSubmission?.id === id) setInspectSubmission(null);
          void loadSubmissions(token, pagination.page);
        } catch (err) {
          addToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
      }
    });
  }

  // Bulk Status Update
  async function handleBulkStatus(newStatus: SubmissionStatus) {
    if (!token || selectedSubIds.length === 0) return;
    try {
      await api.bulkSubmissions(token, 'status', selectedSubIds, newStatus);
      addToast(`Updated ${selectedSubIds.length} inquiries to ${statusBadgeLabel[newStatus]}.`);
      void loadSubmissions(token, pagination.page);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Bulk status update failed', 'error');
    }
  }

  // Bulk Delete
  function handleBulkDelete() {
    if (!token || selectedSubIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Delete Inquiries',
      message: `Are you sure you want to permanently delete ${selectedSubIds.length} selected inquiries?`,
      actionLabel: `Delete ${selectedSubIds.length} Inquiries`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.bulkSubmissions(token, 'delete', selectedSubIds);
          addToast(`Deleted ${selectedSubIds.length} inquiries.`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          void loadSubmissions(token, pagination.page);
        } catch (err) {
          addToast(err instanceof Error ? err.message : 'Bulk delete failed', 'error');
        }
      }
    });
  }

  // Save Program
  async function handleSaveProgram(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingProgram) return;

    try {
      if (editingProgram.id) {
        await api.updateProgram(token, editingProgram.id, editingProgram);
        addToast('Program updated successfully.');
      } else {
        await api.createProgram(token, editingProgram);
        addToast('Program created successfully.');
      }
      setEditingProgram(null);
      void loadPrograms(token);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save program', 'error');
    }
  }

  // Delete Program
  function handleDeleteProgram(id: number) {
    if (!token) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Focus Program',
      message: 'Remove this program from the foundation curriculum?',
      actionLabel: 'Delete Program',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.deleteProgram(token, id);
          addToast('Program removed.');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          void loadPrograms(token);
        } catch (err) {
          addToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
      }
    });
  }

  // Save Announcement
  async function handleSaveAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingAnnouncement) return;

    try {
      if (editingAnnouncement.id) {
        await api.updateAnnouncement(token, editingAnnouncement.id, editingAnnouncement);
        addToast('Announcement updated.');
      } else {
        await api.createAnnouncement(token, editingAnnouncement);
        addToast('Announcement posted.');
      }
      setEditingAnnouncement(null);
      void loadAnnouncements(token);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save announcement', 'error');
    }
  }

  // Delete Announcement
  function handleDeleteAnnouncement(id: number) {
    if (!token) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Announcement',
      message: 'Remove this announcement from the public website?',
      actionLabel: 'Delete',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.deleteAnnouncement(token, id);
          addToast('Announcement deleted.');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          void loadAnnouncements(token);
        } catch (err) {
          addToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
      }
    });
  }

  // Save Member
  async function handleSaveMember(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingMember) return;

    try {
      if (editingMember.id) {
        await api.updateMember(token, editingMember.id, editingMember);
        addToast('Member profile updated.');
      } else {
        await api.createMember(token, editingMember);
        addToast('Member enrolled successfully.');
      }
      setEditingMember(null);
      void loadMembers(token);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save member', 'error');
    }
  }

  // Delete Member
  function handleDeleteMember(id: number) {
    if (!token) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Member',
      message: 'Remove this member record from the official voting roster?',
      actionLabel: 'Remove Member',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.deleteMember(token, id);
          addToast('Member removed.');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          void loadMembers(token);
        } catch (err) {
          addToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
      }
    });
  }

  // Save Staff User
  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingUser) return;

    try {
      if (editingUser.id) {
        await api.updateUser(token, editingUser.id, {
          role: editingUser.role,
          is_active: editingUser.is_active === 1,
          password: editingUser.password || undefined,
          full_name: editingUser.full_name
        });
        addToast('Staff user updated.');
      } else {
        if (!editingUser.username || !editingUser.email || !editingUser.password) {
          addToast('Username, email, and password required.', 'error');
          return;
        }
        await api.createUser(token, {
          username: editingUser.username,
          email: editingUser.email,
          password: editingUser.password,
          role: editingUser.role || 'editor',
          full_name: editingUser.full_name
        });
        addToast('New staff account created.');
      }
      setEditingUser(null);
      void loadUsers(token);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save user', 'error');
    }
  }

  // Delete User
  function handleDeleteUser(id: number) {
    if (!token) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User Account',
      message: 'Revoke access and permanently delete this administrator account?',
      actionLabel: 'Delete Account',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.deleteUser(token, id);
          addToast('User account removed.');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          void loadUsers(token);
        } catch (err) {
          addToast(err instanceof Error ? err.message : 'Delete failed', 'error');
        }
      }
    });
  }

  // Export CSV
  function downloadCsv() {
    if (!token) return;
    const url = api.downloadCsvUrl(token);
    window.open(url, '_blank');
    addToast('Inquiries CSV download initiated.');
  }

  // Download DB Backup
  function downloadBackup() {
    if (!token) return;
    const url = api.downloadBackupUrl(token);
    window.open(url, '_blank');
    addToast('Full database JSON backup download initiated.');
  }

  // IF NOT AUTHENTICATED -> RENDER SIGN IN
  if (!token) {
    return (
      <div className="admin-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
            <div>
              <b style={{ fontSize: '18px', display: 'block', color: 'var(--text-primary)' }}>North Horizon Foundation</b>
              <small style={{ fontSize: '10px', color: 'var(--gold-hover)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700' }}>Admin Portal</small>
            </div>
          </div>

          <h2 style={{ fontSize: '24px', margin: '0 0 8px' }}>Staff Sign In</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px' }}>
            Access is restricted to authorized foundation directors, officers, and staff.
          </p>

          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label htmlFor="admin-user">Username or Email</label>
              <input
                id="admin-user"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                className="form-input"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-pass">Password</label>
              <input
                id="admin-pass"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="form-input"
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <div className="form-feedback error" style={{ margin: '14px 0' }}>
                <CircleAlert size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="button button-primary"
              style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In Securely'} <ShieldCheck size={16} />
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <a href="/" style={{ fontSize: '12px', color: 'var(--blue-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Public Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="admin-layout">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-item">
            {toast.type === 'success' ? <CheckCircle2 size={18} style={{ color: 'var(--green-primary)' }} /> : <AlertTriangle size={18} style={{ color: 'var(--red-primary)' }} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <header className="admin-top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} title="View Public Site">
            <img src="/logo.jpg" alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <b style={{ fontSize: '15px', color: 'var(--text-primary)' }}>North Horizon Foundation</b>
              <small style={{ fontSize: '9px', color: 'var(--gold-hover)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700' }}>Enterprise Administration</small>
            </div>
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {currentUser?.fullName || currentUser?.username}
            </span>
            <small style={{ fontSize: '10px', color: 'var(--blue-primary)', textTransform: 'uppercase', fontWeight: '700' }}>
              Role: {currentUser?.role}
            </small>
          </div>

          <a href="/" className="button button-outline button-sm">
            <Globe size={14} /> Website
          </a>

          <button
            type="button"
            className="button button-outline button-sm"
            onClick={handleSignOut}
            title="Log out"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="admin-nav-tabs" aria-label="Admin Navigation Tabs">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} /> Overview
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <ClipboardList size={16} /> Inquiries ({stats.total})
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'programs' ? 'active' : ''}`}
          onClick={() => setActiveTab('programs')}
        >
          <ShieldCheck size={16} /> Focus Programs
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          <FileText size={16} /> News & Events
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={16} /> Member Directory
        </button>
        {currentUser?.role === 'super_admin' && (
          <button
            type="button"
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Shield size={16} /> Staff RBAC
          </button>
        )}
        <button
          type="button"
          className={`admin-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <FileSpreadsheet size={16} /> Audit Trail
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <ShieldAlert size={16} /> System & Backups
        </button>
      </nav>

      {/* Tab Content Wrap */}
      <main className="admin-content-wrap">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', margin: 0 }}>Executive Overview</h1>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Real-time operational metrics for North Horizon Foundation Inc.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="button button-outline button-sm"
                  onClick={() => loadStats(token)}
                  disabled={statsLoading}
                >
                  <RefreshCw size={14} /> Refresh
                </button>
                <button
                  type="button"
                  className="button button-primary button-sm"
                  onClick={downloadCsv}
                >
                  <Download size={14} /> Export Inquiries CSV
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Total Inquiries</span>
                  <b>{stats.total}</b>
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-accent-blue)', color: 'var(--blue-primary)', display: 'grid', placeItems: 'center' }}>
                  <ClipboardList size={20} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>New / Pending</span>
                  <b style={{ color: '#d97706' }}>{stats.new}</b>
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-accent-gold)', color: '#d97706', display: 'grid', placeItems: 'center' }}>
                  <Activity size={20} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Voting Members</span>
                  <b style={{ color: 'var(--green-primary)' }}>{stats.members.activeCount}</b>
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-accent-green)', color: 'var(--green-primary)', display: 'grid', placeItems: 'center' }}>
                  <Users size={20} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>Total Voting Power</span>
                  <b style={{ color: 'var(--navy-secondary)' }}>{stats.members.votingPower} Votes</b>
                </div>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-accent-purple)', color: '#9333ea', display: 'grid', placeItems: 'center' }}>
                  <UserCheck size={20} />
                </div>
              </div>
            </div>

            {/* Breakdown Grids */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              <div className="admin-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 16px' }}>Inquiries by Category</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {stats.byType.map(item => (
                    <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '13px' }}>{item.type}</span>
                      <span style={{ fontWeight: '700', color: 'var(--blue-primary)' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 16px' }}>Tier Interest Distribution</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {stats.byTier.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No tier submissions recorded yet.</div>
                  ) : (
                    stats.byTier.map(item => (
                      <div key={item.tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px' }}>{item.tier} Tier</span>
                        <span style={{ fontWeight: '700', color: 'var(--gold-hover)' }}>{item.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div className="admin-panel">
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', margin: 0 }}>Recent Activity Stream</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className="button button-ghost button-sm"
                >
                  View Full Audit Trail <ArrowRight size={14} />
                </button>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentAudit.slice(0, 6).map(log => (
                      <tr key={log.id}>
                        <td><small style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</small></td>
                        <td><b>{log.username}</b></td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--blue-primary)' }}>{log.action}</span></td>
                        <td>{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}</td>
                        <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-subtle)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <Search size={14} style={{ color: 'var(--text-muted)' }} />
                  <input
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder="Search name, email, ref..."
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px' }}
                  />
                </div>

                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={subTypeFilter}
                  onChange={(e) => setSubTypeFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
                >
                  <option value="">All Categories</option>
                  <option value="contact">Contact</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="membership">Membership</option>
                  <option value="donation">Donation</option>
                </select>

                <button
                  type="button"
                  className="button button-outline button-sm"
                  onClick={() => loadSubmissions(token, 1)}
                  disabled={subLoading}
                >
                  <Filter size={14} /> Apply Filters
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedSubIds.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedSubIds.length} selected:</span>
                    <button
                      type="button"
                      className="button button-outline button-sm"
                      onClick={() => handleBulkStatus('resolved')}
                    >
                      Resolve Selected
                    </button>
                    <button
                      type="button"
                      className="button button-danger button-sm"
                      onClick={handleBulkDelete}
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="button button-outline button-sm"
                  onClick={downloadCsv}
                >
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={submissions.length > 0 && selectedSubIds.length === submissions.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSubIds(submissions.map(s => s.id));
                          else setSelectedSubIds([]);
                        }}
                      />
                    </th>
                    <th>Ref / Sender</th>
                    <th>Category</th>
                    <th>Contact Details</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subLoading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading records...</td></tr>
                  ) : submissions.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No inquiries match current criteria.</td></tr>
                  ) : (
                    submissions.map(sub => (
                      <tr key={sub.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedSubIds.includes(sub.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedSubIds(prev => [...prev, sub.id]);
                              else setSelectedSubIds(prev => prev.filter(id => id !== sub.id));
                            }}
                          />
                        </td>
                        <td>
                          <b style={{ fontSize: '13px', display: 'block' }}>{sub.name}</b>
                          <small style={{ fontFamily: 'monospace', color: 'var(--blue-primary)', fontSize: '11px' }}>
                            {sub.reference_code || `#${sub.id}`}
                          </small>
                        </td>
                        <td>
                          <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{sub.type}</span>
                          {sub.tier && <small style={{ display: 'block', color: 'var(--gold-hover)' }}>{sub.tier} Tier</small>}
                        </td>
                        <td>
                          <a href={`mailto:${sub.email}`} style={{ color: 'var(--blue-primary)', display: 'block' }}>{sub.email}</a>
                          {sub.phone && <small style={{ color: 'var(--text-muted)' }}>{sub.phone}</small>}
                        </td>
                        <td>
                          <select
                            className={`badge-status ${sub.status}`}
                            value={sub.status}
                            onChange={(e) => updateStatus(sub.id, e.target.value as SubmissionStatus)}
                            style={{ border: 'none', cursor: 'pointer', font: 'inherit' }}
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td>
                          <small style={{ color: 'var(--text-muted)' }}>{new Date(sub.created_at).toLocaleDateString()}</small>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="button button-ghost button-sm"
                            onClick={() => {
                              setInspectSubmission(sub);
                              setAdminNoteText(sub.admin_notes || '');
                            }}
                            title="Inspect Details"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            type="button"
                            className="button button-ghost button-sm"
                            style={{ color: 'var(--red-primary)' }}
                            onClick={() => deleteSingleSubmission(sub.id)}
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar">
              <span>Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="button button-outline button-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadSubmissions(token, pagination.page - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="button button-outline button-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadSubmissions(token, pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. FOCUS PROGRAMS TAB */}
        {activeTab === 'programs' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Foundation Focus Programs</h3>
                <small style={{ color: 'var(--text-muted)' }}>Manage curriculum, pillars, descriptions and public ordering</small>
              </div>
              <button
                type="button"
                className="button button-primary button-sm"
                onClick={() => setEditingProgram({ slug: '', title: '', description: '', icon: 'Sparkles', order_index: adminPrograms.length + 1, is_active: 1 })}
              >
                <Plus size={14} /> Add Program
              </button>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Icon</th>
                    <th>Title (English & Nepali)</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminPrograms.map(p => (
                    <tr key={p.id}>
                      <td><b>{p.order_index}</b></td>
                      <td><span style={{ padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: '6px', fontFamily: 'monospace' }}>{p.icon}</span></td>
                      <td>
                        <b style={{ display: 'block' }}>{p.title}</b>
                        {p.title_ne && <small style={{ color: 'var(--text-muted)' }}>{p.title_ne}</small>}
                      </td>
                      <td><code style={{ fontSize: '11px' }}>{p.slug}</code></td>
                      <td>
                        <span className={`badge-status ${p.is_active === 1 ? 'resolved' : 'archived'}`}>
                          {p.is_active === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="button button-ghost button-sm"
                          onClick={() => setEditingProgram(p)}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="button button-ghost button-sm"
                          style={{ color: 'var(--red-primary)' }}
                          onClick={() => handleDeleteProgram(p.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Announcements & Events</h3>
                <small style={{ color: 'var(--text-muted)' }}>Post updates, community assemblies, and initiatives</small>
              </div>
              <button
                type="button"
                className="button button-primary button-sm"
                onClick={() => setEditingAnnouncement({ title: '', summary: '', content: '', category: 'Update', date_label: 'Upcoming', is_published: 1 })}
              >
                <Plus size={14} /> New Announcement
              </button>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Date Label</th>
                    <th>Published</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminAnnouncements.map(a => (
                    <tr key={a.id}>
                      <td><span className="announcement-tag" style={{ margin: 0 }}>{a.category}</span></td>
                      <td>
                        <b style={{ display: 'block' }}>{a.title}</b>
                        <small style={{ color: 'var(--text-muted)' }}>{a.summary}</small>
                      </td>
                      <td>{a.date_label}</td>
                      <td>
                        <span className={`badge-status ${a.is_published === 1 ? 'resolved' : 'archived'}`}>
                          {a.is_published === 1 ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="button button-ghost button-sm"
                          onClick={() => setEditingAnnouncement(a)}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="button button-ghost button-sm"
                          style={{ color: 'var(--red-primary)' }}
                          onClick={() => handleDeleteAnnouncement(a.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. MEMBERS DIRECTORY TAB */}
        {activeTab === 'members' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-subtle)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <Search size={14} style={{ color: 'var(--text-muted)' }} />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search member name..."
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px' }}
                  />
                </div>
                <button
                  type="button"
                  className="button button-outline button-sm"
                  onClick={() => loadMembers(token)}
                >
                  Search
                </button>
              </div>

              <button
                type="button"
                className="button button-primary button-sm"
                onClick={() => setEditingMember({ name: '', email: '', phone: '', tier: 'Silver', votes: 1, status: 'active', joined_date: new Date().toISOString().split('T')[0] })}
              >
                <Plus size={14} /> Enroll Member
              </button>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Email / Phone</th>
                    <th>Tier Class</th>
                    <th>Voting Power</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminMembers.map(m => (
                    <tr key={m.id}>
                      <td><b>{m.name}</b></td>
                      <td>
                        <a href={`mailto:${m.email}`} style={{ color: 'var(--blue-primary)', display: 'block' }}>{m.email}</a>
                        {m.phone && <small style={{ color: 'var(--text-muted)' }}>{m.phone}</small>}
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: 'var(--gold-hover)' }}>{m.tier}</span>
                      </td>
                      <td>
                        <b style={{ color: 'var(--navy-secondary)' }}>{m.votes} Vote{m.votes > 1 ? 's' : ''}</b>
                      </td>
                      <td>
                        <span className={`badge-status ${m.status === 'active' ? 'resolved' : 'new'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td><small style={{ color: 'var(--text-muted)' }}>{m.joined_date}</small></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="button button-ghost button-sm"
                          onClick={() => setEditingMember(m)}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="button button-ghost button-sm"
                          style={{ color: 'var(--red-primary)' }}
                          onClick={() => handleDeleteMember(m.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. USERS & RBAC TAB (SUPER ADMIN) */}
        {activeTab === 'users' && currentUser?.role === 'super_admin' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Staff Accounts & Roles (RBAC)</h3>
                <small style={{ color: 'var(--text-muted)' }}>Super Admin, Admin, and Editor privilege governance</small>
              </div>
              <button
                type="button"
                className="button button-primary button-sm"
                onClick={() => setEditingUser({ username: '', email: '', password: '', role: 'admin', full_name: '', is_active: 1 })}
              >
                <Plus size={14} /> Add Staff Account
              </button>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name / Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(u => (
                    <tr key={u.id}>
                      <td><b>{u.username}</b></td>
                      <td>
                        <span>{u.full_name || 'Staff Member'}</span>
                        <small style={{ display: 'block', color: 'var(--text-muted)' }}>{u.email}</small>
                      </td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-accent-blue)', color: 'var(--blue-primary)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-status ${u.is_active === 1 ? 'resolved' : 'archived'}`}>
                          {u.is_active === 1 ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td><small style={{ color: 'var(--text-muted)' }}>{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</small></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="button button-ghost button-sm"
                          onClick={() => setEditingUser(u)}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            type="button"
                            className="button button-ghost button-sm"
                            style={{ color: 'var(--red-primary)' }}
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Security Audit Log Trail</h3>
                <small style={{ color: 'var(--text-muted)' }}>Immutable log of administrative logins, modifications, deletions and exports</small>
              </div>
              <button
                type="button"
                className="button button-outline button-sm"
                onClick={() => loadAuditLogs(token, auditPage)}
              >
                <RefreshCw size={14} /> Refresh Logs
              </button>
            </div>

            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      <td><small style={{ color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</small></td>
                      <td><b>{log.username}</b></td>
                      <td><code style={{ color: 'var(--blue-primary)', fontSize: '11px' }}>{log.action}</code></td>
                      <td>{log.entity_type}</td>
                      <td>{log.entity_id || '—'}</td>
                      <td>{log.details}</td>
                      <td><small style={{ fontFamily: 'monospace' }}>{log.ip_address}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-bar">
              <span>Page {auditPage} of {auditTotalPages}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="button button-outline button-sm"
                  disabled={auditPage <= 1}
                  onClick={() => loadAuditLogs(token, auditPage - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="button button-outline button-sm"
                  disabled={auditPage >= auditTotalPages}
                  onClick={() => loadAuditLogs(token, auditPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. SYSTEM SETTINGS & DISASTER RECOVERY TAB */}
        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div className="admin-panel" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>Disaster Recovery & Database Backups</h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Download automated database snapshots containing all inquiries, program configurations, members, and system settings.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={downloadBackup}
                >
                  <Download size={16} /> Download Full Database JSON Snapshot
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={downloadCsv}
                >
                  <FileSpreadsheet size={16} /> Export All Inquiries (.csv)
                </button>
              </div>
            </div>

            <div className="admin-panel" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>Live System Diagnostics</h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Server status and environment health checks.
              </p>
              {systemHealth ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Database</span>
                    <b style={{ display: 'block', fontSize: '16px', color: 'var(--green-primary)', marginTop: '4px' }}>
                      {systemHealth.database} (WAL SQLite)
                    </b>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Server Uptime</span>
                    <b style={{ display: 'block', fontSize: '16px', marginTop: '4px' }}>
                      {Math.floor(systemHealth.uptimeSeconds / 60)} minutes
                    </b>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>API Status</span>
                    <b style={{ display: 'block', fontSize: '16px', color: 'var(--green-primary)', marginTop: '4px' }}>
                      {systemHealth.status.toUpperCase()}
                    </b>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="button button-outline button-sm"
                  onClick={loadHealth}
                >
                  Run Health Diagnostics
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* INSPECT SUBMISSION DETAIL MODAL */}
      {inspectSubmission && (
        <div className="modal-overlay" onClick={() => setInspectSubmission(null)}>
          <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <b style={{ fontSize: '16px' }}>{inspectSubmission.name}</b>
                <small style={{ display: 'block', color: 'var(--blue-primary)', fontFamily: 'monospace' }}>
                  {inspectSubmission.reference_code || `#${inspectSubmission.id}`} · {inspectSubmission.type}
                </small>
              </div>
              <button type="button" onClick={() => setInspectSubmission(null)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px', padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block' }}>Email Address</small>
                  <a href={`mailto:${inspectSubmission.email}`} style={{ color: 'var(--blue-primary)', fontWeight: '600' }}>{inspectSubmission.email}</a>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block' }}>Phone Number</small>
                  <span>{inspectSubmission.phone || 'Not provided'}</span>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block' }}>Contribution Tier</small>
                  <b>{inspectSubmission.tier || 'None'}</b>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block' }}>Submitted Date</small>
                  <span>{new Date(inspectSubmission.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <b style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Message Body:</b>
                <div style={{ padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.6' }}>
                  {inspectSubmission.message}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="admin-notes">Internal Administrator Notes</label>
                <textarea
                  id="admin-notes"
                  rows={3}
                  className="form-textarea"
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  placeholder="Record follow-up actions, committee discussions, or referral contacts..."
                />
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status:</span>
                <select
                  value={inspectSubmission.status}
                  onChange={(e) => updateStatus(inspectSubmission.id, e.target.value as SubmissionStatus, adminNoteText)}
                  className="form-select"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="button button-primary button-sm"
                  onClick={() => updateStatus(inspectSubmission.id, inspectSubmission.status, adminNoteText)}
                >
                  Save Notes
                </button>
                <button
                  type="button"
                  className="button button-outline button-sm"
                  onClick={() => setInspectSubmission(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROGRAM MODAL */}
      {editingProgram && (
        <div className="modal-overlay" onClick={() => setEditingProgram(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProgram.id ? 'Edit Focus Program' : 'New Focus Program'}</h3>
              <button type="button" onClick={() => setEditingProgram(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProgram}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Title (English) *</label>
                    <input
                      required
                      className="form-input"
                      value={editingProgram.title || ''}
                      onChange={(e) => setEditingProgram(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Title (Nepali)</label>
                    <input
                      className="form-input"
                      value={editingProgram.title_ne || ''}
                      onChange={(e) => setEditingProgram(prev => ({ ...prev, title_ne: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Slug (unique lowercase) *</label>
                    <input
                      required
                      className="form-input"
                      value={editingProgram.slug || ''}
                      onChange={(e) => setEditingProgram(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon Name (e.g. GraduationCap, HandHeart, Palette, Compass)</label>
                    <input
                      className="form-input"
                      value={editingProgram.icon || 'Sparkles'}
                      onChange={(e) => setEditingProgram(prev => ({ ...prev, icon: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description (English) *</label>
                  <textarea
                    required
                    rows={3}
                    className="form-textarea"
                    value={editingProgram.description || ''}
                    onChange={(e) => setEditingProgram(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Description (Nepali)</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={editingProgram.description_ne || ''}
                    onChange={(e) => setEditingProgram(prev => ({ ...prev, description_ne: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-outline" onClick={() => setEditingProgram(null)}>Cancel</button>
                <button type="submit" className="button button-primary">Save Program</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL */}
      {editingAnnouncement && (
        <div className="modal-overlay" onClick={() => setEditingAnnouncement(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAnnouncement.id ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button type="button" onClick={() => setEditingAnnouncement(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAnnouncement}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      className="form-select"
                      value={editingAnnouncement.category || 'Update'}
                      onChange={(e) => setEditingAnnouncement(prev => ({ ...prev, category: e.target.value as Announcement['category'] }))}
                    >
                      <option value="Event">Event</option>
                      <option value="Community">Community</option>
                      <option value="Program">Program</option>
                      <option value="Notice">Notice</option>
                      <option value="Update">Update</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Label (e.g. Nov 2026 / Active)</label>
                    <input
                      className="form-input"
                      value={editingAnnouncement.date_label || ''}
                      onChange={(e) => setEditingAnnouncement(prev => ({ ...prev, date_label: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Title *</label>
                  <input
                    required
                    className="form-input"
                    value={editingAnnouncement.title || ''}
                    onChange={(e) => setEditingAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Summary *</label>
                  <textarea
                    required
                    rows={2}
                    className="form-textarea"
                    value={editingAnnouncement.summary || ''}
                    onChange={(e) => setEditingAnnouncement(prev => ({ ...prev, summary: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Full Content Details</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    value={editingAnnouncement.content || ''}
                    onChange={(e) => setEditingAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-outline" onClick={() => setEditingAnnouncement(null)}>Cancel</button>
                <button type="submit" className="button button-primary">Save Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="modal-overlay" onClick={() => setEditingMember(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMember.id ? 'Edit Member Profile' : 'Enroll New Member'}</h3>
              <button type="button" onClick={() => setEditingMember(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveMember}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      required
                      className="form-input"
                      value={editingMember.name || ''}
                      onChange={(e) => setEditingMember(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={editingMember.email || ''}
                      onChange={(e) => setEditingMember(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      className="form-input"
                      value={editingMember.phone || ''}
                      onChange={(e) => setEditingMember(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contribution Tier Class *</label>
                    <select
                      className="form-select"
                      value={editingMember.tier || 'Silver'}
                      onChange={(e) => {
                        const newTier = e.target.value as Member['tier'];
                        const autoVotes = (newTier === 'Royal' || newTier === 'Founding Member') ? 25 : newTier === 'Elite' ? 15 : newTier === 'Diamond' ? 5 : newTier === 'Gold' ? 3 : 1;
                        setEditingMember(prev => ({ ...prev, tier: newTier, votes: autoVotes }));
                      }}
                    >
                      <option value="Silver">Silver ($1,000–$2,499 · 1 vote)</option>
                      <option value="Gold">Gold ($2,500–$4,999 · 3 votes)</option>
                      <option value="Diamond">Diamond ($5,000–$9,999 · 5 votes)</option>
                      <option value="Elite">Elite ($10,000–$24,999 · 15 votes)</option>
                      <option value="Royal">Royal ($25,000+ · 25 votes)</option>
                      <option value="Founding Member">Founding Member (25 votes)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Assigned Votes (per Bylaws Section 2.2)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={editingMember.votes || 1}
                      onChange={(e) => setEditingMember(prev => ({ ...prev, votes: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Good Standing Status</label>
                    <select
                      className="form-select"
                      value={editingMember.status || 'active'}
                      onChange={(e) => setEditingMember(prev => ({ ...prev, status: e.target.value as Member['status'] }))}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending Verification</option>
                      <option value="honorary">Honorary</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Internal Board Notes / Committee Role</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    value={editingMember.notes || ''}
                    onChange={(e) => setEditingMember(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-outline" onClick={() => setEditingMember(null)}>Cancel</button>
                <button type="submit" className="button button-primary">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL (SUPER ADMIN) */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser.id ? 'Edit Staff Account' : 'New Staff Account'}</h3>
              <button type="button" onClick={() => setEditingUser(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      required
                      disabled={!!editingUser.id}
                      className="form-input"
                      value={editingUser.username || ''}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      className="form-input"
                      value={editingUser.full_name || ''}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      disabled={!!editingUser.id}
                      className="form-input"
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Security Role *</label>
                    <select
                      className="form-select"
                      value={editingUser.role || 'editor'}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value as AdminUser['role'] }))}
                    >
                      <option value="editor">Editor (View inquiries & edit content)</option>
                      <option value="admin">Admin (Manage inquiries, members, programs)</option>
                      <option value="super_admin">Super Admin (Full access, RBAC, backups)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{editingUser.id ? 'Change Password (leave empty to keep current)' : 'Password *'}</label>
                  <input
                    type="password"
                    minLength={6}
                    required={!editingUser.id}
                    className="form-input"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={editingUser.id ? '••••••••' : 'Minimum 6 characters'}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="button button-primary">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL CONFIRMATION MODAL */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} style={{ color: confirmDialog.isDanger ? 'var(--red-primary)' : 'var(--gold-hover)' }} />
                <h3 style={{ margin: 0, fontSize: '18px' }}>{confirmDialog.title}</h3>
              </div>
              <button type="button" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                {confirmDialog.message}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`button ${confirmDialog.isDanger ? 'button-danger' : 'button-primary'}`}
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
