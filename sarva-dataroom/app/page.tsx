'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  AlertTriangle, ArrowUpRight, BarChart3, Building2, CalendarDays, CheckCircle2,
  ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Database, ExternalLink,
  FileSpreadsheet, FileText, Folder, FolderOpen, Home, Import, Landmark, ListTodo,
  LockKeyhole, LogOut, Mail, Paperclip, Plus, RefreshCw, Search, Send, ShieldCheck,
  Target, Upload, UserRound, Users2, X
} from 'lucide-react';

type RecordRow=Record<string,any>;
type DriveItem={id:string;name:string;mimeType:string;modifiedTime?:string;webViewLink?:string;size?:string;isFolder:boolean};
type Crumb={id:string;name:string};
type OperatingState={
  contacts:RecordRow[];kpis:RecordRow[];tasks:RecordRow[];opportunities:RecordRow[];
  investors:RecordRow[];blockers:RecordRow[];imports:RecordRow[];emailSegments:RecordRow[];updatedAt?:string;
};

type Destination='contacts'|'kpis'|'tasks'|'opportunities'|'investors';

const EMPTY:OperatingState={contacts:[],kpis:[],tasks:[],opportunities:[],investors:[],blockers:[],imports:[],emailSegments:[]};
const sections=[
  ['01','Company Overview',['Executive Summary','Current Pitch Deck','One-Pager','Fundraising Overview','Company Timeline','Press + Awards']],
  ['02','Product',['Product Overview','Product Demo','Vendor Dashboard Demo','Product Roadmap','SarvaAI Overview']],
  ['03','Traction',['KPI Dashboard','Monthly Growth','Vendor Growth','Product Catalogue Growth','Revenue Metrics','Pipeline']],
  ['04','Market',['Market Opportunity','TAM / SAM / SOM','Customer Personas','Competitive Landscape','Expansion Strategy']],
  ['05','Business Model',['Pricing Model','Unit Economics','Revenue Model','Go-To-Market Strategy','Store Acquisition Funnel']],
  ['06','Financials',['Historical P&L','Cash Flow','Balance Sheet','3-Year Forecast','Financial Assumptions','Use of Funds']],
  ['07','Team',['Team Overview','Founder Bios','Organizational Chart','Advisor Overview','Hiring Roadmap']],
  ['08','Legal & Corporate',['Certificate of Formation','EIN','Operating Agreement','Current Cap Table','IP Assignments','Vendor Agreements']],
  ['09','Technology & IP',['Technical Architecture','AI Architecture','Data Architecture','Security Overview','Infrastructure Overview']],
  ['10','Customer & Vendor Proof',['Vendor Agreements','Vendor Photos','Vendor Interviews','Customer Feedback','Waitlist Evidence','Case Studies']],
  ['11','Recognition & Network',['Accelerators','Awards','Partner Programs','Advisor Network','Press Mentions']],
] as const;

const fieldSets:Record<Destination,string[]>={
  contacts:['name','email','company','category','phone','notes'],
  kpis:['metric','value','target','unit','owner','period','status'],
  tasks:['title','dueDate','owner','status','priority','category'],
  opportunities:['name','type','deadline','status','owner','amount','url'],
  investors:['name','type','contact','email','status','fit','nextAction']
};

const synonyms:Record<string,string[]>={
  name:['name','full name','contact name','investor','company','organization'],email:['email','email address','e-mail'],company:['company','organization','org','store'],category:['category','type','segment','group'],phone:['phone','phone number','mobile'],notes:['notes','note','comments'],
  metric:['metric','kpi','metric name','key performance indicator'],value:['value','current','current value','actual'],target:['target','goal','target value'],unit:['unit','format'],owner:['owner','assigned to','assignee','lead'],period:['period','month','quarter','reporting period'],status:['status','stage'],
  title:['title','task','task name','action item'],dueDate:['due date','deadline','due','date'],priority:['priority','importance'],
  type:['type','category','program type','fund type'],deadline:['deadline','due date','application deadline','date'],amount:['amount','award','funding','check size'],url:['url','link','website','application link'],
  contact:['contact','contact person','person'],fit:['fit','fit score','score'],nextAction:['next action','next step','follow up','follow-up']
};

const nav=[
  ['Home',Home],['Data Room',Folder],['Contacts',Users2],['Email',Mail],['Tasks',ListTodo],
  ['Calendar',CalendarDays],['KPIs',BarChart3],['Investor CRM',Building2],['Opportunities',Landmark],['Imports',Import]
] as const;

function uid(){return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}
function s(v:any){return v===null||v===undefined?'':String(v)}
function n(v:any){const x=Number(String(v??'').replace(/[$,%]/g,''));return Number.isFinite(x)?x:0}
function dateKey(v:any){const d=new Date(v);return Number.isNaN(d.valueOf())?'':d.toISOString().slice(0,10)}

export default function Page(){
  const [active,setActive]=useState('Home');
  const [query,setQuery]=useState('');
  const [state,setState]=useState<OperatingState>(EMPTY);
  const [dataStatus,setDataStatus]=useState<'loading'|'saved'|'offline'>('loading');
  const [driveItems,setDriveItems]=useState<DriveItem[]>([]);
  const [driveStatus,setDriveStatus]=useState<'idle'|'loading'|'connected'|'offline'>('idle');
  const [breadcrumbs,setBreadcrumbs]=useState<Crumb[]>([{id:'',name:'Data Room'}]);
  const [uploadStatus,setUploadStatus]=useState('');
  const [contactFilter,setContactFilter]=useState('All');
  const [importFile,setImportFile]=useState<File|null>(null);
  const [workbook,setWorkbook]=useState<XLSX.WorkBook|null>(null);
  const [sheetName,setSheetName]=useState('');
  const [importRows,setImportRows]=useState<RecordRow[]>([]);
  const [destination,setDestination]=useState<Destination>('kpis');
  const [mapping,setMapping]=useState<Record<string,string>>({});
  const [importMessage,setImportMessage]=useState('');
  const [month,setMonth]=useState(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1)});
  const fileInput=useRef<HTMLInputElement>(null);

  useEffect(()=>{loadState()},[]);
  useEffect(()=>{if(active==='Data Room'&&driveStatus==='idle')loadDrive()},[active]);
  useEffect(()=>{if(workbook&&sheetName)readSheet(sheetName)},[sheetName]);

  async function loadState(){
    setDataStatus('loading');
    try{const r=await fetch('/api/data',{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();setState({...EMPTY,...j.state});setDataStatus('saved')}catch{setDataStatus('offline')}
  }
  async function persist(next:OperatingState){
    setState(next);setDataStatus('loading');
    try{const r=await fetch('/api/data',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(next)});if(!r.ok)throw 0;const j=await r.json();setState({...EMPTY,...j.state});setDataStatus('saved')}catch{setDataStatus('offline')}
  }
  function patch(key:keyof OperatingState,rows:RecordRow[]){persist({...state,[key]:rows})}
  function switchView(v:string){setActive(v);setQuery('')}
  async function signOut(){await fetch('/api/logout',{method:'POST'});location.href='/login'}

  async function loadDrive(folderId?:string,name?:string,reset=false){
    setDriveStatus('loading');
    try{const r=await fetch(folderId?`/api/drive?folderId=${encodeURIComponent(folderId)}`:'/api/drive',{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();setDriveItems(j.items||[]);setDriveStatus('connected');if(reset)setBreadcrumbs([{id:'',name:'Data Room'}]);else if(folderId&&name)setBreadcrumbs(p=>[...p,{id:folderId,name}])}catch{setDriveStatus('offline')}
  }
  async function uploadFiles(e:ChangeEvent<HTMLInputElement>){
    const files=Array.from(e.target.files||[]);if(!files.length)return;
    setUploadStatus(`Uploading ${files.length} file${files.length>1?'s':''}…`);
    const folderId=breadcrumbs.at(-1)?.id||'';
    let ok=0;
    for(const file of files){const fd=new FormData();fd.set('file',file);if(folderId)fd.set('folderId',folderId);const r=await fetch('/api/upload',{method:'POST',body:fd});if(r.ok)ok++}
    setUploadStatus(`${ok}/${files.length} uploaded`);e.target.value='';await loadDrive(folderId||undefined);
  }

  async function chooseImport(e:ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];if(!file)return;setImportFile(file);setImportMessage('Reading workbook…');
    try{const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array',cellDates:true});setWorkbook(wb);setSheetName(wb.SheetNames[0]||'');setImportMessage('')}catch{setImportMessage('Could not read this workbook.')}
  }
  function readSheet(name:string){
    if(!workbook)return;const ws=workbook.Sheets[name];const rows=XLSX.utils.sheet_to_json<RecordRow>(ws,{defval:'',raw:false});setImportRows(rows);
    const headers=Object.keys(rows[0]||{});const next:Record<string,string>={};
    for(const field of fieldSets[destination]){const aliases=[field,...(synonyms[field]||[])].map(x=>x.toLowerCase());const match=headers.find(h=>aliases.includes(h.trim().toLowerCase()));if(match)next[field]=match}
    setMapping(next);
  }
  function changeDestination(d:Destination){setDestination(d);const headers=Object.keys(importRows[0]||{});const next:Record<string,string>={};for(const field of fieldSets[d]){const aliases=[field,...(synonyms[field]||[])].map(x=>x.toLowerCase());const match=headers.find(h=>aliases.includes(h.trim().toLowerCase()));if(match)next[field]=match}setMapping(next)}
  async function doImport(){
    if(!importRows.length)return;const rows=importRows.map(row=>{const out:RecordRow={id:uid(),sourceFile:importFile?.name||'',importedAt:new Date().toISOString()};for(const field of fieldSets[destination]){const col=mapping[field];out[field]=col?row[col]:''}return out});
    const next={...state,[destination]:[...(state[destination] as RecordRow[]),...rows],imports:[...state.imports,{id:uid(),file:importFile?.name,sheet:sheetName,destination,count:rows.length,at:new Date().toISOString()}]};
    await persist(next);setImportMessage(`Imported ${rows.length} rows into ${destination}.`);switchView(destination==='kpis'?'KPIs':destination==='contacts'?'Contacts':destination==='tasks'?'Tasks':destination==='investors'?'Investor CRM':'Opportunities');
  }

  const contacts=useMemo(()=>state.contacts.filter(r=>{const q=query.toLowerCase();const category=s(r.category)||'Uncategorized';return (contactFilter==='All'||category===contactFilter)&&`${s(r.name)} ${s(r.email)} ${s(r.company)} ${category}`.toLowerCase().includes(q)}),[state.contacts,query,contactFilter]);
  const categories=useMemo(()=>['All',...Array.from(new Set(state.contacts.map(r=>s(r.category)||'Uncategorized')))], [state.contacts]);
  const filteredInvestors=useMemo(()=>state.investors.filter(r=>`${s(r.name)} ${s(r.type)} ${s(r.status)} ${s(r.nextAction)}`.toLowerCase().includes(query.toLowerCase())),[state.investors,query]);
  const filteredOpps=useMemo(()=>state.opportunities.filter(r=>`${s(r.name)} ${s(r.type)} ${s(r.status)} ${s(r.owner)}`.toLowerCase().includes(query.toLowerCase())),[state.opportunities,query]);
  const filteredTasks=useMemo(()=>state.tasks.filter(r=>`${s(r.title)} ${s(r.owner)} ${s(r.status)} ${s(r.priority)}`.toLowerCase().includes(query.toLowerCase())),[state.tasks,query]);
  const filteredKpis=useMemo(()=>state.kpis.filter(r=>`${s(r.metric)} ${s(r.owner)} ${s(r.period)} ${s(r.status)}`.toLowerCase().includes(query.toLowerCase())),[state.kpis,query]);

  function HomeView(){
    const upcoming=[...state.tasks.map(x=>({...x,_kind:'Task',_date:x.dueDate})),...state.opportunities.map(x=>({...x,_kind:'Opportunity',_date:x.deadline}))].filter(x=>dateKey(x._date)).sort((a,b)=>dateKey(a._date).localeCompare(dateKey(b._date))).slice(0,6);
    const kpis=state.kpis.slice(0,4);
    return <div className="view">
      <section className="welcome"><div><span className="kicker">SARVA OPERATING SYSTEM</span><h2>Company command center</h2><p>Documents, relationships, deadlines, blockers and company metrics in one private workspace.</p></div><div className="syncState"><Database size={16}/><div><b>{dataStatus==='saved'?'Shared data synced':dataStatus==='loading'?'Saving…':'Operations Drive not connected'}</b><span>{state.updatedAt?`Last updated ${new Date(state.updatedAt).toLocaleString()}`:'Google Drive-backed operating data'}</span></div></div></section>
      <section className="summaryGrid"><Summary label="Product catalogue" value="15K+" sub="catalogued products"/><Summary label="Vendor conversion" value="9/9" sub="stores approached → joined"/><Summary label="Open tasks" value={String(state.tasks.filter(x=>s(x.status).toLowerCase()!=='done').length)} sub="company action items"/><Summary label="Tracked KPIs" value={String(state.kpis.length)} sub="imported or entered"/></section>
      <section className="homeGrid"><div className="panel"><PanelHead title="Blockers" action="Add blocker" onClick={()=>switchView('Tasks')}/>{state.blockers.length?state.blockers.slice(0,5).map(b=><div className="lineItem" key={b.id}><AlertTriangle size={16}/><div><b>{s(b.title)}</b><span>{s(b.owner)||'Unassigned'} · {s(b.status)||'Open'}</span></div></div>):<Empty text="No blockers recorded yet."/>}</div>
      <div className="panel"><PanelHead title="Upcoming dates" action="Calendar" onClick={()=>switchView('Calendar')}/>{upcoming.length?upcoming.map((x:any)=><div className="lineItem" key={x.id}><CalendarDays size={16}/><div><b>{s(x.title||x.name)}</b><span>{x._kind} · {dateKey(x._date)}</span></div></div>):<Empty text="Import deadlines or add tasks to populate this view."/>}</div></section>
      <section className="panel"><PanelHead title="KPI snapshot" action="Open KPI tracker" onClick={()=>switchView('KPIs')}/>{kpis.length?<div className="kpiCards">{kpis.map(k=><KpiCard key={k.id} row={k}/>)}</div>:<Empty text="Import your KPI workbook and your core metrics will appear here." button="Import spreadsheet" onClick={()=>switchView('Imports')}/>}</section>
    </div>
  }

  function DataRoomView(){const current=breadcrumbs.at(-1)?.id||'';return <div className="view"><PageHead kicker="DILIGENCE" title="Data Room" copy="Upload PDFs, Excel files, decks, agreements, images and supporting documents directly into the selected Google Drive folder." actions={<><input ref={fileInput} hidden type="file" multiple onChange={uploadFiles} accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.pptx,.png,.jpg,.jpeg,.webp,.txt"/><button className="primary" onClick={()=>fileInput.current?.click()}><Upload size={16}/>Upload files</button><button className="button" onClick={()=>loadDrive(current||undefined)}><RefreshCw size={15}/>Refresh</button></>}/>
    <div className="roomBar"><div className="breadcrumbs">{breadcrumbs.map((c,i)=><button key={`${c.id}-${i}`} onClick={()=>{if(i===0)loadDrive(undefined,undefined,true)}}>{i>0&&<ChevronRight size={13}/>} {c.name}</button>)}</div><span className={`connection ${driveStatus}`}>{driveStatus==='connected'?'Drive connected':driveStatus==='loading'?'Connecting…':'Drive not configured'}{uploadStatus?` · ${uploadStatus}`:''}</span></div>
    {driveStatus==='connected'?<div className="driveGrid">{driveItems.filter(x=>x.name.toLowerCase().includes(query.toLowerCase())).map(item=><div className="driveItem" key={item.id} onDoubleClick={()=>item.isFolder&&loadDrive(item.id,item.name)}><div className="fileGlyph">{item.isFolder?<FolderOpen size={20}/>:<FileText size={20}/>}</div><div><b>{item.name}</b><span>{item.isFolder?'Folder':item.mimeType.replace('application/','')}</span></div>{item.isFolder?<button onClick={()=>loadDrive(item.id,item.name)}><ChevronRight size={16}/></button>:item.webViewLink?<a href={item.webViewLink} target="_blank" rel="noreferrer"><ExternalLink size={15}/></a>:null}</div>)}</div>:<div className="folderTemplate"><div className="notice"><Database size={19}/><div><b>Connect Google Drive to make this live.</b><span>The folder layout below is the recommended diligence structure.</span></div></div><div className="folderGrid">{sections.map(([id,title,docs])=><div className="folderCard" key={id}><div className="folderTitle"><span>{id}</span><Folder size={18}/></div><h3>{title}</h3>{docs.slice(0,4).map(d=><small key={d}><FileText size={12}/>{d}</small>)}</div>)}</div></div>}</div>}

  function ContactsView(){return <div className="view"><PageHead kicker="RELATIONSHIPS" title="Contacts" copy="One contact database for customers, vendors, investors and ecosystem partners. Import existing lists instead of re-entering them." actions={<button className="primary" onClick={()=>switchView('Imports')}><Import size={16}/>Import contacts</button>}/><div className="tabs">{categories.map(c=><button className={contactFilter===c?'active':''} key={c} onClick={()=>setContactFilter(c)}>{c}<span>{c==='All'?state.contacts.length:state.contacts.filter(x=>(s(x.category)||'Uncategorized')===c).length}</span></button>)}</div><div className="dataTable contactsTable"><div className="tableHead"><span>Name</span><span>Email</span><span>Company / store</span><span>Category</span><span>Phone</span></div>{contacts.length?contacts.map(r=><div className="tableRow" key={r.id}><span><b>{s(r.name)||'—'}</b></span><span>{s(r.email)||'—'}</span><span>{s(r.company)||'—'}</span><span><Tag>{s(r.category)||'Uncategorized'}</Tag></span><span>{s(r.phone)||'—'}</span></div>):<Empty text="No contacts match this view."/>}</div></div>}

  function EmailView(){const groups=['Customers','Vendors','Investors','Ecosystem Partners'];const [group,setGroup]=useState(groups[0]);const [subject,setSubject]=useState('');const [message,setMessage]=useState('');const [scheduled,setScheduled]=useState('');const [emailMsg,setEmailMsg]=useState('');const segment=state.emailSegments.find(x=>s(x.name)===group);const list=state.contacts.filter(x=>s(x.category).toLowerCase()===group.toLowerCase().replace(' partners',' partner')||s(x.category).toLowerCase()===group.toLowerCase());
    async function syncList(){setEmailMsg('Syncing list…');const r=await fetch('/api/email/segment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:`Sarva ${group}`,contacts:list})});const j=await r.json();if(r.ok){const next={...state,emailSegments:[...state.emailSegments.filter(x=>s(x.name)!==group),{id:uid(),name:group,segmentId:j.segmentId,count:j.imported,syncedAt:new Date().toISOString()}]};await persist(next);setEmailMsg(`${j.imported} contacts synced.`)}else setEmailMsg(j.error||'Could not sync list.')}
    async function sendBroadcast(){if(!segment?.segmentId){setEmailMsg('Sync this contact list first.');return}setEmailMsg('Creating campaign…');const html=`<div style="font-family:Arial,sans-serif;white-space:pre-wrap">${message.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}<p style="margin-top:24px;font-size:12px">{{{RESEND_UNSUBSCRIBE_URL}}}</p></div>`;const r=await fetch('/api/email/broadcast',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({segmentId:segment.segmentId,subject,html,scheduledAt:scheduled?new Date(scheduled).toISOString():undefined,send:true,name:`Sarva ${group} - ${subject}`})});const j=await r.json();setEmailMsg(r.ok?(scheduled?'Campaign scheduled.':'Campaign sent.'):j.error||'Campaign failed.')}
    return <div className="view"><PageHead kicker="OUTREACH" title="Email" copy="Manage segmented lists and create scheduled outreach campaigns. Customer/vendor campaigns should use subscribed contact lists and an unsubscribe path."/><div className="emailLayout"><div className="panel"><h3>Audience</h3><label>Contact list<select value={group} onChange={e=>setGroup(e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select></label><div className="audienceCard"><Users2 size={18}/><div><b>{list.length} contacts</b><span>{segment?`Synced ${segment.count||0} · ${segment.syncedAt?new Date(segment.syncedAt).toLocaleDateString():''}`:'Not synced to email provider'}</span></div></div><button className="button full" onClick={syncList}>Sync list</button></div><div className="panel composer"><h3>Campaign</h3><label>Subject<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject line"/></label><label>Message<textarea rows={10} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write the campaign message…"/></label><label>Schedule <span>leave blank to send now</span><input type="datetime-local" value={scheduled} onChange={e=>setScheduled(e.target.value)}/></label><button className="primary" onClick={sendBroadcast} disabled={!subject||!message}><Send size={16}/>{scheduled?'Schedule campaign':'Send campaign'}</button>{emailMsg&&<p className="formMsg">{emailMsg}</p>}</div></div></div>}

  function TasksView(){const [title,setTitle]=useState('');const [due,setDue]=useState('');const [owner,setOwner]=useState('');const [priority,setPriority]=useState('Medium');const [blocker,setBlocker]=useState('');
    function addTask(e:FormEvent){e.preventDefault();if(!title)return;patch('tasks',[...state.tasks,{id:uid(),title,dueDate:due,owner,status:'Open',priority,category:'Company'}]);setTitle('');setDue('')}
    function addBlocker(){if(!blocker)return;patch('blockers',[...state.blockers,{id:uid(),title:blocker,status:'Open',owner:'',createdAt:new Date().toISOString()}]);setBlocker('')}
    return <div className="view"><PageHead kicker="EXECUTION" title="Tasks & blockers" copy="Track action items, owners, due dates and issues that are holding the company back."/><div className="twoCol"><div className="panel"><h3>Add task</h3><form className="formGrid" onSubmit={addTask}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task"/><input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="Owner"/><input type="date" value={due} onChange={e=>setDue(e.target.value)}/><select value={priority} onChange={e=>setPriority(e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select><button className="primary"><Plus size={15}/>Add task</button></form></div><div className="panel"><h3>Add blocker</h3><div className="inlineForm"><input value={blocker} onChange={e=>setBlocker(e.target.value)} placeholder="What is blocked?"/><button className="button" onClick={addBlocker}><AlertTriangle size={15}/>Add</button></div>{state.blockers.map(b=><div className="lineItem" key={b.id}><AlertTriangle size={15}/><div><b>{s(b.title)}</b><span>{s(b.status)||'Open'}</span></div><button className="iconBtn" onClick={()=>patch('blockers',state.blockers.filter(x=>x.id!==b.id))}><X size={14}/></button></div>)}</div></div><div className="dataTable taskTable"><div className="tableHead"><span>Task</span><span>Owner</span><span>Due</span><span>Priority</span><span>Status</span></div>{filteredTasks.length?filteredTasks.map(t=><div className="tableRow" key={t.id}><span><b>{s(t.title)}</b></span><span>{s(t.owner)||'—'}</span><span>{dateKey(t.dueDate)||'—'}</span><span><Tag>{s(t.priority)||'Medium'}</Tag></span><span><button className="statusButton" onClick={()=>patch('tasks',state.tasks.map(x=>x.id===t.id?{...x,status:s(x.status).toLowerCase()==='done'?'Open':'Done'}:x))}>{s(t.status).toLowerCase()==='done'?<CheckCircle2 size={14}/>:<Clock3 size={14}/>} {s(t.status)||'Open'}</button></span></div>):<Empty text="No tasks yet."/>}</div></div>}

  function CalendarView(){const y=month.getFullYear(),m=month.getMonth();const first=new Date(y,m,1);const start=(first.getDay()+6)%7;const days=new Date(y,m+1,0).getDate();const cells=Array.from({length:42},(_,i)=>i-start+1);const events=[...state.tasks.map(x=>({id:x.id,title:s(x.title),date:dateKey(x.dueDate),kind:'Task'})),...state.opportunities.map(x=>({id:x.id,title:s(x.name),date:dateKey(x.deadline),kind:s(x.type)||'Opportunity'}))];return <div className="view"><PageHead kicker="DATES" title="Calendar" copy="Task deadlines, grant dates, pitch competitions and other imported deadlines appear here automatically." actions={<div className="monthNav"><button onClick={()=>setMonth(new Date(y,m-1,1))}><ChevronLeft size={16}/></button><b>{month.toLocaleString(undefined,{month:'long',year:'numeric'})}</b><button onClick={()=>setMonth(new Date(y,m+1,1))}><ChevronRight size={16}/></button></div>}/><div className="calendar"><div className="weekHead">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=><span key={x}>{x}</span>)}</div><div className="calendarGrid">{cells.map((d,i)=>{const valid=d>0&&d<=days;const key=valid?`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`:'';const ev=events.filter(e=>e.date===key);return <div className={`day ${valid?'':'muted'}`} key={i}>{valid&&<b>{d}</b>}{ev.slice(0,3).map(e=><span className="event" key={e.id}>{e.title}</span>)}{ev.length>3&&<small>+{ev.length-3} more</small>}</div>})}</div></div></div>}

  function KPIView(){const [metric,setMetric]=useState('');const [value,setValue]=useState('');const [target,setTarget]=useState('');const [unit,setUnit]=useState('');const [owner,setOwner]=useState('');function add(e:FormEvent){e.preventDefault();if(!metric)return;patch('kpis',[...state.kpis,{id:uid(),metric,value,target,unit,owner,period:new Date().toISOString().slice(0,7),status:'Active'}]);setMetric('');setValue('');setTarget('')}
    return <div className="view"><PageHead kicker="COMPANY METRICS" title="KPI tracker" copy="Import existing KPI spreadsheets or enter individual metrics. Track actuals, targets, owners, reporting periods and status." actions={<button className="primary" onClick={()=>switchView('Imports')}><FileSpreadsheet size={16}/>Import KPI file</button>}/><form className="quickAdd panel" onSubmit={add}><input value={metric} onChange={e=>setMetric(e.target.value)} placeholder="Metric name"/><input value={value} onChange={e=>setValue(e.target.value)} placeholder="Current value"/><input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Target"/><input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="Unit"/><input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="Owner"/><button className="button"><Plus size={14}/>Add</button></form>{filteredKpis.length?<><div className="kpiCards">{filteredKpis.slice(0,6).map(k=><KpiCard key={k.id} row={k}/>)}</div><div className="dataTable kpiTable"><div className="tableHead"><span>Metric</span><span>Actual</span><span>Target</span><span>Owner</span><span>Period</span><span>Status</span></div>{filteredKpis.map(k=><div className="tableRow" key={k.id}><span><b>{s(k.metric)}</b></span><span>{s(k.value)} {s(k.unit)}</span><span>{s(k.target)||'—'} {s(k.unit)}</span><span>{s(k.owner)||'—'}</span><span>{s(k.period)||'—'}</span><span><Tag>{s(k.status)||'Active'}</Tag></span></div>)}</div></>:<Empty text="No KPI data yet. Import your existing workbook and map its columns." button="Import KPI spreadsheet" onClick={()=>switchView('Imports')}/>}</div>}

  function InvestorsView(){return <div className="view"><PageHead kicker="FUNDRAISING" title="Investor CRM" copy="Your investor spreadsheet can be imported here with fit, stage, relationship, contact and next-action fields." actions={<button className="primary" onClick={()=>{setDestination('investors');switchView('Imports')}}><Import size={16}/>Import investor tracker</button>}/><div className="dataTable investorTable"><div className="tableHead"><span>Investor</span><span>Type</span><span>Contact</span><span>Fit</span><span>Status</span><span>Next action</span></div>{filteredInvestors.length?filteredInvestors.map(r=><div className="tableRow" key={r.id}><span><b>{s(r.name)}</b></span><span>{s(r.type)||'—'}</span><span>{s(r.contact)||s(r.email)||'—'}</span><span>{s(r.fit)||'—'}</span><span><Tag>{s(r.status)||'Research'}</Tag></span><span>{s(r.nextAction)||'—'}</span></div>):<Empty text="Import your investor tracker to populate this CRM."/>}</div></div>}

  function OpportunitiesView(){return <div className="view"><PageHead kicker="CAPITAL + ECOSYSTEM" title="Opportunities" copy="Grants, pitch competitions, accelerators and strategic programs can all be imported into one deadline-aware tracker." actions={<button className="primary" onClick={()=>{setDestination('opportunities');switchView('Imports')}}><Import size={16}/>Import tracker</button>}/><div className="summaryGrid small"><Summary label="Total" value={String(state.opportunities.length)} sub="tracked opportunities"/><Summary label="Upcoming" value={String(state.opportunities.filter(x=>dateKey(x.deadline)>=new Date().toISOString().slice(0,10)).length)} sub="future deadlines"/><Summary label="Applied" value={String(state.opportunities.filter(x=>s(x.status).toLowerCase().includes('appl')).length)} sub="submitted"/><Summary label="Won / finalist" value={String(state.opportunities.filter(x=>/won|finalist|selected/i.test(s(x.status))).length)} sub="positive outcomes"/></div><div className="dataTable oppTable"><div className="tableHead"><span>Opportunity</span><span>Type</span><span>Deadline</span><span>Amount</span><span>Status</span><span>Owner</span></div>{filteredOpps.length?filteredOpps.map(r=><div className="tableRow" key={r.id}><span><b>{s(r.name)}</b></span><span>{s(r.type)||'—'}</span><span>{dateKey(r.deadline)||'—'}</span><span>{s(r.amount)||'—'}</span><span><Tag>{s(r.status)||'Research'}</Tag></span><span>{s(r.owner)||'—'}</span></div>):<Empty text="Import your grants, competitions or accelerator spreadsheet."/>}</div></div>}

  function ImportsView(){const headers=Object.keys(importRows[0]||{});return <div className="view"><PageHead kicker="DATA INGESTION" title="Spreadsheet imports" copy="Upload .xlsx, .xls or .csv files, choose a sheet, map your existing columns, preview the result and import it into the right company tracker."/><div className="importFlow"><div className="panel importStep"><span className="stepNo">1</span><h3>Choose file</h3><label className="dropzone"><FileSpreadsheet size={26}/><b>{importFile?.name||'Select Excel or CSV file'}</b><span>Nothing is imported until you review the mapping.</span><input type="file" accept=".xlsx,.xls,.csv" onChange={chooseImport}/></label></div><div className="panel importStep"><span className="stepNo">2</span><h3>Destination & sheet</h3><label>Destination<select value={destination} onChange={e=>changeDestination(e.target.value as Destination)}><option value="kpis">KPIs</option><option value="contacts">Contacts</option><option value="investors">Investor CRM</option><option value="opportunities">Opportunities / deadlines</option><option value="tasks">Tasks</option></select></label><label>Sheet<select value={sheetName} onChange={e=>setSheetName(e.target.value)} disabled={!workbook}>{workbook?.SheetNames.map(x=><option key={x}>{x}</option>)}</select></label><span className="rowCount">{importRows.length} rows detected</span></div></div>
    {importRows.length>0&&<><div className="panel mappingPanel"><div className="panelHeader"><div><span className="kicker">COLUMN MAPPING</span><h3>Match your spreadsheet to Sarva fields</h3></div><span>Auto-mapped where possible</span></div><div className="mappingGrid">{fieldSets[destination].map(field=><label key={field}><span>{field}</span><select value={mapping[field]||''} onChange={e=>setMapping({...mapping,[field]:e.target.value})}><option value="">— not mapped —</option>{headers.map(h=><option key={h} value={h}>{h}</option>)}</select></label>)}</div></div><div className="panel previewPanel"><div className="panelHeader"><div><span className="kicker">PREVIEW</span><h3>First five rows</h3></div><button className="primary" onClick={doImport}><Import size={15}/>Import {importRows.length} rows</button></div><div className="previewTable"><div className="previewHead">{headers.slice(0,7).map(h=><span key={h}>{h}</span>)}</div>{importRows.slice(0,5).map((r,i)=><div className="previewRow" key={i}>{headers.slice(0,7).map(h=><span key={h}>{s(r[h])||'—'}</span>)}</div>)}</div>{importMessage&&<p className="formMsg">{importMessage}</p>}</div></>}
    <div className="panel importHistory"><PanelHead title="Import history"/>{state.imports.length?state.imports.slice().reverse().slice(0,8).map(x=><div className="lineItem" key={x.id}><FileSpreadsheet size={16}/><div><b>{s(x.file)}</b><span>{s(x.destination)} · {s(x.count)} rows · {x.at?new Date(x.at).toLocaleString():''}</span></div></div>):<Empty text="No files imported yet."/>}</div></div>}

  const rendered=active==='Home'?<HomeView/>:active==='Data Room'?<DataRoomView/>:active==='Contacts'?<ContactsView/>:active==='Email'?<EmailView/>:active==='Tasks'?<TasksView/>:active==='Calendar'?<CalendarView/>:active==='KPIs'?<KPIView/>:active==='Investor CRM'?<InvestorsView/>:active==='Opportunities'?<OpportunitiesView/>:<ImportsView/>;

  return <main className="appShell"><aside className="sidebar"><div className="brand"><img src="/sarva-logo.png" alt="Sarva"/><div><b>SARVA</b><span>Private company workspace</span></div></div><nav>{nav.map(([label,Icon])=><button key={label} className={active===label?'nav active':'nav'} onClick={()=>switchView(label)}><Icon size={17}/><span>{label}</span></button>)}</nav><div className="sideBottom"><div className={`dataBadge ${dataStatus}`}><ShieldCheck size={15}/><div><b>{dataStatus==='saved'?'Private & synced':dataStatus==='loading'?'Saving':'Setup required'}</b><span>Leadership + approved advisors</span></div></div><button className="nav" onClick={signOut}><LogOut size={17}/><span>Sign out</span></button></div></aside><section className="main"><header className="topbar"><div><span className="kicker">SARVA / INTERNAL</span><h1>{active}</h1></div><div className="topActions"><div className="search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${active.toLowerCase()}…`}/>{query&&<button onClick={()=>setQuery('')}><X size={13}/></button>}</div><button className="button driveButton" onClick={()=>switchView('Data Room')}><Paperclip size={15}/>Files</button></div></header>{rendered}<footer><span><LockKeyhole size={13}/>Confidential · Sarva internal use</span><span>Documents + operating data backed by private Google Drive folders</span></footer></section></main>
}

function PageHead({kicker,title,copy,actions}:{kicker:string;title:string;copy:string;actions?:React.ReactNode}){return <div className="pageHead"><div><span className="kicker">{kicker}</span><h2>{title}</h2><p>{copy}</p></div>{actions&&<div className="pageActions">{actions}</div>}</div>}
function PanelHead({title,action,onClick}:{title:string;action?:string;onClick?:()=>void}){return <div className="panelHeader"><h3>{title}</h3>{action&&<button className="textButton" onClick={onClick}>{action}<ArrowUpRight size={13}/></button>}</div>}
function Summary({label,value,sub}:{label:string;value:string;sub:string}){return <div className="summary"><span>{label}</span><b>{value}</b><small>{sub}</small></div>}
function Tag({children}:{children:React.ReactNode}){return <span className="tag">{children}</span>}
function Empty({text,button,onClick}:{text:string;button?:string;onClick?:()=>void}){return <div className="empty"><Database size={20}/><span>{text}</span>{button&&<button className="button" onClick={onClick}>{button}</button>}</div>}
function KpiCard({row}:{row:RecordRow}){const value=n(row.value),target=n(row.target);const pct=target>0?Math.max(0,Math.min(100,(value/target)*100)):0;return <div className="kpiCard"><div className="kpiTop"><span>{s(row.period)||'Current'}</span><Target size={15}/></div><h3>{s(row.metric)||'Metric'}</h3><div className="kpiValue"><b>{s(row.value)||'—'}</b><span>{s(row.unit)}</span></div>{target>0&&<><div className="kpiProgress"><i style={{width:`${pct}%`}}/></div><small>Target {s(row.target)} {s(row.unit)} · {Math.round(pct)}%</small></>}</div>}
