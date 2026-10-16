export type SubmissionType = 'contact' | 'volunteer' | 'membership' | 'donation';
export type SubmissionStatus = 'new' | 'in_progress' | 'resolved' | 'archived';

export interface SubmissionInput {
  type: SubmissionType;
  name: string;
  email: string;
  phone?: string;
  tier?: string;
  subject?: string;
  message: string;
}

export interface Program {
  id: number;
  slug: string;
  icon: string;
  title: string;
  title_ne?: string;
  description: string;
  description_ne?: string;
  detail: string;
  detail_ne?: string;
  order_index?: number;
  is_active?: number;
}

export interface Announcement {
  id: number;
  title: string;
  title_ne?: string;
  summary: string;
  summary_ne?: string;
  content: string;
  category: 'Event' | 'Community' | 'Update' | 'Program' | 'Notice';
  date_label: string;
  is_published?: number;
  created_at: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  tier: 'Silver' | 'Gold' | 'Diamond' | 'Elite' | 'Royal' | 'Founding Member';
  votes: number;
  status: 'active' | 'pending' | 'honorary' | 'inactive';
  joined_date: string;
  notes: string;
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  full_name?: string;
  fullName?: string;
  is_active?: number;
  last_login?: string;
  created_at?: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface Submission {
  id: number;
  reference_code: string;
  type: SubmissionType;
  name: string;
  email: string;
  phone: string;
  tier: string;
  subject: string;
  message: string;
  status: SubmissionStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicStats {
  activePrograms: number;
  activeMembers: number;
  inquiriesReceived: number;
  activeInitiatives: number;
  establishedYear: number;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'nhf_admin_token';
const USER_KEY = 'nhf_admin_user';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('The server could not be reached. Ensure the backend is active at port 4000.');
  }

  const data = await response.json().catch(() => ({})) as { error?: string; message?: string; fields?: Record<string, string> } & T;
  if (!response.ok) {
    const fieldMessage = data.fields ? Object.values(data.fields)[0] : undefined;
    throw new Error(fieldMessage || data.error || 'The request failed. Please try again.');
  }
  return data;
}

export const api = {
  // Public
  getHealth: () => request<{ status: string; uptimeSeconds: number; database: string }>('/health'),
  getPrograms: () => request<{ programs: Program[] }>('/programs'),
  getAnnouncements: () => request<{ announcements: Announcement[] }>('/announcements'),
  getStats: () => request<PublicStats>('/stats'),
  submit: (input: SubmissionInput) => request<{ message: string; reference: string; id: number }>('/submissions', {
    method: 'POST',
    body: JSON.stringify(input),
  }),
  aiAssistant: (query: string) => request<{ reply: string; suggestions: string[] }>('/ai/assistant', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),

  // Admin Auth
  login: (username: string, password: string) => request<{
    token: string;
    expiresIn: number;
    user: AdminUser;
  }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  getMe: (token: string) => request<{ user: AdminUser }>('/admin/me', {}, token),

  // Admin Stats & Submissions
  getAdminStats: (token: string) => request<{
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    archived: number;
    byType: { type: string; count: number }[];
    byTier: { tier: string; count: number }[];
    members: { activeCount: number; votingPower: number };
    recentAudit: AuditLog[];
  }>('/admin/stats', {}, token),

  getSubmissions: (token: string, options: { status?: string; type?: string; tier?: string; search?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (options.status) params.set('status', options.status);
    if (options.type) params.set('type', options.type);
    if (options.tier) params.set('tier', options.tier);
    if (options.search) params.set('search', options.search);
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    const suffix = params.size ? `?${params.toString()}` : '';
    return request<{ submissions: Submission[]; pagination: Pagination }>(`/admin/submissions${suffix}`, {}, token);
  },

  updateSubmissionStatus: (token: string, id: number, status: SubmissionStatus, adminNotes?: string) => request<{ message: string }>(`/admin/submissions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  }, token),

  deleteSubmission: (token: string, id: number) => request<{ message: string }>(`/admin/submissions/${id}`, {
    method: 'DELETE',
  }, token),

  bulkSubmissions: (token: string, action: 'status' | 'delete', ids: number[], status?: SubmissionStatus) => request<{ message: string }>('/admin/submissions/bulk', {
    method: 'POST',
    body: JSON.stringify({ action, ids, status }),
  }, token),

  // Programs CRUD
  getAdminPrograms: (token: string) => request<{ programs: Program[] }>('/admin/programs', {}, token),
  createProgram: (token: string, program: Partial<Program>) => request<{ message: string; id: number }>('/admin/programs', {
    method: 'POST',
    body: JSON.stringify(program),
  }, token),
  updateProgram: (token: string, id: number, program: Partial<Program>) => request<{ message: string }>(`/admin/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(program),
  }, token),
  deleteProgram: (token: string, id: number) => request<{ message: string }>(`/admin/programs/${id}`, {
    method: 'DELETE',
  }, token),

  // Announcements CRUD
  getAdminAnnouncements: (token: string) => request<{ announcements: Announcement[] }>('/admin/announcements', {}, token),
  createAnnouncement: (token: string, announcement: Partial<Announcement>) => request<{ message: string; id: number }>('/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(announcement),
  }, token),
  updateAnnouncement: (token: string, id: number, announcement: Partial<Announcement>) => request<{ message: string }>(`/admin/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(announcement),
  }, token),
  deleteAnnouncement: (token: string, id: number) => request<{ message: string }>(`/admin/announcements/${id}`, {
    method: 'DELETE',
  }, token),

  // Members CRUD
  getAdminMembers: (token: string, search = '', tier = '', status = '') => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tier) params.set('tier', tier);
    if (status) params.set('status', status);
    const suffix = params.size ? `?${params.toString()}` : '';
    return request<{ members: Member[] }>(`/admin/members${suffix}`, {}, token);
  },
  createMember: (token: string, member: Partial<Member>) => request<{ message: string; id: number }>('/admin/members', {
    method: 'POST',
    body: JSON.stringify(member),
  }, token),
  updateMember: (token: string, id: number, member: Partial<Member>) => request<{ message: string }>(`/admin/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(member),
  }, token),
  deleteMember: (token: string, id: number) => request<{ message: string }>(`/admin/members/${id}`, {
    method: 'DELETE',
  }, token),

  // Users & RBAC
  getAdminUsers: (token: string) => request<{ users: AdminUser[] }>('/admin/users', {}, token),
  createUser: (token: string, user: { username: string; email: string; password: string; role: string; full_name?: string }) => request<{ message: string; id: number }>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }, token),
  updateUser: (token: string, id: number, updates: { role?: string; is_active?: boolean; password?: string; full_name?: string }) => request<{ message: string }>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }, token),
  deleteUser: (token: string, id: number) => request<{ message: string }>(`/admin/users/${id}`, {
    method: 'DELETE',
  }, token),

  // Audit Logs
  getAuditLogs: (token: string, page = 1) => request<{ logs: AuditLog[]; total: number; page: number; totalPages: number }>(`/admin/audit-logs?page=${page}`, {}, token),

  // Exports
  downloadCsvUrl: (token: string) => `${API_BASE}/admin/export/submissions.csv?token=${encodeURIComponent(token)}`,
  downloadBackupUrl: (token: string) => `${API_BASE}/admin/backup?token=${encodeURIComponent(token)}`,
};

export const adminStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getUser: (): AdminUser | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  setUser: (user: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
