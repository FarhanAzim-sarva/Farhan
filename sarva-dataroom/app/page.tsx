'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpRight, BarChart3, Building2, ChevronRight, CircleDollarSign,
  FileText, Folder, Gauge, Globe2, LockKeyhole, Search, ShieldCheck,
  Sparkles, Users2, Video, BrainCircuit, Scale, Landmark, Database,
  CheckCircle2, Clock3, ExternalLink, LogOut
} from 'lucide-react';

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

const navItems=[
  {label:'Overview',icon:Gauge},{label:'Data Room',icon:Folder},{label:'Investor CRM',icon:Users2},
  {label:'Opportunities',icon:Landmark},{label:'Activity',icon:Clock3}
];

export default function Page(){
  const [query,setQuery]=useState('');
  const [active,setActive]=useState('Overview');
  const filtered=useMemo(()=>sections.filter(s=>`${s.title} ${s.subtitle} ${s.docs.join(' ')}`.toLowerCase().includes(query.toLowerCase())),[query]);
  async function signOut(){await fetch('/api/logout',{method:'POST'});window.location.href='/login'}

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark">S</div><div><b>SARVA</b><span>Investor Intelligence Room</span></div></div>
      <nav>{navItems.map(({label,icon:Icon})=><button key={label} className={active===label?'nav active':'nav'} onClick={()=>setActive(label)}><Icon size={17}/>{label}</button>)}</nav>
      <div className="sideFoot"><div className="secure"><ShieldCheck size={16}/><div><b>Private workspace</b><span>Authorized users only</span></div></div><button className="nav" onClick={signOut}><LogOut size={17}/>Sign out</button></div>
    </aside>

    <section className="content">
      <header className="topbar"><div><span className="eyebrow">SARVA / PRIVATE</span><h1>{active}</h1></div><div className="topActions"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search documents, metrics, people…"/></div><button className="drive" onClick={()=>setActive('Data Room')}><span className="driveDot"/>Google Drive <ChevronRight size={15}/></button></div></header>

      <section className="hero"><div className="heroGlow"/><div className="heroCopy"><span className="pill"><Sparkles size={14}/> Investor-ready workspace</span><h2>Everything that tells the <em>Sarva story</em>, in one room.</h2><p>A secure diligence workspace for company materials, traction, product, financials, legal documents and fundraising intelligence.</p><div className="heroButtons"><button className="primary" onClick={()=>setActive('Data Room')}>Open data room <ArrowUpRight size={16}/></button><button className="secondary"><Video size={16}/> Watch product demo</button></div></div><div className="healthCard"><div className="healthTop"><span>DATA ROOM HEALTH</span><b>92%</b></div><div className="progress"><i/></div><div className="healthRows"><span><CheckCircle2/> Core diligence ready</span><span><CheckCircle2/> Drive structure mapped</span><span className="warn"><Clock3/> 3 files need refresh</span></div><div className="healthMeta"><span><b>83</b> files</span><span><b>11</b> sections</span><span><b>4</b> videos</span></div></div></section>

      <section className="metrics"><article><span>PRODUCT CATALOGUE</span><b>15K+</b><small>catalogued products</small></article><article><span>VENDOR CONVERSION</span><b>9/9</b><small>stores engaged → joined</small></article><article><span>CORE MARKET</span><b>PA</b><small>initial operating region</small></article><article><span>ACCESS</span><b>Private</b><small>Dipseka + approved advisors</small></article></section>

      <div className="sectionHead"><div><span className="eyebrow">DILIGENCE LIBRARY</span><h3>Data room</h3></div><button className="textBtn" onClick={()=>setActive('Data Room')}>View all files <ArrowUpRight size={15}/></button></div>
      <section className="folderGrid">{filtered.map((s)=>{const Icon=s.icon;return <article className="folderCard" key={s.id}><div className="folderTop"><div className="folderIcon"><Icon size={19}/></div><span>{s.id}</span></div><h4>{s.title}</h4><p>{s.subtitle}</p><div className="docPreview">{s.docs.slice(0,3).map(d=><span key={d}><FileText size={13}/>{d}</span>)}</div><div className="folderBottom"><span>{s.docs.length} items</span><button aria-label={`Open ${s.title}`} onClick={()=>setActive('Data Room')}><ArrowUpRight size={16}/></button></div></article>})}</section>

      <section className="lowerGrid"><div className="panel"><div className="panelTitle"><div><span className="eyebrow">LATEST</span><h3>Recent documents</h3></div><button className="textBtn">See activity</button></div><div className="recentList">{recent.map(([a,b,c],i)=><div className="recentRow" key={a}><div className={`fileIcon f${i}`}><FileText size={17}/></div><div className="fileName"><b>{a}</b><span>{b}</span></div><span className="fileDate">{c}</span><ExternalLink size={15}/></div>)}</div></div><div className="panel intelligence"><span className="eyebrow">FUNDRAISING INTELLIGENCE</span><h3>Investor pipeline</h3><div className="pipeline"><div><b>43</b><span>identified</span></div><div><b>16</b><span>high-fit</span></div><div><b>7</b><span>active</span></div><div><b>3</b><span>meetings</span></div></div><div className="pipelineBar"><i/><i/><i/><i/></div><button className="secondary wide" onClick={()=>setActive('Investor CRM')}><Users2 size={16}/> Open investor CRM <ArrowUpRight size={15}/></button></div></section>

      <footer><div><LockKeyhole size={14}/> Confidential · Sarva internal & approved advisors only</div><span>Powered by Sarva · Drive-connected architecture</span></footer>
    </section>
  </main>
}
