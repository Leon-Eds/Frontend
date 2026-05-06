const API_BASE_URL = 'https://backend-4h8h.onrender.com/api';

// ─── Helpers ───────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('leoned_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  // Defensive check: don't send "Bearer undefined" or "Bearer null"
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** Convert a date-only string (YYYY-MM-DD) to ISO date-time for the .NET backend */
function toDateTime(dateStr: string): string {
  if (!dateStr) return dateStr;
  let result = dateStr;
  if (!result.includes('T')) {
    result = `${result}T00:00:00`;
  }
  if (!result.endsWith('Z')) {
    result = `${result}Z`;
  }
  return result;
}

/** Fetch with timeout + automatic retry for cold-starting backends */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 60000): Promise<Response> {
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
    const errorBody = await res.text().catch(() => '');
    let message = `API Error ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      // Extract the most useful error message from the response
      if (typeof parsed.message === 'string' && parsed.message) {
        message = parsed.message;
      } else if (typeof parsed.title === 'string' && parsed.title) {
        message = parsed.title;
      } else if (parsed.errors) {
        // .NET validation errors come as { errors: { Field: ["msg"] } }
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
  return JSON.parse(text) as T;
}

// ─── Types ─────────────────────────────────────────────────────────────

export type Gender = 'Male' | 'Female' | 'Other';
export type StudentStatus = 'Active' | 'Graduated' | 'Archived' | 'Suspended';
export type SubscriptionPlan = 'Free' | 'Plus' | 'Premium';
export type TermNumber = 'First' | 'Second' | 'Third';

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
  createdAt?: string;
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

// Paginated response wrapper
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

// Auth
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(res);
  },

  register: async (data: RegisterSchoolRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

// Dashboard
export const dashboardApi = {
  getSchoolDashboard: async (): Promise<DashboardStats> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Dashboard/school`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  getSuperAdminDashboard: async (): Promise<DashboardStats> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Dashboard/superadmin`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },
};

// Students
export const studentApi = {
  getAll: async (page = 1, pageSize = 20, search = '') => {
    const params = new URLSearchParams({
      PageNumber: String(page),
      PageSize: String(pageSize),
    });
    if (search) params.set('Search', search);
    const res = await fetchWithTimeout(`${API_BASE_URL}/Student?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<Student>>(res);
  },

  getById: async (id: string): Promise<Student> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Student/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Student>(res);
  },

  create: async (data: CreateStudentRequest) => {
    const payload = { ...data };
    if (payload.dateOfBirth) {
      payload.dateOfBirth = toDateTime(payload.dateOfBirth);
    }
    const res = await fetchWithTimeout(`${API_BASE_URL}/Student`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateStudentRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Student/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Student/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  search: async (q: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Student/search?q=${encodeURIComponent(q)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Student[]>(res);
  },
};

// Teachers
export const teacherApi = {
  getAll: async (page = 1, pageSize = 20, search = '') => {
    const params = new URLSearchParams({
      PageNumber: String(page),
      PageSize: String(pageSize),
    });
    if (search) params.set('Search', search);
    const res = await fetchWithTimeout(`${API_BASE_URL}/Teacher?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<Teacher>>(res);
  },

  getById: async (id: string): Promise<Teacher> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Teacher/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Teacher>(res);
  },

  create: async (data: CreateTeacherRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Teacher`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateTeacherRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Teacher/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Teacher/${id}/status?isActive=${isActive}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  assign: async (id: string, data: AssignTeacherRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Teacher/${id}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  removeAssignment: async (assignmentId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Teacher/assignment/${assignmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Classes
export const classApi = {
  getAll: async () => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Class`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<SchoolClass[] | PaginatedResponse<SchoolClass>>(res);
    if (Array.isArray(data)) return data;
    return data.items || data.data || [];
  },

  getById: async (id: string): Promise<SchoolClass> => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Class/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SchoolClass>(res);
  },

  create: async (data: CreateClassRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Class`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateClassRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Class/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Class/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  assignSubjects: async (id: string, data: AssignSubjectsToClassRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Class/${id}/subjects`, {
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
    const res = await fetchWithTimeout(`${API_BASE_URL}/Subject`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<Subject[] | PaginatedResponse<Subject>>(res);
    if (Array.isArray(data)) return data;
    return data.items || data.data || [];
  },

  create: async (data: CreateSubjectRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Subject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateSubjectRequest) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Subject/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/Subject/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Academic Sessions
export const sessionApi = {
  getAll: async () => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/AcademicSession`, {
      headers: getAuthHeaders(),
    });
    const result = await handleResponse<Record<string, unknown>>(res);
    return (result?.data || result?.items || result) as AcademicSession[];
  },

  create: async (data: CreateSessionRequest) => {
    const payload = {
      ...data,
      startDate: toDateTime(data.startDate),
      endDate: toDateTime(data.endDate),
    };
    const res = await fetchWithTimeout(`${API_BASE_URL}/AcademicSession`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  setCurrent: async (id: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/AcademicSession/${id}/current`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  addTerm: async (sessionId: string, data: CreateTermRequest) => {
    const payload = {
      ...data,
      startDate: toDateTime(data.startDate),
      endDate: toDateTime(data.endDate),
    };
    const res = await fetchWithTimeout(`${API_BASE_URL}/AcademicSession/${sessionId}/terms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  setCurrentTerm: async (termId: string) => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/AcademicSession/terms/${termId}/current`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Schools (for superadmin)
export const schoolApi = {
  getAll: async (page = 1, pageSize = 20, search = '') => {
    const params = new URLSearchParams({
      PageNumber: String(page),
      PageSize: String(pageSize),
    });
    if (search) params.set('Search', search);
    const res = await fetchWithTimeout(`${API_BASE_URL}/School?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<unknown>>(res);
  },

  getPlans: async () => {
    const res = await fetchWithTimeout(`${API_BASE_URL}/School/plans`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
