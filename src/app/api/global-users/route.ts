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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store'
    });
    
    if (!schoolsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch schools' }, { status: schoolsRes.status });
    }
    
    const schoolsData = await schoolsRes.json();
    const schools = extractArray(schoolsData);

    // Fetch all teachers
    let teachers = [];
    try {
      const teachersRes = await fetch(`${API_BASE_URL}/teacher`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        cache: 'no-store'
      });
      const tText = await teachersRes.text();
      console.log(`[TEACHERS RESP] ${teachersRes.status}:`, tText.substring(0, 200));
      if (teachersRes.ok) {
        teachers = extractArray(JSON.parse(tText));
      }
    } catch (e) {
      console.warn("Failed to fetch teachers globally", e);
    }

    // Fetch all students
    let students = [];
    try {
      const studentsRes = await fetch(`${API_BASE_URL}/student`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        cache: 'no-store'
      });
      const sText = await studentsRes.text();
      console.log(`[STUDENTS RESP] ${studentsRes.status}:`, sText.substring(0, 200));
      if (studentsRes.ok) {
        students = extractArray(JSON.parse(sText));
      }
    } catch (e) {
      console.warn("Failed to fetch students globally", e);
    }

    return NextResponse.json({
      schools,
      teachers,
      students,
    });
  } catch (error: any) {
    console.error('[global-users API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
