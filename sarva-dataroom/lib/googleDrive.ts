import { google, drive_v3 } from 'googleapis';
import { Readable } from 'node:stream';

export type DriveItem={
  id:string;
  name:string;
  mimeType:string;
  modifiedTime?:string;
  webViewLink?:string;
  size?:string;
  isFolder:boolean;
};

export type OperatingState={
  contacts:Array<Record<string,unknown>>;
  kpis:Array<Record<string,unknown>>;
  tasks:Array<Record<string,unknown>>;
  opportunities:Array<Record<string,unknown>>;
  investors:Array<Record<string,unknown>>;
  blockers:Array<Record<string,unknown>>;
  imports:Array<Record<string,unknown>>;
  updatedAt?:string;
};

const EMPTY_STATE:OperatingState={contacts:[],kpis:[],tasks:[],opportunities:[],investors:[],blockers:[],imports:[]};
const STATE_FILE='Sarva OS Data.json';

function driveClient(){
  const clientEmail=process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey=process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g,'\n');
  if(!clientEmail || !privateKey) throw new Error('Google Drive service account is not configured');
  const auth=new google.auth.JWT({
    email:clientEmail,
    key:privateKey,
    // The service account should only be shared into dedicated Sarva folders.
    scopes:['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({version:'v3',auth});
}

function mapFile(f:drive_v3.Schema$File):DriveItem{
  return {
    id:f.id||'',name:f.name||'Untitled',mimeType:f.mimeType||'',
    modifiedTime:f.modifiedTime||undefined,webViewLink:f.webViewLink||undefined,
    size:f.size||undefined,isFolder:f.mimeType==='application/vnd.google-apps.folder'
  };
}

export async function listFolder(folderId:string):Promise<DriveItem[]>{
  const drive=driveClient();
  const res=await drive.files.list({
    q:`'${folderId}' in parents and trashed = false`,
    fields:'files(id,name,mimeType,modifiedTime,webViewLink,size)',
    orderBy:'folder,name',pageSize:200,supportsAllDrives:true,includeItemsFromAllDrives:true,
  });
  return (res.data.files||[]).map(mapFile);
}

export async function getDataRoomRoot(){
  const root=process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if(!root) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured');
  return listFolder(root);
}

export async function uploadToDataRoom(file:{name:string;type?:string;bytes:Buffer},folderId?:string){
  const drive=driveClient();
  const root=folderId||process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if(!root) throw new Error('Google Drive data room root is not configured');
  const res=await drive.files.create({
    requestBody:{name:file.name,parents:[root]},
    media:{mimeType:file.type||'application/octet-stream',body:Readable.from(file.bytes)},
    fields:'id,name,mimeType,modifiedTime,webViewLink,size',supportsAllDrives:true,
  });
  return mapFile(res.data);
}

function operationsFolder(){
  const folder=process.env.GOOGLE_DRIVE_OPERATIONS_FOLDER_ID;
  if(!folder) throw new Error('GOOGLE_DRIVE_OPERATIONS_FOLDER_ID is not configured');
  return folder;
}

async function stateFileId(){
  const drive=driveClient();
  const folder=operationsFolder();
  const escaped=STATE_FILE.replace(/'/g,"\\'");
  const res=await drive.files.list({
    q:`'${folder}' in parents and name = '${escaped}' and trashed = false`,
    fields:'files(id,name)',pageSize:10,supportsAllDrives:true,includeItemsFromAllDrives:true,
  });
  return res.data.files?.[0]?.id||null;
}

export async function readOperatingState():Promise<OperatingState>{
  const drive=driveClient();
  const id=await stateFileId();
  if(!id) return {...EMPTY_STATE};
  const res=await drive.files.get({fileId:id,alt:'media',supportsAllDrives:true},{responseType:'text'});
  try{
    const parsed=typeof res.data==='string'?JSON.parse(res.data):res.data;
    return {...EMPTY_STATE,...parsed};
  }catch{return {...EMPTY_STATE};}
}

export async function writeOperatingState(input:OperatingState):Promise<OperatingState>{
  const drive=driveClient();
  const folder=operationsFolder();
  const state:OperatingState={...EMPTY_STATE,...input,updatedAt:new Date().toISOString()};
  const bytes=Buffer.from(JSON.stringify(state,null,2),'utf8');
  const id=await stateFileId();
  if(id){
    await drive.files.update({fileId:id,media:{mimeType:'application/json',body:Readable.from(bytes)},supportsAllDrives:true});
  }else{
    await drive.files.create({
      requestBody:{name:STATE_FILE,parents:[folder],mimeType:'application/json'},
      media:{mimeType:'application/json',body:Readable.from(bytes)},supportsAllDrives:true,
    });
  }
  return state;
}
