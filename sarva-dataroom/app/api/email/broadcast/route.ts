import { NextRequest, NextResponse } from 'next/server';

export async function POST(req:NextRequest){
  try{
    const key=process.env.RESEND_API_KEY;
    const from=process.env.RESEND_FROM_EMAIL;
    if(!key || !from) return NextResponse.json({ok:false,error:'Email sending is not configured.'},{status:503});
    const {segmentId,subject,html,scheduledAt,send=true,name}=await req.json();
    if(!segmentId || !subject || !html) return NextResponse.json({ok:false,error:'Segment, subject and message are required.'},{status:400});
    const body:Record<string,unknown>={segment_id:segmentId,from,subject,html,send:Boolean(send)};
    if(name) body.name=name;
    if(scheduledAt) body.scheduled_at=scheduledAt;
    const res=await fetch('https://api.resend.com/broadcasts',{
      method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(body)
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok) return NextResponse.json({ok:false,error:data?.message||'Broadcast request failed.'},{status:res.status});
    return NextResponse.json({ok:true,broadcast:data});
  }catch(error){
    console.error('Broadcast failed',error);
    return NextResponse.json({ok:false,error:'Could not create the email broadcast.'},{status:503});
  }
}
