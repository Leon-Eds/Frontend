export const mockStats = {
  totalStudents: { value: "1,240", change: "+4%" },
  totalTeachers: { value: "45" },
  resultsPending: { value: "12" },
  activeTerm: {
    term: "2nd Term 2024/25",
    progress: 85,
  },
};

export const mockRecentActivities = [
  {
    id: 1,
    date: "Oct 24, 2024",
    user: { name: "Adeola Johnson", avatar: "AJ", bgColor: "bg-green-100", textColor: "text-green-700" },
    category: "New Registration",
    status: "VERIFIED",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: 2,
    date: "Oct 23, 2024",
    user: { name: "Grade 10 Maths Results", avatar: "📄", bgColor: "bg-orange-100", textColor: "text-orange-700" },
    category: "Results Uploaded",
    status: "PENDING REVIEW",
    statusColor: "bg-orange-100 text-orange-700",
  },
  {
    id: 3,
    date: "Oct 23, 2024",
    user: { name: "Musa Ibrahim", avatar: "MI", bgColor: "bg-green-100", textColor: "text-green-700" },
    category: "New Registration",
    status: "VERIFIED",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: 4,
    date: "Oct 22, 2024",
    user: { name: "Attendance - SS3 A", avatar: "📊", bgColor: "bg-gray-200", textColor: "text-gray-700" },
    category: "Log Update",
    status: "UPDATED",
    statusColor: "bg-gray-200 text-gray-700",
  },
];

export const mockUpcomingEvents = [
  {
    id: 1,
    date: "28",
    month: "OCT",
    title: "Inter-House Sports",
    details: "Main Campus Field • 09:00 AM",
  },
  {
    id: 2,
    date: "02",
    month: "NOV",
    title: "PTA General Meeting",
    details: "Conference Hall • 11:00 AM",
  },
];
