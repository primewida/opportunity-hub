/* ── OpportunityHub API Service Layer ── */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/* ── Token Management ── */
export function getToken() {
  return localStorage.getItem('oh_token');
}

export function setToken(token) {
  localStorage.setItem('oh_token', token);
}

export function clearToken() {
  localStorage.removeItem('oh_token');
}

/* ── Core Fetch Wrapper ── */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/auth';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }

  if (res.status === 204) return null;
  return res.json();
}

function get(endpoint) { return request(endpoint); }
function post(endpoint, body) { return request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
function put(endpoint, body) { return request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
function del(endpoint) { return request(endpoint, { method: 'DELETE' }); }

/* ── Auth ── */
export const auth = {
  login: (email, password) => post('/auth/login', { email, password }),
  register: (data) => post('/auth/register', data),
  googleLogin: (payload) => post('/auth/google', payload),
  appleLogin: (payload) => post('/auth/apple', payload),
};

/* ── Users ── */
export const users = {
  getProfile: () => get('/users/me'),
  updateProfile: (data) => put('/users/me', data),
};

/* ── Opportunities ── */
export const opportunities = {
  getAll: (params = {}) => {
    const q = new URLSearchParams({ limit: 200, ...params }).toString();
    return get(`/opportunities?${q}`);
  },
  getFeed: () => get('/opportunities/feed'),
  getById: (id) => get(`/opportunities/${id}`),
  save: (id) => post(`/opportunities/${id}/save`),
  unsave: (id) => del(`/opportunities/${id}/unsave`),
  getSaved: () => get('/opportunities/saved'),
  syncScraped: () => post('/opportunities/scrape', {}),
};

/* ── Jobs ── */
export const jobs = {
  getAll: (params = {}) => {
    const q = new URLSearchParams({ limit: 200, ...params }).toString();
    return get(`/jobs?${q}`);
  },
  getById: (id) => get(`/jobs/${id}`),
  save: (id) => post(`/jobs/${id}/save`),
};

/* ── Roadmaps ── */
export const roadmaps = {
  getAll: () => get('/roadmaps'),
  getById: (id) => get(`/roadmaps/${id}`),
  start: (id) => post(`/roadmaps/${id}/start`),
  completeStep: (id, stepId) => post(`/roadmaps/${id}/steps/${stepId}/complete`),
  getProgress: () => get('/roadmaps/progress'),
};

/* ── Courses ── */
export const courses = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/courses${q ? '?' + q : ''}`);
  },
  getById: (id) => get(`/courses/${id}`),
  getRecommendations: () => get('/courses/recommendations'),
};

/* ── Skills ── */
export const skills = {
  getAll: () => get('/skills'),
  getGap: (oppId) => get(`/skills/gap/${oppId}`),
};

/* ── CV ── */
export const cv = {
  getTemplates: () => get('/cv/templates'),
  generate: (data) => post('/cv/generate', data),
};

/* ── Cover Letter ── */
export const coverLetter = {
  generate: (data) => post('/cover-letter/generate', data),
};

/* ── Interview ── */
export const interview = {
  getCategories: () => get('/interview/categories'),
  getQuestions: (categoryId) => get(`/interview/questions${categoryId ? '?categoryId=' + categoryId : ''}`),
};

/* ── Tests ── */
export const tests = {
  getTypes: () => get('/tests/types'),
  getQuestions: (testTypeId, subject) => {
    const params = new URLSearchParams({ testTypeId });
    if (subject) params.append('subject', subject);
    return get(`/tests/questions?${params}`);
  },
  submit: (data) => post('/tests/submit', data),
};

/* ── Community ── */
export const community = {
  getFeed: (page = 1) => get(`/community/feed?page=${page}`),
  getTrending: (page = 1) => get(`/community/trending?page=${page}`),
  getGroups: () => get('/community/groups'),
  getMyGroups: () => get('/community/groups/mine'),
  joinGroup: (id) => post(`/community/groups/${id}/join`),
  leaveGroup: (id) => del(`/community/groups/${id}/leave`),
  getGroupPosts: (id, page = 1) => get(`/community/groups/${id}/posts?page=${page}`),
  createPost: (groupId, content) => post(`/community/groups/${groupId}/posts`, { content }),
  vote: (postId, voteType) => post(`/community/posts/${postId}/vote`, { voteType }),
  addComment: (postId, content) => post(`/community/posts/${postId}/comments`, { content }),
};

/* ── Mentors ── */
export const mentors = {
  getAll: (topics) => get(`/mentors${topics ? '?topics=' + topics : ''}`),
  getById: (id) => get(`/mentors/${id}`),
};

/* ── Messages ── */
export const messages = {
  getConversations: () => get('/messages/conversations'),
  getMessages: (conversationId) => get(`/messages/conversations/${conversationId}`),
  send: (userId, content) => post(`/messages/send/${userId}`, { content }),
};

/* ── Streak ── */
export const streak = {
  get: () => get('/streak'),
  updateGoals: (data) => put('/streak/goals', data),
  logActivity: (hoursSpent) => post('/streak/log-activity', { hoursSpent }),
};

/* ── Leaderboard ── */
export const leaderboard = {
  get: () => get('/leaderboard'),
};

/* ── Documents ── */
export const documents = {
  getAll: (category) => get(`/documents${category ? '?documentCategory=' + category : ''}`),
  upload: (data) => post('/documents', data),
  getById: (id) => get(`/documents/${id}`),
  update: (id, data) => put(`/documents/${id}`, data),
  delete: (id) => del(`/documents/${id}`),
  getStorage: () => get('/documents/storage'),
};

/* ── Applications ── */
export const applications = {
  getAll: () => get('/applications'),
  create: (data) => post('/applications', data),
  update: (id, data) => put(`/applications/${id}`, data),
  delete: (id) => del(`/applications/${id}`),
};

/* ── Notifications ── */
export const notifications = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/notifications${q ? '?' + q : ''}`);
  },
  getUnreadCount: () => get('/notifications/unread-count'),
  markRead: (id) => put(`/notifications/${id}/read`),
  markAllRead: () => put('/notifications/mark-all-read'),
};

/* ── Search ── */
export const search = {
  global: (q) => get(`/search?q=${encodeURIComponent(q)}`),
};

/* ── FAQ ── */
export const faq = {
  getAll: (category) => get(`/faq${category ? '?category=' + category : ''}`),
};

/* ── Onboarding ── */
export const onboarding = {
  getStatus: () => get('/users/me'),
  complete: () => post('/users/me/complete-onboarding'),
  updateProfile: (data) => put('/users/me', data),
  setInterests: (interests) => post('/users/me/interests', { interests }),
  setSkills: (skills) => post('/users/me/skills', { skills }),
};

/* ── Dashboard ── */
export const dashboard = {
  get: () => get('/dashboard'),
};

/* ── Categories ── */
export const categories = {
  getAll: () => get('/categories'),
  getById: (id) => get(`/categories/${id}`),
};
