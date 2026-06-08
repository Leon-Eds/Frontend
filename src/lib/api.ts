const API_BASE_URL = 'https://leoned.vercel.app/api';

// ─── Helpers ───────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('leoned_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  // Defensive check: don't send "Bearer undefined" or "Bearer null"
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Attach School-Id header from stored user data for school-scoped endpoints
  try {
    const user = JSON.parse(localStorage.getItem('leoned_user') || '{}');
    if (user.schoolId) {
      headers['School-Id'] = user.schoolId;
    }
  } catch {
    // Silently ignore parse errors
  }

  return headers;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}

export function recordActivity(description: string, category: string, status: string = 'VERIFIED') {
  if (typeof window === 'undefined') return;
  try {
    const userStr = localStorage.getItem('leoned_user');
    const user = userStr ? JSON.parse(userStr) : {};
    const newActivity = {
      id: Date.now() + Math.random(),
      date: new Date().toISOString(),
      description,
      category,
      status,
      userName: user.name || 'Admin',
    };
    const localActivities = JSON.parse(localStorage.getItem('leoned_local_activities') || '[]');
    localActivities.unshift(newActivity);
    localStorage.setItem('leoned_local_activities', JSON.stringify(localActivities.slice(0, 20)));
  } catch (e) {
    console.error("Failed to record activity", e);
  }
}


let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function checkAndRefreshAuthToken() {
  if (typeof window === 'undefined') return;
  const expiry = localStorage.getItem('leoned_token_expiry');
  const refreshToken = localStorage.getItem('leoned_refresh_token');
  if (!expiry || !refreshToken) return;
  
  const expiryTime = new Date(expiry).getTime();
  const now = Date.now();
  
  // If expiring in less than 5 minutes
  if (expiryTime - now < 5 * 60 * 1000) {
    if (isRefreshing && refreshPromise) {
      await refreshPromise;
      return;
    }
    
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (res.ok) {
          const data = await res.json();
          const r = data.data || data;
          if (r.token) localStorage.setItem('leoned_token', r.token);
          if (r.refreshToken) localStorage.setItem('leoned_refresh_token', r.refreshToken);
          if (r.tokenExpiry) localStorage.setItem('leoned_token_expiry', r.tokenExpiry);
        }
      } catch (err) {
        console.error("[API] Auto-refresh failed", err);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
    await refreshPromise;
  }
}

/** Fetch with timeout + automatic retry for cold-starting backends */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 60000): Promise<Response> {
  if (!url.includes('/auth/login') && !url.includes('/auth/refresh-token')) {
    await checkAndRefreshAuthToken();
    
    // Update the Authorization header if the token was refreshed
    if (options.headers && (options.headers as Record<string, string>)['Authorization']) {
      const newToken = localStorage.getItem('leoned_token');
      if (newToken) {
        (options.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      }
    }
  }

  const maxRetries = 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err;

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Request timed out. The server may be starting up — please try again in a moment.');
      }

      // On network error ("Failed to fetch"), retry once after a short delay
      if (attempt < maxRetries) {
        console.warn(`[API] Network error on attempt ${attempt + 1}, retrying in 2s...`, url);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
    }
  }

  // If we exhausted retries, throw a helpful message
  const errMsg = lastError instanceof Error ? lastError.message : String(lastError);
  if (errMsg === 'Failed to fetch' || errMsg.includes('fetch')) {
    throw new Error('Could not reach the server. It may be starting up — please wait a moment and try again.');
  }
  throw lastError;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Automatically handle auth errors (unauthorized or session expired)
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') {
        console.warn(`[API] Auth error ${res.status} on ${res.url}. Redirecting to login...`);
        localStorage.removeItem('leoned_token');
        localStorage.removeItem('leoned_refresh_token');
        localStorage.removeItem('leoned_user');
        window.location.href = '/login';
      }
    }

    const errorBody = await res.text().catch(() => '');
    let message = `API Error ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      // Extract the most useful error message from the response
      if (typeof parsed.message === 'string' && parsed.message) {
        message = parsed.message;
      } else if (typeof parsed.error === 'string' && parsed.error) {
        message = parsed.error;
      } else if (typeof parsed.title === 'string' && parsed.title) {
        message = parsed.title;
      } else if (parsed.errors) {
        const errMessages = Object.values(parsed.errors).flat();
        message = errMessages.join('. ') || JSON.stringify(parsed.errors);
      } else if (errorBody) {
        message = errorBody;
      }
    } catch {
      if (errorBody) message = errorBody;
    }
    
    // Log the error for easier debugging in the console
    console.error(`[API Error] ${res.status} ${res.url}:`, message);
    throw new Error(message);
  }
  const text = await res.text();
  if (!text) return {} as T;
  const parsed = JSON.parse(text);

  // Unwrap Node.js backend { success, message, data } envelope
  if (parsed && typeof parsed === 'object' && 'success' in parsed && 'data' in parsed) {
    return parsed.data as T;
  }

  return parsed as T;
}

// ─── Types ─────────────────────────────────────────────────────────────

export type Gender = 'Male' | 'Female' | 'Other';
export type StudentStatus = 'Active' | 'Graduated' | 'Archived' | 'Suspended';
export type SubscriptionPlan = 'Free' | 'Plus' | 'Premium';
export type TermNumber = 'First' | 'Second' | 'Third';
export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    schoolId?: string;
    schoolName?: string;
  };
}

export interface RegisterSchoolRequest {
  schoolName: string;
  adminName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  subscriptionPlan?: SubscriptionPlan;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Student
export interface CreateStudentRequest {
  fullName: string;
  admissionNumber?: string;
  gender: Gender | '';
  dateOfBirth?: string;
  classId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  bloodGroup?: string;
  arm?: string;
}

export interface UpdateStudentRequest {
  fullName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  classId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  status?: StudentStatus;
}

export interface Student {
  id: string;
  fullName: string;
  admissionNumber?: string;
  gender: Gender;
  dateOfBirth?: string;
  classId?: string;
  className?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  status: StudentStatus;
  enrolledAt?: string;
  systemEmail?: string;
}

// Teacher
export interface CreateTeacherRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UpdateTeacherRequest {
  fullName?: string;
  phone?: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  assignments?: TeacherAssignment[];
}

export interface TeacherAssignment {
  id: string;
  subjectId: string;
  subjectName?: string;
  classId: string;
  className?: string;
}

export interface AssignTeacherRequest {
  subjectId: string;
  classId: string;
}

// Class
export interface CreateClassRequest {
  name: string;
  arm?: string;
  academicSessionId?: string;
}

export interface UpdateClassRequest {
  name?: string;
  arm?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  arm?: string;
  studentCount?: number;
  subjects?: { id: string; name: string }[];
}

export interface AssignSubjectsToClassRequest {
  subjectIds: string[];
}

// Subject
export interface CreateSubjectRequest {
  name: string;
}

export interface UpdateSubjectRequest {
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

// Academic Session
export interface CreateSessionRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface CreateTermRequest {
  termNumber: TermNumber;
  startDate: string;
  endDate: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms?: Term[];
}

export interface Term {
  id: string;
  termNumber: TermNumber;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

// Dashboard
export interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  maxStudents?: number;
  maxTeachers?: number;
  totalClasses?: number;
  totalSubjects?: number;
  activeStudents?: number;
  pendingResults?: number;
  currentSession?: string;
  currentTerm?: string;
  termProgress?: number;
  recentActivities?: DashboardActivity[];
  [key: string]: unknown;
}

export interface DashboardActivity {
  id: string | number;
  date: string;
  description: string;
  category: string;
  status: string;
  userName?: string;
}

// Score types
export interface EnterScoreRequest {
  studentId: string;
  subjectId: string;
  classId: string;
  termId: string;
  academicSessionId: string;
  firstCA: number;
  secondCA: number;
  exam: number;
  remark?: string;
}

export interface BulkScoreEntry {
  studentId: string;
  firstCA: number;
  secondCA: number;
  exam: number;
  remark?: string;
}

export interface BulkEnterScoresRequest {
  subjectId: string;
  classId: string;
  termId: string;
  academicSessionId: string;
  scores: BulkScoreEntry[];
}

// Result types
export interface SubmitResultsRequest {
  teacherComment?: string;
}

export interface ApproveResultsRequest {
  approve: boolean;
  adminComment?: string;
}

// Grading types
export interface GradingRule {
  grade: GradeLetter;
  minScore: number;
  maxScore: number;
  remark?: string;
}

export interface SetGradingRulesRequest {
  rules: GradingRule[];
}

// Fee types
export interface RecordFeeRequest {
  studentId: string;
  termId: string;
  academicSessionId: string;
  amountDue: number;
  amountPaid: number;
}

// School types
export interface UpdateSchoolRequest {
  name?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
}

export interface UpdateSchoolPlanRequest {
  subscriptionPlan: SubscriptionPlan;
}

// Paginated response wrapper (kept for backward compat, but new backend returns arrays)
export interface PaginatedResponse<T> {
  items: T[];
  data?: T[];
  totalCount?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
  [key: string]: unknown;
}

// ─── API Functions ─────────────────────────────────────────────────────

export interface CreateSuperAdminRequest {
  name: string;
  email: string;
  password: string;
  secretKey: string;
}

// Auth
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(res);
  },

  register: async (data: RegisterSchoolRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  createSuperAdmin: async (data: CreateSuperAdminRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/create-super-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  forgotPassword: async (data: { email: string }) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// Dashboard
export const dashboardApi = {
  getSchoolDashboard: async (): Promise<DashboardStats> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/dashboard/school`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  getSuperAdminDashboard: async (): Promise<DashboardStats> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/dashboard/superadmin`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  getTeacherDashboard: async (): Promise<DashboardStats> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/dashboard/teacher`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  getStudentDashboard: async (): Promise<DashboardStats> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/dashboard/student`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },
};

// Students
export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/student?pageSize=1000`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Student[] | PaginatedResponse<Student>>(res);
    if (Array.isArray(data)) return data;
    return data.items || data.data || [];
  },

  getById: async (id: string): Promise<Student> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/student/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Student>(res);
  },

  create: async (data: CreateStudentRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/student`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    recordActivity(`Enrolled student: ${data.fullName}`, 'Student Registry', 'VERIFIED');
    return result;
  },

  update: async (id: string, data: UpdateStudentRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/student/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/student/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  search: async (q: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/student/search?q=${encodeURIComponent(q)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Student[]>(res);
  },
};

// Teachers
export const teacherApi = {
  getAll: async (): Promise<Teacher[]> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/teacher?pageSize=1000`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Teacher[] | PaginatedResponse<Teacher>>(res);
    if (Array.isArray(data)) return data;
    return data.items || data.data || [];
  },

  getById: async (id: string): Promise<Teacher> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/teacher/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Teacher>(res);
  },

  create: async (data: CreateTeacherRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/teacher`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    recordActivity(`Registered teacher: ${data.fullName}`, 'Staff Directory', 'VERIFIED');
    return result;
  },

  update: async (id: string, data: UpdateTeacherRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/teacher/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateStatus: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/teacher/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  assign: async (id: string, data: AssignTeacherRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/teacher/${id}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  removeAssignment: async (assignmentId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/teacher/assignment/${assignmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Classes
export const classApi = {
  getAll: async () => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/class`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<SchoolClass[] | PaginatedResponse<SchoolClass>>(res);
    if (Array.isArray(data)) return data;
    return data.items || data.data || [];
  },

  getById: async (id: string): Promise<SchoolClass> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/class/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SchoolClass>(res);
  },

  create: async (data: CreateClassRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/class`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    recordActivity(`Created class: ${data.name} ${data.arm ? '(' + data.arm + ')' : ''}`, 'Academic Flow', 'VERIFIED');
    return result;
  },

  update: async (id: string, data: UpdateClassRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/class/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/class/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  assignSubjects: async (id: string, data: AssignSubjectsToClassRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/class/${id}/subjects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// Subjects
export const subjectApi = {
  getAll: async () => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/subject`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Subject[] | PaginatedResponse<Subject>>(res);
    if (Array.isArray(data)) return data;
    return data.items || data.data || [];
  },

  create: async (data: CreateSubjectRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/subject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    recordActivity(`Created curriculum subject: ${data.name}`, 'Academic Flow', 'VERIFIED');
    return result;
  },

  update: async (id: string, data: UpdateSubjectRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/subject/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/subject/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Academic Sessions
export const sessionApi = {
  getAll: async (): Promise<AcademicSession[]> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/academicsession`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<AcademicSession[] | Record<string, unknown>>(res);
    if (Array.isArray(data)) return data;
    return ((data as Record<string, unknown>)?.data || (data as Record<string, unknown>)?.items || data) as AcademicSession[];
  },

  create: async (data: CreateSessionRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/academicsession`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  setCurrent: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/academicsession/${id}/current`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  addTerm: async (sessionId: string, data: CreateTermRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/academicsession/${sessionId}/terms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  setCurrentTerm: async (termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/academicsession/terms/${termId}/current`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Schools (for superadmin)
export const schoolApi = {
  getAll: async (): Promise<unknown[]> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/school`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<unknown[] | PaginatedResponse<unknown>>(res);
    if (Array.isArray(data)) return data;
    return (data as PaginatedResponse<unknown>).items || (data as PaginatedResponse<unknown>).data || [];
  },

  getPlans: async () => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/school/plans`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getById: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/school/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateSchoolRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/school/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updatePlan: async (id: string, data: UpdateSchoolPlanRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/school/${id}/plan`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  toggleStatus: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/school/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Scores
export const scoreApi = {
  enter: async (data: EnterScoreRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/score/enter`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  bulkEnter: async (data: BulkEnterScoresRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/score/bulk-enter`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    recordActivity(`Recorded academic scores for class`, 'Grading', 'VERIFIED');
    return result;
  },

  getScoresheet: async (classId: string, subjectId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/score/class/${classId}/subject/${subjectId}/term/${termId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getStudentScores: async (studentId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/score/student/${studentId}/term/${termId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Results
export const resultApi = {
  compute: async (classId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/result/compute/${classId}/${termId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  submit: async (classId: string, termId: string, data?: SubmitResultsRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/result/submit/${classId}/${termId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data || {}),
    });
    return handleResponse(res);
  },

  approve: async (classId: string, termId: string, data: ApproveResultsRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/result/approve/${classId}/${termId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    recordActivity(`Approved term results for class`, 'Approvals', 'VERIFIED');
    return result;
  },

  publish: async (classId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/result/publish/${classId}/${termId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const result = await handleResponse(res);
    recordActivity(`Published term results for class`, 'Approvals', 'VERIFIED');
    return result;
  },

  getClassResults: async (classId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/result/class/${classId}/term/${termId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getStudentResults: async (studentId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/result/student/${studentId}/term/${termId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getMyResults: async (termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/result/my/term/${termId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Report Cards
export const reportCardApi = {
  getData: async (studentId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/reportcard/${studentId}/${termId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  downloadPdf: async (studentId: string, termId: string): Promise<Blob> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/reportcard/${studentId}/${termId}/pdf`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to download report card PDF (${res.status})`);
    return res.blob();
  },

  downloadMyPdf: async (termId: string): Promise<Blob> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/reportcard/my/${termId}/pdf`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to download report card PDF (${res.status})`);
    return res.blob();
  },
};

// Grading
export const gradingApi = {
  setRules: async (data: SetGradingRulesRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/grading/rules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getRules: async (): Promise<GradingRule[]> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/grading/rules`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<GradingRule[]>(res);
  },
};

// Fees
export const feeApi = {
  record: async (data: RecordFeeRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/fee/record`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    recordActivity(`Recorded student fee payment of ₦${data.amountPaid.toLocaleString()}`, 'Financials', 'VERIFIED');
    return result;
  },

  clearFees: async (studentId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/fee/clear/${studentId}/${termId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const result = await handleResponse(res);
    recordActivity(`Cleared student term fees`, 'Financials', 'VERIFIED');
    return result;
  },

  getStudentFees: async (studentId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/fee/student/${studentId}/term/${termId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getClassFees: async (classId: string, termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/fee/class/${classId}/term/${termId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Global Users (for superadmin) — NOTE: /api/auth/admins endpoint was removed in Node.js backend
// Falling back to schoolApi.getAll() which returns schools with admin info
export const userApi = {
  getAllAdmins: async () => {
    // The dedicated admins endpoint no longer exists in the new backend.
    // We use the schools list as a proxy — each school has admin info attached.
    const schools = await schoolApi.getAll();
    return schools;
  },
};

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience?: 'All' | 'Students' | 'Teachers' | 'Class';
  targetClassId?: string;
  createdAt?: string;
  updatedAt?: string;
  schoolId?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  audience?: 'All' | 'Students' | 'Teachers' | 'Class';
  targetClassId?: string;
}

// Announcements API
export const announcementApi = {
  getAll: async (params?: { audience?: string; all?: boolean; pageNumber?: number; pageSize?: number }): Promise<Announcement[]> => {
    let url = `${API_BASE_URL}/announcement`;
    if (params) {
      const q = new URLSearchParams();
      if (params.audience) q.append('audience', params.audience);
      if (params.all !== undefined) q.append('all', String(params.all));
      if (params.pageNumber !== undefined) q.append('pageNumber', String(params.pageNumber));
      if (params.pageSize !== undefined) q.append('pageSize', String(params.pageSize));
      url += `?${q.toString()}`;
    }
    const res = await fetchWithTimeout(url, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Announcement[] | PaginatedResponse<Announcement>>(res);
    if (Array.isArray(data)) return data;
    return data.items || data.data || [];
  },

  create: async (data: CreateAnnouncementRequest): Promise<Announcement> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/announcement`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<Announcement>(res);
    recordActivity(`Dispatched bulletin: ${data.title}`, 'Communications', 'VERIFIED');
    return result;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/announcement/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
