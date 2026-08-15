import { NextRequest, NextResponse } from 'next/server';
import { uploadToDataRoom } from '@/lib/googleDrive';

export const runtime='nodejs';
export const maxDuration=60;

const MAX_BYTES=25*1024*1024;
const ALLOWED=new Set([
  'application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword','application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png','image/jpeg','image/webp','text/plain'
]);

export async function POST(req:NextRequest){
  try{
    const form=await req.formData();
    const value=form.get('file');
    const folderId=String(form.get('folderId')||'').trim()||undefined;
    if(!(value instanceof File)) return NextResponse.json({ok:false,error:'No file supplied.'},{status:400});
    if(value.size>MAX_BYTES) return NextResponse.json({ok:false,error:'File exceeds the 25 MB upload limit.'},{status:413});
    if(value.type && !ALLOWED.has(value.type)) return NextResponse.json({ok:false,error:'Unsupported file type.'},{status:415});
    const bytes=Buffer.from(await value.arrayBuffer());
    const item=await uploadToDataRoom({name:value.name,type:value.type,bytes},folderId);
    return NextResponse.json({ok:true,item});
  }catch(error){
    console.error('Data room upload failed',error);
    return NextResponse.json({ok:false,error:'Upload failed. Check the Drive connection and folder permissions.'},{status:503});
  }
}
