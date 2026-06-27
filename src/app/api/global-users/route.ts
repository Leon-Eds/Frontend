import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = 'https://leoned.vercel.app/api';

const extractArray = (obj: any): any[] => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  if (typeof obj === 'object') {
    for (const key of ['data', 'value', '$values', 'items', 'schools', 'teachers', 'students']) {
      const val = obj[key];
      if (Array.isArray(val)) return val;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        for (const innerKey of ['data', 'value', '$values', 'items', 'schools', 'teachers', 'students']) {
          if (Array.isArray(val[innerKey])) return val[innerKey];
        }
      }
    }
  }
  return [];
};

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    
    // Fetch all schools
    const schoolsRes = await fetch(`${API_BASE_URL}/school`, {
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      cache: 'no-store'
    });
    
    if (!schoolsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch schools' }, { status: schoolsRes.status });
    }
    
    const schoolsData = await schoolsRes.json();
    const schools = extractArray(schoolsData);

    // Fetch detail for each school to get accurate counts and any embedded data
    const enrichedSchools = await Promise.all(
      schools.map(async (school: any) => {
        const schoolId = school.id || school._id;
        if (!schoolId) return school;
        
        try {
          const detailRes = await fetch(`${API_BASE_URL}/school/${schoolId}`, {
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
            cache: 'no-store'
          });
          
          if (detailRes.ok) {
            const detail = await detailRes.json();
            const d = detail?.data || detail;
            return { ...school, ...d };
          }
        } catch {}
        
        return school;
      })
    );

    // Build aggregated teacher/student lists from any embedded data
    let allTeachers: any[] = [];
    let allStudents: any[] = [];
    let totalTeacherCount = 0;
    let totalStudentCount = 0;

    enrichedSchools.forEach((school: any) => {
      const schoolId = school.id || school._id;
      const schoolName = school.name || school.schoolName || 'Unknown';

      totalTeacherCount += Number(school.currentTeacherCount || 0);
      totalStudentCount += Number(school.currentStudentCount || 0);

      // If the school object happens to have embedded arrays, use them
      if (Array.isArray(school.teachers)) {
        school.teachers.forEach((t: any) => {
          allTeachers.push({ ...t, id: t.id || t._id, _schoolId: schoolId, _schoolName: schoolName });
        });
      }
      if (Array.isArray(school.students)) {
        school.students.forEach((s: any) => {
          allStudents.push({ ...s, id: s.id || s._id, _schoolId: schoolId, _schoolName: schoolName });
        });
      }
    });

    // Deduplicate
    const dedup = (arr: any[]) => {
      const seen = new Set();
      return arr.filter(item => {
        const id = item.id || item._id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    };

    return NextResponse.json({
      schools: enrichedSchools,
      teachers: dedup(allTeachers),
      students: dedup(allStudents),
      totalTeacherCount,
      totalStudentCount,
    });
  } catch (error: any) {
    console.error('[global-users API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
