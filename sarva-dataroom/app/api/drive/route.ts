import { NextRequest, NextResponse } from 'next/server';
import { getDataRoomRoot, listFolder } from '@/lib/googleDrive';

export async function GET(req:NextRequest){
  try{
    const folderId=req.nextUrl.searchParams.get('folderId');
    const items=folderId?await listFolder(folderId):await getDataRoomRoot();
    return NextResponse.json({ok:true,items});
  }catch(error){
    console.error('Drive data room error',error);
    return NextResponse.json({ok:false,error:'Drive connection is not configured or unavailable.'},{status:503});
  }
}
