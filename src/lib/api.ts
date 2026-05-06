const API_BASE_URL = 'https://backend-4h8h.onrender.com/api';

// ─── Helpers ───────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('leoned_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    let message = `API Error ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.title || parsed.errors
        ? JSON.stringify(parsed.errors || parsed)
        : errorBody || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    throw new Error(message);
  }
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ─── Types ─────────────────────────────────────────────────────────────

export type Gender = 'Male' | 'Female';
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
    const res = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(res);
  },

  register: async (data: RegisterSchoolRequest) => {
    const res = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    const res = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const res = await fetch(`${API_BASE_URL}/Auth/change-password`, {
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
    const res = await fetch(`${API_BASE_URL}/Dashboard/school`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  getSuperAdminDashboard: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE_URL}/Dashboard/superadmin`, {
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
    const res = await fetch(`${API_BASE_URL}/Student?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<Student>>(res);
  },

  getById: async (id: string): Promise<Student> => {
    const res = await fetch(`${API_BASE_URL}/Student/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Student>(res);
  },

  create: async (data: CreateStudentRequest) => {
    const res = await fetch(`${API_BASE_URL}/Student`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateStudentRequest) => {
    const res = await fetch(`${API_BASE_URL}/Student/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/Student/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  search: async (q: string) => {
    const res = await fetch(`${API_BASE_URL}/Student/search?q=${encodeURIComponent(q)}`, {
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
    const res = await fetch(`${API_BASE_URL}/Teacher?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<Teacher>>(res);
  },

  getById: async (id: string): Promise<Teacher> => {
    const res = await fetch(`${API_BASE_URL}/Teacher/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Teacher>(res);
  },

  create: async (data: CreateTeacherRequest) => {
    const res = await fetch(`${API_BASE_URL}/Teacher`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateTeacherRequest) => {
    const res = await fetch(`${API_BASE_URL}/Teacher/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const res = await fetch(`${API_BASE_URL}/Teacher/${id}/status?isActive=${isActive}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  assign: async (id: string, data: AssignTeacherRequest) => {
    const res = await fetch(`${API_BASE_URL}/Teacher/${id}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  removeAssignment: async (assignmentId: string) => {
    const res = await fetch(`${API_BASE_URL}/Teacher/assignment/${assignmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Classes
export const classApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/Class`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SchoolClass[]>(res);
  },

  getById: async (id: string): Promise<SchoolClass> => {
    const res = await fetch(`${API_BASE_URL}/Class/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SchoolClass>(res);
  },

  create: async (data: CreateClassRequest) => {
    const res = await fetch(`${API_BASE_URL}/Class`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateClassRequest) => {
    const res = await fetch(`${API_BASE_URL}/Class/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/Class/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  assignSubjects: async (id: string, data: AssignSubjectsToClassRequest) => {
    const res = await fetch(`${API_BASE_URL}/Class/${id}/subjects`, {
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
    const res = await fetch(`${API_BASE_URL}/Subject`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Subject[]>(res);
  },

  create: async (data: CreateSubjectRequest) => {
    const res = await fetch(`${API_BASE_URL}/Subject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id: string, data: UpdateSubjectRequest) => {
    const res = await fetch(`${API_BASE_URL}/Subject/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/Subject/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Academic Sessions
export const sessionApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/AcademicSession`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AcademicSession[]>(res);
  },

  create: async (data: CreateSessionRequest) => {
    const res = await fetch(`${API_BASE_URL}/AcademicSession`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  setCurrent: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/AcademicSession/${id}/current`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  addTerm: async (sessionId: string, data: CreateTermRequest) => {
    const res = await fetch(`${API_BASE_URL}/AcademicSession/${sessionId}/terms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  setCurrentTerm: async (termId: string) => {
    const res = await fetch(`${API_BASE_URL}/AcademicSession/terms/${termId}/current`, {
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
    const res = await fetch(`${API_BASE_URL}/School?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedResponse<unknown>>(res);
  },

  getPlans: async () => {
    const res = await fetch(`${API_BASE_URL}/School/plans`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
