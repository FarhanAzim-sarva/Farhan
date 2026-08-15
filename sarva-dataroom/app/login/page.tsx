'use client';

import { FormEvent, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import './login.css';

export default function LoginPage(){
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setLoading(true);setError('');
    const fd=new FormData(e.currentTarget);
    const res=await fetch('/api/unlock',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:fd.get('email'),code:fd.get('code')})});
    if(res.ok){window.location.href='/';return}
    setError('Access denied. Check the approved email and access code.');setLoading(false);
  }
  return <main className="loginPage"><section className="loginCard">
    <div className="loginMark">S</div><span className="eyebrow">SARVA / CONFIDENTIAL</span>
    <h1>Investor Intelligence Room</h1><p>Private diligence workspace for Sarva leadership and approved advisors.</p>
    <form onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required/></label><label>Access code<input name="code" type="password" autoComplete="current-password" placeholder="••••••••••••" required/></label>{error&&<div className="loginError">{error}</div>}<button className="primary loginBtn" disabled={loading}><LockKeyhole size={15}/>{loading?'Verifying…':'Enter secure room'}</button></form>
    <div className="loginNote"><ShieldCheck size={15}/><span>Access is limited by server-side email allowlist and private access code.</span></div>
  </section></main>
}
