import { NextRequest, NextResponse } from 'next/server';

const API='https://api.resend.com';

function headers(){
  const key=process.env.RESEND_API_KEY;
  if(!key) throw new Error('RESEND_API_KEY is not configured');
  return {Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
}

async function call(path:string,method='GET',body?:unknown,allowConflict=false){
  const res=await fetch(`${API}${path}`,{method,headers:headers(),body:body===undefined?undefined:JSON.stringify(body)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok && !(allowConflict&&res.status===409)) throw new Error(data?.message||'Resend request failed');
  return {status:res.status,data};
}

export async function POST(req:NextRequest){
  try{
    const {name,contacts}=await req.json();
    if(!name || !Array.isArray(contacts)) return NextResponse.json({ok:false,error:'List name and contacts are required.'},{status:400});

    const existing=await call('/segments');
    let segmentId=(existing.data?.data||existing.data||[]).find?.((x:any)=>x.name===name)?.id;
    if(!segmentId){
      const created=await call('/segments','POST',{name});
      segmentId=created.data.id;
    }

    let imported=0;
    for(const contact of contacts){
      const email=String(contact.email||'').trim();
      if(!email) continue;
      const full=String(contact.name||'').trim();
      const created=await call('/contacts','POST',{
        email,
        first_name:String(contact.firstName||contact.first_name||full.split(' ')[0]||''),
        last_name:String(contact.lastName||contact.last_name||full.split(' ').slice(1).join(' ')||''),
        unsubscribed:Boolean(contact.unsubscribed),
        segments:[{id:segmentId}],
        properties:{category:String(contact.category||''),company:String(contact.company||'')}
      },true);
      if(created.status===409){
        await call(`/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,'POST');
      }
      imported++;
    }
    return NextResponse.json({ok:true,segmentId,imported});
  }catch(error){
    console.error('Email segment sync failed',error);
    return NextResponse.json({ok:false,error:error instanceof Error?error.message:'Could not sync email list.'},{status:503});
  }
}
