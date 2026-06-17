import { NextResponse } from 'next/server';

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
    });
    
    if (!schoolsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch schools' }, { status: schoolsRes.status });
    }
    
    const schoolsData = await schoolsRes.json();
    const schools = extractArray(schoolsData);

    // Note: Fetching teachers and students using SuperAdmin JWT directly fails because
    // the backend endpoints (/teacher and /student) strictly require the JWT token claims
    // to include a "SchoolId" property. Since SuperAdmin tokens do not belong to a specific
    // school, they lack this claim, resulting in a 400 Bad Request: "School context (SchoolId) is required."
    // 
    // This is a backend limitation that requires a dedicated endpoint for SuperAdmins 
    // to fetch all global users, or a modification to the existing endpoints.
    //
    // For now, we will return the schools as admins, and empty lists for teachers and students.

    return NextResponse.json({
      schools,
      teachers: [],
      students: [],
    });
  } catch (error: any) {
    console.error('[global-users API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
