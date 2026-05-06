export interface CreateStudentRequest {
  fullName: string;
  admissionNumber: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  dateOfBirth: string;
  classId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}

export interface CreateTeacherRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface CreateClassRequest {
  name: string;
  arm: string;
  academicSessionId: string;
}

export interface CreateSubjectRequest {
  name: string;
}

export interface CreateSessionRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export const submitStudentEnrollment = async (data: CreateStudentRequest): Promise<{ success: boolean; data: Record<string, unknown> }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          ...data,
          id: `LEA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        }
      });
    }, 1000);
  });
};

export const mockTeachers = [
  {
    id: "T-2024-001",
    name: "Dr. Elena Rodriguez",
    role: "Senior Fellow",
    avatar: "https://i.pravatar.cc/150?u=elena",
    subjects: ["MATHEMATICS", "PHYSICS"],
    email: "e.rodriguez@leoned.edu",
    phone: "+27 82 455 1209",
    status: "ACTIVE"
  },
  {
    id: "T-2024-042",
    name: "Prof. Kwame Mensah",
    role: "Dept. Head",
    avatar: "https://i.pravatar.cc/150?u=kwame",
    subjects: ["SOCIAL SCIENCES", "ETHICS"],
    email: "k.mensah@leoned.edu",
    phone: "+27 82 110 8892",
    status: "ON LEAVE"
  },
  {
    id: "T-2024-118",
    name: "Sarah Jenkins",
    role: "Associate",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    subjects: ["LINGUISTICS", "LITERATURE"],
    email: "s.jenkins@leoned.edu",
    phone: "+27 82 334 0091",
    status: "ACTIVE"
  },
  {
    id: "T-2024-005",
    name: "Marcus Thorne",
    role: "Instructor",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    subjects: ["ARCHITECTURE", "CAD"],
    email: "m.thorne@leoned.edu",
    phone: "+27 82 778 3342",
    status: "ACTIVE"
  }
];

export const mockAdmissions = [
  {
    id: "A-2024-001",
    applicantInitials: "EM",
    applicantName: "Elena Mwangi",
    applicantEmail: "elena.mwangi@email.com",
    classApplied: "Grade 10 - STEM",
    appliedDate: "Oct 24, 2024",
    status: "PENDING REVIEW"
  },
  {
    id: "A-2024-002",
    applicantInitials: "KO",
    applicantName: "Kofi Osei",
    applicantEmail: "k.osei@email.com",
    classApplied: "Grade 9 - Advanced",
    appliedDate: "Oct 22, 2024",
    status: "DOCUMENT VERIFICATION"
  },
  {
    id: "A-2024-003",
    applicantInitials: "AB",
    applicantName: "Amina Bello",
    applicantEmail: "amina.bello@email.com",
    classApplied: "Grade 11 - Humanities",
    appliedDate: "Oct 21, 2024",
    status: "INTERVIEW SCHEDULED"
  }
];
