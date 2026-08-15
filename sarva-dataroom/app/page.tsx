'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, BarChart3, Building2, CheckCircle2, ChevronRight,
  CircleDollarSign, Clock3, Command, Database, ExternalLink, FileText,
  Folder, FolderOpen, Gauge, Globe2, Landmark, LockKeyhole, LogOut,
  RefreshCw, Scale, Search, ShieldCheck, Sparkles, Users2, Video,
  BrainCircuit, X
} from 'lucide-react';

type DriveItem={id:string;name:string;mimeType:string;modifiedTime?:string;webViewLink?:string;size?:string;isFolder:boolean};
type Crumb={id:string;name:string};

const sections = [
  { id:'01', title:'Company Overview', subtitle:'The five-minute version of Sarva', icon:Building2, docs:['Executive Summary','Current Pitch Deck','One-Pager','Fundraising Overview','Company Timeline','Press + Awards'] },
  { id:'02', title:'Product', subtitle:'What we built and how it works', icon:Sparkles, docs:['Product Overview','2-Minute Product Demo','Vendor Dashboard Demo','Customer Experience Demo','Product Screenshots','Product Roadmap','SarvaAI Overview'] },
  { id:'03', title:'Traction', subtitle:'Growth, proof and customer evidence', icon:Gauge, docs:['KPI Dashboard','Monthly Growth','Vendor Growth','Product Catalogue Growth','Revenue Metrics','Pipeline','Vendor Testimonials','Vendor Stories','LOIs'] },
  { id:'04', title:'Market', subtitle:'Market size, customers and competition', icon:Globe2, docs:['Market Opportunity','TAM / SAM / SOM','Customer Personas','Market Research','Competitive Landscape','Geographic Expansion Strategy'] },
  { id:'05', title:'Business Model', subtitle:'Pricing, economics and GTM', icon:CircleDollarSign, docs:['Business Model','Pricing Model','Unit Economics','Revenue Model','Go-To-Market Strategy','Store Acquisition Funnel'] },
  { id:'06', title:'Financials', subtitle:'Historical and forward-looking model', icon:BarChart3, docs:['Historical P&L','Cash Flow','Balance Sheet','3-Year Forecast','Financial Assumptions','Use of Funds','Fundraising Scenario Model'] },
  { id:'07', title:'Team', subtitle:'Founders, advisors and hiring plan', icon:Users2, docs:['Team Overview','Founder Bios','Organizational Chart','Advisor Overview','Hiring Roadmap'] },
  { id:'08', title:'Legal & Corporate', subtitle:'Formation, equity, IP and contracts', icon:Scale, docs:['Certificate of Formation','EIN','Operating Agreement','Current Cap Table','Founder Equity Agreements','IP Assignment Agreements','Vendor Agreements','Privacy Policy','Terms of Service'] },
  { id:'09', title:'Technology & IP', subtitle:'Architecture, AI, security and roadmap', icon:BrainCircuit, docs:['Technical Architecture','AI Architecture','Data Architecture','Security Overview','Infrastructure Overview','Development Roadmap','IP Inventory'] },
  { id:'10', title:'Customer & Vendor Proof', subtitle:'Primary evidence from the market', icon:Database, docs:['Vendor Agreements','Vendor Photos','Vendor Interviews','Customer Feedback','Waitlist Evidence','Case Studies'] },
  { id:'11', title:'Recognition & Network', subtitle:'Programs, awards and external validation', icon:Landmark, docs:['Accelerators','Awards & Finalist Recognition','Partner Programs','Advisor Network','Press Mentions'] },
];

const recent = [
  ['Current Pitch Deck','Company Overview','Updated Aug 15'],
  ['Investor Financial Model','Financials','Updated Aug 15'],
  ['Product Demo','Product','Video · 2:04'],
  ['KPI Dashboard','Traction','Updated Aug 14'],
];

const investors=[
  {name:'White Rose Ventures',type:'PA early-stage VC',fit:94,status:'Research / fit',next:'Review thesis + warm path'},
  {name:'Angel Hive',type:'Angel network',fit:91,status:'Warm network',next:'Prepare investor update'},
  {name:'Framework Venture Partners',type:'Venture fund',fit:86,status:'Connected',next:'Track follow-up'},
  {name:'Ben Franklin Technology Partners',type:'PA capital + support',fit:88,status:'Relationship',next:'Re-engage with traction'},
];

const opportunityGroups=[
  {title:'Grants',count:'Tracker ready',note:'Non-dilutive programs, founder grants and technology funding.'},
  {title:'Pitch Competitions',count:'Tracker ready',note:'Regional, national and founder-focused pitch opportunities.'},
  {title:'Accelerators',count:'Tracker ready',note:'Programs that add capital, mentors, pilots or investor exposure.'},
  {title:'Strategic Programs',count:'Tracker ready',note:'Cloud, AI, retail and small-business ecosystem programs.'},
];

const activity=[
  ['Security','Private access gate enabled','Email allowlist + access code + HTTP-only session cookie'],
  ['Documents','Drive adapter ready','Read-only service-account architecture for one dedicated folder'],
  ['Structure','11 diligence sections mapped','Company through Recognition & Network'],
  ['Fundraising','Investor intelligence workspace added','CRM, fit score, status and next-action fields'],
  ['Data hygiene','Sensitive files stay outside GitHub','Repository contains UI and integration code only'],
];

const navItems=[
  {label:'Overview',icon:Gauge},{label:'Data Room',icon:Folder},{label:'Investor CRM',icon:Users2},
  {label:'Opportunities',icon:Landmark},{label:'Activity',icon:Clock3}
];

export default function Page(){
  const [query,setQuery]=useState('');
  const [active,setActive]=useState('Overview');
  const [driveItems,setDriveItems]=useState<DriveItem[]>([]);
  const [driveStatus,setDriveStatus]=useState<'idle'|'loading'|'connected'|'offline'>('idle');
  const [breadcrumbs,setBreadcrumbs]=useState<Crumb[]>([{id:'',name:'Data Room'}]);
  const [palette,setPalette]=useState(false);

  const filtered=useMemo(()=>sections.filter(s=>`${s.title} ${s.subtitle} ${s.docs.join(' ')}`.toLowerCase().includes(query.toLowerCase())),[query]);
  const filteredDrive=useMemo(()=>driveItems.filter(i=>i.name.toLowerCase().includes(query.toLowerCase())),[driveItems,query]);
  const filteredInvestors=useMemo(()=>investors.filter(i=>`${i.name} ${i.type} ${i.status} ${i.next}`.toLowerCase().includes(query.toLowerCase())),[query]);

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPalette(v=>!v)}
      if(e.key==='Escape')setPalette(false);
    };
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[]);

  useEffect(()=>{if(active==='Data Room'&&driveStatus==='idle')loadDrive();},[active]);

  async function loadDrive(folderId?:string,folderName?:string,reset=false){
    setDriveStatus('loading');
    try{
      const res=await fetch(folderId?`/api/drive?folderId=${encodeURIComponent(folderId)}`:'/api/drive',{cache:'no-store'});
      if(!res.ok)throw new Error('drive unavailable');
      const data=await res.json();
      setDriveItems(data.items||[]);setDriveStatus('connected');
      if(reset)setBreadcrumbs([{id:'',name:'Data Room'}]);
      else if(folderId&&folderName)setBreadcrumbs(prev=>[...prev,{id:folderId,name:folderName}]);
    }catch{setDriveItems([]);setDriveStatus('offline')}
  }

  async function signOut(){await fetch('/api/logout',{method:'POST'});window.location.href='/login'}
  function switchView(view:string){setActive(view);setPalette(false);setQuery('')}
  function findDemo(){setActive('Data Room');setQuery('Product Demo')}

  function Overview(){return <>
    <section className="hero reveal"><div className="mesh"/><div className="scanline"/><div className="heroGlow one"/><div className="heroGlow two"/>
      <div className="heroCopy"><span className="pill"><Sparkles size={14}/> Investor-ready workspace</span><h2>Everything that tells the <em>Sarva story</em>, in one room.</h2><p>A secure diligence workspace for company materials, traction, product, financials, legal documents and fundraising intelligence.</p><div className="heroButtons"><button className="primary" onClick={()=>switchView('Data Room')}>Open data room <ArrowUpRight size={16}/></button><button className="secondary" onClick={findDemo}><Video size={16}/> Find product demo</button></div></div>
      <div className="healthCard floatCard"><div className="healthTop"><span>DATA ROOM HEALTH</span><b>92%</b></div><div className="progress"><i/></div><div className="healthRows"><span><CheckCircle2/> Core diligence mapped</span><span><CheckCircle2/> Drive connector ready</span><span className="warn"><Clock3/> Keep financials current</span></div><div className="healthMeta"><span><b>11</b> sections</span><span><b>1</b> source of truth</span><span><b>0</b> files in GitHub</span></div></div>
    </section>
    <section className="metrics stagger"><article><span>PRODUCT CATALOGUE</span><b>15K+</b><small>catalogued products</small></article><article><span>VENDOR CONVERSION</span><b>9/9</b><small>stores engaged → joined</small></article><article><span>CORE MARKET</span><b>PA</b><small>initial operating region</small></article><article><span>ACCESS</span><b>Private</b><small>leadership + approved advisors</small></article></section>
    <div className="sectionHead"><div><span className="eyebrow">DILIGENCE LIBRARY</span><h3>Drive-style structure</h3></div><button className="textBtn" onClick={()=>switchView('Data Room')}>Open library <ArrowUpRight size={15}/></button></div>
    <section className="folderGrid stagger">{filtered.map((s)=>{const Icon=s.icon;return <article className="folderCard" key={s.id}><div className="cardSheen"/><div className="folderTop"><div className="folderIcon"><Icon size={19}/></div><span>{s.id}</span></div><h4>{s.title}</h4><p>{s.subtitle}</p><div className="docPreview">{s.docs.slice(0,3).map(d=><span key={d}><FileText size={13}/>{d}</span>)}</div><div className="folderBottom"><span>{s.docs.length} expected items</span><button onClick={()=>switchView('Data Room')} aria-label={`Open ${s.title}`}><ArrowUpRight size={16}/></button></div></article>})}</section>
    <section className="lowerGrid"><div className="panel"><div className="panelTitle"><div><span className="eyebrow">LATEST</span><h3>Recent documents</h3></div><button className="textBtn" onClick={()=>switchView('Activity')}>See activity</button></div><div className="recentList">{recent.map(([a,b,c])=><div className="recentRow" key={a}><div className="fileIcon"><FileText size={17}/></div><div className="fileName"><b>{a}</b><span>{b}</span></div><span className="fileDate">{c}</span><ExternalLink size={15}/></div>)}</div></div><div className="panel intelligence"><span className="eyebrow">FUNDRAISING INTELLIGENCE</span><h3>Investor pipeline</h3><div className="pipeline"><div><b>43</b><span>identified</span></div><div><b>16</b><span>high-fit</span></div><div><b>7</b><span>active</span></div><div><b>3</b><span>meetings</span></div></div><div className="pipelineBar"><i/><i/><i/><i/></div><button className="secondary wide" onClick={()=>switchView('Investor CRM')}><Users2 size={16}/> Open investor CRM <ArrowUpRight size={15}/></button></div></section>
  </>}

  function DataRoom(){return <section className="view enter"><div className="viewHero"><div><span className="eyebrow">DILIGENCE LIBRARY</span><h2>Secure document room</h2><p>Google Drive is the source of truth. The app only lists files the dedicated read-only service account can access.</p></div><div className={`connection ${driveStatus}`}><span className="driveDot"/>{driveStatus==='connected'?'Drive connected':driveStatus==='loading'?'Connecting…':'Drive connector'}</div></div>
    <div className="toolbar"><div className="breadcrumbs">{breadcrumbs.map((c,i)=><button key={`${c.id}-${i}`} onClick={()=>{if(i===0)loadDrive(undefined,undefined,true);}}>{i>0&&<ChevronRight size={13}/>}<span>{c.name}</span></button>)}</div><button className="secondary compact" onClick={()=>loadDrive(breadcrumbs.at(-1)?.id||undefined)}><RefreshCw size={14}/> Refresh</button></div>
    {driveStatus==='offline'&&<div className="connectorCard"><div className="connectorOrb"><Database size={22}/></div><div><span className="eyebrow">DRIVE NOT CONFIGURED YET</span><h3>Your full folder architecture is already mapped.</h3><p>Add the service-account environment variables, share only the dedicated Sarva Data Room folder with that account, and the live files will appear here automatically.</p></div><button className="secondary" onClick={()=>loadDrive()}><RefreshCw size={15}/> Retry connection</button></div>}
    {driveStatus==='loading'&&<div className="loadingGrid">{Array.from({length:8}).map((_,i)=><i key={i}/>)}</div>}
    {driveStatus==='connected'&&<div className="driveGrid">{filteredDrive.map(item=><article className={`driveItem ${item.isFolder?'isFolder':''}`} key={item.id} onClick={()=>item.isFolder&&loadDrive(item.id,item.name)}><div className="driveItemIcon">{item.isFolder?<FolderOpen size={20}/>:<FileText size={20}/>}</div><div><b>{item.name}</b><span>{item.isFolder?'Folder':item.mimeType.replace('application/','').replace('vnd.google-apps.','Google ')}</span></div>{item.webViewLink&&!item.isFolder&&<a href={item.webViewLink} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}><ExternalLink size={15}/></a>}</article>)}</div>}
    {driveStatus!=='connected'&&driveStatus!=='loading'&&<><div className="sectionHead templateHead"><div><span className="eyebrow">RECOMMENDED ROOT STRUCTURE</span><h3>11 diligence folders</h3></div></div><div className="folderGrid">{filtered.map(s=>{const Icon=s.icon;return <article className="folderCard compactFolder" key={s.id}><div className="folderTop"><div className="folderIcon"><Icon size={19}/></div><span>{s.id}</span></div><h4>{s.title}</h4><p>{s.subtitle}</p><div className="docPreview">{s.docs.slice(0,4).map(d=><span key={d}><FileText size={13}/>{d}</span>)}</div></article>})}</div></>}
  </section>}

  function CRM(){return <section className="view enter"><div className="viewHero"><div><span className="eyebrow">FUNDRAISING OPERATING SYSTEM</span><h2>Investor CRM</h2><p>Keep research, fit, relationship history and the single next action in one place. This remains internal.</p></div><button className="secondary"><Database size={15}/> Tracker integration ready</button></div>
    <section className="metrics mini"><article><span>IDENTIFIED</span><b>43</b><small>total research set</small></article><article><span>HIGH-FIT</span><b>16</b><small>priority targets</small></article><article><span>ACTIVE</span><b>7</b><small>live conversations</small></article><article><span>MEETINGS</span><b>3</b><small>current pipeline</small></article></section>
    <div className="crmTable"><div className="crmHead"><span>Investor / network</span><span>Type</span><span>Fit</span><span>Status</span><span>Next action</span></div>{filteredInvestors.map(row=><div className="crmRow" key={row.name}><span><b>{row.name}</b></span><span>{row.type}</span><span><i className={`fit ${row.fit>=90?'hot':''}`}>{row.fit}%</i></span><span><i className="statusDot"/>{row.status}</span><span>{row.next}</span></div>)}</div>
    <div className="infoStrip"><ShieldCheck size={16}/><span>The CRM is seeded only with relationships already known to Sarva. Add the full investor spreadsheet later through a Sheet/CSV adapter instead of committing it to GitHub.</span></div>
  </section>}

  function Opportunities(){return <section className="view enter"><div className="viewHero"><div><span className="eyebrow">NON-DILUTIVE + ECOSYSTEM</span><h2>Opportunity tracker</h2><p>A home for upcoming grants, pitch competitions, accelerators and strategic programs—with deadlines and owners added from your tracker.</p></div></div><div className="opportunityGrid">{opportunityGroups.map((o,i)=><article key={o.title}><span className="opIndex">0{i+1}</span><div className="opIcon"><Landmark size={20}/></div><h3>{o.title}</h3><b>{o.count}</b><p>{o.note}</p><div className="opFooter"><span>Connect tracker</span><ArrowUpRight size={15}/></div></article>)}</div><div className="panel roadmap"><span className="eyebrow">WORKFLOW</span><h3>Research → qualify → assign → submit → follow up</h3><div className="workflow"><span>Research</span><i/><span>Fit review</span><i/><span>Owner</span><i/><span>Submit</span><i/><span>Result</span></div></div></section>}

  function ActivityView(){return <section className="view enter"><div className="viewHero"><div><span className="eyebrow">ROOM HEALTH + AUDIT VIEW</span><h2>Activity & readiness</h2><p>Track what changed, what is connected, and what still needs attention before sharing diligence materials.</p></div></div><div className="activityGrid"><div className="panel"><div className="panelTitle"><div><span className="eyebrow">SYSTEM</span><h3>Build activity</h3></div></div><div className="timeline">{activity.map(([tag,title,note])=><div className="timelineRow" key={title}><i/><div><span>{tag}</span><b>{title}</b><p>{note}</p></div></div>)}</div></div><div className="panel readiness"><span className="eyebrow">READINESS CHECK</span><h3>Before advisor access</h3>{['Add real allowed emails','Generate a long access code','Generate a random session token','Share one Drive root folder with service account','Add current deck + financial model','Keep legal folder read-only'].map((x,i)=><div className="checkRow" key={x}><span className={i<1?'done':''}>{i<1?<CheckCircle2 size={14}/>:<Clock3 size={14}/>}</span>{x}</div>)}</div></div></section>}

  return <main className="shell">
    <div className="ambient a1"/><div className="ambient a2"/>
    <aside className="sidebar"><div className="brand"><div className="brandMark">S</div><div><b>SARVA</b><span>Investor Intelligence Room</span></div></div><nav>{navItems.map(({label,icon:Icon})=><button key={label} className={active===label?'nav active':'nav'} onClick={()=>switchView(label)}><Icon size={17}/><span>{label}</span></button>)}</nav><div className="sideFoot"><button className="commandHint" onClick={()=>setPalette(true)}><Command size={14}/><span>Command menu</span><kbd>⌘K</kbd></button><div className="secure"><ShieldCheck size={16}/><div><b>Private workspace</b><span>Authorized users only</span></div></div><button className="nav" onClick={signOut}><LogOut size={17}/><span>Sign out</span></button></div></aside>
    <section className="content"><header className="topbar"><div><span className="eyebrow">SARVA / CONFIDENTIAL</span><h1>{active}</h1></div><div className="topActions"><div className="search"><Search size={16}/><input id="global-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the room…"/><kbd>⌘K</kbd></div><button className="drive" onClick={()=>switchView('Data Room')}><span className={`driveDot ${driveStatus==='connected'?'connected':''}`}/>{driveStatus==='connected'?'Drive connected':'Google Drive'} <ChevronRight size={15}/></button></div></header>
      {active==='Overview'?<Overview/>:active==='Data Room'?<DataRoom/>:active==='Investor CRM'?<CRM/>:active==='Opportunities'?<Opportunities/>:<ActivityView/>}
      <footer><div><LockKeyhole size={14}/> Confidential · Sarva leadership & approved advisors only</div><span>Google Drive source of truth · no sensitive files stored in GitHub</span></footer>
    </section>
    {palette&&<div className="paletteBackdrop" onMouseDown={()=>setPalette(false)}><div className="palette" onMouseDown={e=>e.stopPropagation()}><div className="paletteSearch"><Command size={17}/><b>Navigate Sarva room</b><button onClick={()=>setPalette(false)}><X size={16}/></button></div>{navItems.map(({label,icon:Icon})=><button key={label} onClick={()=>switchView(label)}><Icon size={17}/><span>{label}</span><ChevronRight size={15}/></button>)}<small>Keyboard shortcut · ⌘K / Ctrl K</small></div></div>}
  </main>
}
