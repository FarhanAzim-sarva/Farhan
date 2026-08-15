import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS=['/login','/api/unlock'];

export function middleware(req:NextRequest){
  const { pathname }=req.nextUrl;
  if(PUBLIC_PATHS.some(p=>pathname.startsWith(p)) || pathname.startsWith('/_next') || pathname==='/favicon.ico') return NextResponse.next();
  const expected=process.env.DATA_ROOM_SESSION_TOKEN;
  const actual=req.cookies.get('sarva_dataroom_session')?.value;
  if(!expected || actual!==expected){
    const url=req.nextUrl.clone();url.pathname='/login';return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config={matcher:['/((?!_next/static|_next/image).*)']};
