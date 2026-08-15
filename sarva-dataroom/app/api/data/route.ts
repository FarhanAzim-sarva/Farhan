import { NextRequest, NextResponse } from 'next/server';
import { readOperatingState, writeOperatingState, OperatingState } from '@/lib/googleDrive';

export const runtime='nodejs';

export async function GET(){
  try{
    const state=await readOperatingState();
    return NextResponse.json({ok:true,state});
  }catch(error){
    console.error('Operating state read failed',error);
    return NextResponse.json({ok:false,error:'Shared operating data is not configured.'},{status:503});
  }
}

export async function PUT(req:NextRequest){
  try{
    const input=await req.json() as OperatingState;
    const state=await writeOperatingState(input);
    return NextResponse.json({ok:true,state});
  }catch(error){
    console.error('Operating state write failed',error);
    return NextResponse.json({ok:false,error:'Could not save operating data.'},{status:503});
  }
}
