// app/api/auth/check-cookie/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  return NextResponse.json({
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 30) + '...' : null,
    allCookies: cookieStore.getAll().map(c => c.name),
    secure: process.env.NODE_ENV === 'production'
  });
}