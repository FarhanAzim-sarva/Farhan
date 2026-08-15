import { google, drive_v3 } from 'googleapis';

export type DriveItem={
  id:string;
  name:string;
  mimeType:string;
  modifiedTime?:string;
  webViewLink?:string;
  size?:string;
  isFolder:boolean;
};

function driveClient(){
  const clientEmail=process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey=process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g,'\n');
  if(!clientEmail || !privateKey) throw new Error('Google Drive service account is not configured');
  const auth=new google.auth.JWT({
    email:clientEmail,
    key:privateKey,
    scopes:['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({version:'v3',auth});
}

export async function listFolder(folderId:string):Promise<DriveItem[]>{
  const drive=driveClient();
  const res=await drive.files.list({
    q:`'${folderId}' in parents and trashed = false`,
    fields:'files(id,name,mimeType,modifiedTime,webViewLink,size)',
    orderBy:'folder,name',
    pageSize:200,
    supportsAllDrives:true,
    includeItemsFromAllDrives:true,
  });
  return (res.data.files||[]).map((f:drive_v3.Schema$File)=>({
    id:f.id||'',name:f.name||'Untitled',mimeType:f.mimeType||'',
    modifiedTime:f.modifiedTime||undefined,webViewLink:f.webViewLink||undefined,
    size:f.size||undefined,isFolder:f.mimeType==='application/vnd.google-apps.folder'
  }));
}

export async function getDataRoomRoot(){
  const root=process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if(!root) throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured');
  return listFolder(root);
}
