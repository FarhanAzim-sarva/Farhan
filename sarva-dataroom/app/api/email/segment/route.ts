import { NextRequest, NextResponse } from 'next/server';

const API='https://api.resend.com';

async function resend(path:string,body:unknown){
  const key=process.env.RESEND_API_KEY;
  if(!key) throw new Error('RESEND_API_KEY is not configured');
  const res=await fetch(`${API}${path}`,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data?.message||'Resend request failed');
  return data;
}

export async function POST(req:NextRequest){
  try{
    const {name,contacts}=await req.json();
    if(!name || !Array.isArray(contacts)) return NextResponse.json({ok:false,error:'List name and contacts are required.'},{status:400});
    const segment=await resend('/segments',{name});
    const segmentId=segment.id;
    let imported=0;
    for(const contact of contacts){
      const email=String(contact.email||'').trim();
      if(!email) continue;
      await resend('/contacts',{
        email,
        first_name:String(contact.firstName||contact.first_name||contact.name||'').split(' ')[0]||undefined,
        last_name:String(contact.lastName||contact.last_name||contact.name||'').split(' ').slice(1).join(' ')||undefined,
        unsubscribed:Boolean(contact.unsubscribed),
        segments:[{id:segmentId}],
        properties:{category:String(contact.category||''),company:String(contact.company||'')}
      });
      imported++;
    }
    return NextResponse.json({ok:true,segmentId,imported});
  }catch(error){
    console.error('Email segment sync failed',error);
    return NextResponse.json({ok:false,error:error instanceof Error?error.message:'Could not sync email list.'},{status:503});
  }
}
