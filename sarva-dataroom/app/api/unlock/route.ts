import { NextRequest, NextResponse } from 'next/server';

function approvedEmails(){
  return (process.env.DATA_ROOM_ALLOWED_EMAILS||'')
    .split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
}

export async function POST(req:NextRequest){
  const {email,code}=await req.json().catch(()=>({}));
  const normalized=String(email||'').trim().toLowerCase();
  const allowed=approvedEmails();
  const validEmail=allowed.includes(normalized);
  const validCode=String(code||'')===process.env.DATA_ROOM_ACCESS_CODE;
  const sessionToken=process.env.DATA_ROOM_SESSION_TOKEN;
  if(!validEmail || !validCode || !sessionToken){
    return NextResponse.json({ok:false},{status:401});
  }
  const res=NextResponse.json({ok:true});
  res.cookies.set('sarva_dataroom_session',sessionToken,{
    httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:60*60*8
  });
  res.cookies.set('sarva_dataroom_email',normalized,{
    httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:60*60*8
  });
  return res;
}
