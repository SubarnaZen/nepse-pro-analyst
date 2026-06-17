import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, ChevronLeft, Zap, BarChart2, ChevronDown } from 'lucide-react';

// ─── ALL 227 NEPSE equity symbols from Merolagani ────────────────────────────
const ALL_TICKERS = ["ADBL","CBL","CTBNL","CZBIL","EBL","GBIME","GRAND","HBL","JBNL","KBL","KIST","LBL","LUBL","MBL","MEGA","NABIL","NBB","NBL","NCCB","NIB","NICA","NMB","PCBL","SANIMA","SBI","SBL","SCB","SRBL","CFCL","CFL","CIT","CMB","CMBSL","EFL","FFCL","GFCL","GFL","GMFIL","HAMA","HFL","ICFC","IFIL","ILFC","JEFL","JFL","KAFIL","KFL","LFC","LFLC","MFIL","MFL","MPFL","NABB","NBSL","NCM","NDFL","NEFL","NFS","NHMF","NNFC","NSM","OFL","PFC","PFCL","PFCLL","PFIL","PFL","PFLBS","PRFL","PROFL","RIBSL","SETI","SFC","SFFIL","SFL","SIFC","SLFL","SMBF","SYFL","UFCL","UFIL","UFL","ZFL","OHL","SHL","TRH","YHL","AVU","BNL","BNT","BSL","BSM","FHL","GRU","HBT","HDL","JSM","NBBU","NKU","NLO","NVG","RJM","SBPP","SRS","UNL","NFD","NTC","AHPC","BPCL","CHCL","NHPC","SHPC","BBC","NTL","NWC","STC","AIC","ALICL","EIC","GLICL","HGI","LGIL","LICN","NBIL","NICL","NIL","NLG","NLIC","NLICL","PIC","PICL","PLIC","RBS","SIC","SICL","SIL","SLICL","UIC","ALDBL","APEX","ARDBL","AXIS","BBBL","BBBLN","BGDBL","BHBL","BLDBL","BRTBL","BSBL","BUDBL","CBBL","CDBL","CEDBL","CIVIC","CNDBL","CORBL","CSDBL","DDBL","EDBL","FMDBL","GABL","GBBL","GDBL","GDBNL","GSDBL","HAMRO","HBDL","IDBL","INDB","INDBL","JBBL","JHBL","KADBL","KBBL","KDBL","KEBL","KHDBL","KKBL","KMCDB","KNBL","KRBL","MBBL","MDB","MDBL","METRO","MGBL","MIDBL","MNBBL","MSBBL","MTBL","NABBC","NCDB","NCDBL","NDB","NDEP","NGBL","NIDC","NLBBL","NNLB","NUBL","PADBL","PBSL","PDB","PDBL","PGBBL","PGBL","PRBBL","PRDBL","PURBL","RDBL","RMDC","SADBL","SBBLJ","SDBL","SEWA","SHINE","SINDU","SKBBL","SLBBL","SMFDB","SUBBL","SUPRME","SWBBL","TBBL","VBBL","WDBL","YETI"];

const fmt  = (n) => n != null ? Number(n).toFixed(2) : '—';
const fmtK = (n) => n > 1e6 ? (n/1e6).toFixed(1)+'M' : n > 1e3 ? (n/1e3).toFixed(0)+'K' : String(Math.round(n||0));

// ─── Fetch real data from Merolagani ─────────────────────────────────────────
async function fetchMerolagani(sym) {
  try {
    const res = await fetch(
      `https://merolagani.com/handlers/webrequesthandler.ashx?type=get_company_graph&symbol=${sym}&dateRange=1`,
      { mode: 'cors' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.quotes || data.quotes.length < 20) return null;
    return data.quotes.map(q => ({ date: q.date, open: q.open, high: q.high, low: q.low, close: q.close, volume: q.volume || 0 }));
  } catch { return null; }
}

// ─── Indicators ───────────────────────────────────────────────────────────────
const calcSMA = (a,p) => a.map((_,i) => i<p-1?null:a.slice(i-p+1,i+1).reduce((s,v)=>s+v,0)/p);
function calcEMA(a,p){const k=2/(p+1);let e=null;const o=[];for(let i=0;i<a.length;i++){if(e===null){if(i<p-1){o.push(null);continue;}e=a.slice(0,p).reduce((s,v)=>s+v,0)/p;}else e=a[i]*k+e*(1-k);o.push(e);}return o;}
function calcRSI(c,p=14){if(c.length<p+1)return c.map(()=>null);const o=Array(p).fill(null);let g=0,l=0;for(let i=1;i<=p;i++){const d=c[i]-c[i-1];d>=0?g+=d:l-=d;}let ag=g/p,al=l/p;o.push(100-100/(1+(al===0?Infinity:ag/al)));for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(p-1)+Math.max(d,0))/p;al=(al*(p-1)+Math.max(-d,0))/p;o.push(100-100/(1+(al===0?Infinity:ag/al)));}return o;}
function calcMACD(c){const e12=calcEMA(c,12),e26=calcEMA(c,26);const ml=e12.map((v,i)=>v!=null&&e26[i]!=null?v-e26[i]:null);const vl=ml.filter(v=>v!=null);const sg=[...Array(ml.length-vl.length).fill(null),...calcEMA(vl,9)];return{ml,sg,hist:ml.map((v,i)=>v!=null&&sg[i]!=null?v-sg[i]:null)};}
function calcATR(h,l,c,p=14){const t=[null];for(let i=1;i<c.length;i++)t.push(Math.max(h[i]-l[i],Math.abs(h[i]-c[i-1]),Math.abs(l[i]-c[i-1])));return[null,...calcSMA(t.slice(1),p)];}
function calcBB(c,p=20,sd=2){return calcSMA(c,p).map((m,i)=>{if(m==null)return{u:null,m:null,l:null};const v=c.slice(i-p+1,i+1).reduce((s,x)=>s+Math.pow(x-m,2),0)/p;const d=Math.sqrt(v)*sd;return{u:m+d,m,l:m-d};});}

// ─── Signal engine ────────────────────────────────────────────────────────────
function analyze(candles, sym) {
  if (!candles || candles.length < 30) return null;
  const C=candles.map(c=>c.close),H=candles.map(c=>c.high),L=candles.map(c=>c.low),V=candles.map(c=>c.volume||0);
  const n=candles.length-1;
  const rsi=calcRSI(C),ema10=calcEMA(C,10),ema20=calcEMA(C,20),ema50=calcEMA(C,50);
  const {ml,sg,hist}=calcMACD(C),bb=calcBB(C),atr=calcATR(H,L,C);
  const price=C[n],prevClose=C[n-1],rsiV=rsi[n],e10=ema10[n],e20=ema20[n],e50=ema50[n];
  const macd=ml[n],msig=sg[n],mhist=hist[n],mhistP=hist[n-1],bbV=bb[n];
  const atrV=atr[n]||price*0.02;
  const avgVol=V.slice(-20).reduce((a,b)=>a+b,0)/20,lastVol=V[n];
  const resistance=Math.max(...H.slice(n-15,n)),support=Math.min(...L.slice(n-15,n));
  const change=prevClose?((price-prevClose)/prevClose*100):0;

  let score=0,reasons=[];
  if(e20&&e50){if(price>e20&&e20>e50){score+=2;reasons.push('Price > EMA20 > EMA50 — Bullish structure');}else if(price<e20&&e20<e50){score-=2;reasons.push('Price < EMA20 < EMA50 — Bearish structure');}else if(price>e50){score+=1;reasons.push('Price above EMA50');}else{score-=1;reasons.push('Price below EMA50');}}
  if(rsiV!=null){if(rsiV<32){score+=2;reasons.push(`RSI ${fmt(rsiV)} — Oversold`);}else if(rsiV>70){score-=2;reasons.push(`RSI ${fmt(rsiV)} — Overbought`);}else if(rsiV>55){score+=1;reasons.push(`RSI ${fmt(rsiV)} — Bullish momentum`);}else if(rsiV<45){score-=1;reasons.push(`RSI ${fmt(rsiV)} — Bearish momentum`);}else reasons.push(`RSI ${fmt(rsiV)} — Neutral`);}
  if(macd!=null&&msig!=null){if(macd>msig&&mhist>0&&mhistP!=null&&mhist>mhistP){score+=2;reasons.push('MACD bullish crossover + strengthening');}else if(macd>msig){score+=1;reasons.push('MACD above signal');}else if(macd<msig&&mhist<0&&mhistP!=null&&mhist<mhistP){score-=2;reasons.push('MACD bearish crossover + weakening');}else{score-=1;reasons.push('MACD below signal');}}
  if(bbV.l!=null){if(price<=bbV.l){score+=2;reasons.push('Price at lower BB — oversold');}else if(price>=bbV.u){score-=2;reasons.push('Price at upper BB — overbought');}else if(price>bbV.m){score+=1;reasons.push('Price above BB midline');}else{score-=1;reasons.push('Price below BB midline');}}
  if(lastVol>avgVol*1.5){score+=(score>0?1:-1);reasons.push('High volume confirms move');}
  if(((price-support)/price)*100<2.5){score+=1;reasons.push(`Near support Rs ${fmt(support)}`);}
  if(((resistance-price)/price)*100<2.5){score-=1;reasons.push(`Near resistance Rs ${fmt(resistance)}`);}

  let action,color;
  if(score>=3){action='BUY';color='#1a7a4a';}else if(score<=-3){action='SELL';color='#c0392b';}else{action='HOLD';color='#e67e22';}

  let marketStage='Consolidation';
  if(e20&&e50){if(price>e10&&e10>e20&&e20>e50)marketStage='Mark-Up (Uptrend)';else if(price<e10&&e10<e20&&e20<e50)marketStage='Mark-Down (Downtrend)';else if(price>e50&&e20>e50)marketStage='Re-Accumulation';else if(price<e50&&e20<e50)marketStage='Re-Distribution';else if(rsiV&&rsiV<35&&price<e50)marketStage='Accumulation';else if(rsiV&&rsiV>65&&price>e50)marketStage='Distribution';}

  const demandLow=support-atrV*0.3,demandHigh=support+atrV*0.5;
  const supplyLow=resistance-atrV*0.5,supplyHigh=resistance+atrV*0.3;
  const buyZoneLow=Math.max(demandLow,price-atrV*1.2),buyZoneHigh=Math.min(demandHigh,price+atrV*0.3);
  const stopLoss=action==='SELL'?price+atrV*1.5:support-atrV*0.5;
  const target1=action==='SELL'?price-atrV*2:resistance;
  const target2=action==='SELL'?price-atrV*3.5:resistance+atrV*2;
  const rr=Math.abs(target1-price)/Math.abs(stopLoss-price);

  return {sym,action,color,score,reasons,price,change,rsiV,e10,e20,e50,atrV,marketStage,support,resistance,
    demandZone:[demandLow,demandHigh],supplyZone:[supplyLow,supplyHigh],buyingZone:[buyZoneLow,buyZoneHigh],
    stopLoss,target1,target2,rr,bbU:bbV.u,bbL:bbV.l,candles,avgVol,lastVol};
}

// ─── SVG Candlestick Chart ────────────────────────────────────────────────────
function CandleChart({sig}){
  if(!sig?.candles)return null;
  const{candles,stopLoss,target1,target2,buyingZone}=sig;
  const W=820,H=300,P={t:14,r:72,b:32,l:56};
  const disp=candles.slice(-60),closes=candles.map(c=>c.close);
  const ema20f=calcEMA(closes,20),ema50f=calcEMA(closes,50),bbF=calcBB(closes);
  const start=candles.length-disp.length;
  const hs=disp.map(c=>c.high),ls=disp.map(c=>c.low);
  let mn=Math.min(...ls)*0.997,mx=Math.max(...hs)*1.003;
  const cw=W-P.l-P.r,ch=H-P.t-P.b;
  const xS=i=>P.l+(i/(disp.length-1))*cw,yS=p=>P.t+ch-((p-mn)/(mx-mn))*ch;
  const bw=Math.max(2,Math.floor(cw/disp.length)-2);
  const lp=(v,f)=>v.slice(f).map((x,i)=>x!=null?`${xS(i)},${yS(x)}`:null).filter(Boolean).join(' ');
  const bbUp=bbF.slice(start).map((b,i)=>b.u!=null?`${xS(i)},${yS(b.u)}`:null).filter(Boolean).join(' ');
  const bbLo=bbF.slice(start).map((b,i)=>b.l!=null?`${xS(i)},${yS(b.l)}`:null).filter(Boolean).join(' ');
  const gL=Array.from({length:6},(_,i)=>({y:yS(mn+(mx-mn)*i/5),p:mn+(mx-mn)*i/5}));
  const sL=[{p:stopLoss,c:'#e74c3c',lb:`SL ${fmt(stopLoss)}`,d:'6,3'},{p:target1,c:'#27ae60',lb:`T1 ${fmt(target1)}`,d:'4,2'},{p:target2,c:'#1abc9c',lb:`T2 ${fmt(target2)}`,d:'2,2'},{p:buyingZone[0],c:'#f39c12',lb:`BZ ${fmt(buyingZone[0])}`,d:'3,3'}].filter(x=>x.p!=null&&x.p>mn&&x.p<mx);
  const step=Math.max(1,Math.floor(disp.length/7)),dL=disp.map((c,i)=>({i,d:c.date})).filter((_,i)=>i%step===0);
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'auto',display:'block'}}>
      <rect width={W} height={H} fill="#0f172a"/><rect x={P.l} y={P.t} width={cw} height={ch} fill="#0c1428" rx="2"/>
      {gL.map(({y,p})=><g key={p}><line x1={P.l} y1={y} x2={P.l+cw} y2={y} stroke="#1e293b" strokeWidth="1"/><text x={P.l-4} y={y+4} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">{p.toFixed(0)}</text></g>)}
      {bbUp&&bbLo&&<polygon points={`${bbUp} ${bbLo.split(' ').reverse().join(' ')}`} fill="rgba(245,166,35,0.05)"/>}
      {bbUp&&<polyline points={bbUp} fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5"/>}
      {bbLo&&<polyline points={bbLo} fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5"/>}
      {buyingZone[0]>mn&&buyingZone[1]<mx&&<rect x={P.l} y={yS(buyingZone[1])} width={cw} height={Math.max(1,yS(buyingZone[0])-yS(buyingZone[1]))} fill="rgba(39,174,96,0.07)"/>}
      <polyline points={lp(ema20f,start)} fill="none" stroke="#3b82f6" strokeWidth="1.3" opacity="0.85"/>
      <polyline points={lp(ema50f,start)} fill="none" stroke="#a855f7" strokeWidth="1.3" opacity="0.85"/>
      {disp.map((c,i)=>{const x=xS(i),isUp=c.close>=c.open,col=isUp?'#27ae60':'#e74c3c',bT=yS(Math.max(c.open,c.close)),bB=yS(Math.min(c.open,c.close));return(<g key={i}><line x1={x} y1={yS(c.high)} x2={x} y2={yS(c.low)} stroke={col} strokeWidth="1"/><rect x={x-bw/2} y={bT} width={bw} height={Math.max(1,bB-bT)} fill={col} opacity="0.88"/></g>);})}
      {sL.map(({p,c,lb,d})=>{const y=yS(p);return(<g key={lb}><line x1={P.l} y1={y} x2={P.l+cw} y2={y} stroke={c} strokeWidth="1.2" strokeDasharray={d} opacity="0.9"/><rect x={P.l+cw+2} y={y-8} width={58} height={14} fill="#0f172a"/><text x={P.l+cw+4} y={y+3} fill={c} fontSize="8.5" fontFamily="monospace">{lb}</text></g>);})}
      {dL.map(({i,d})=><text key={i} x={xS(i)} y={H-4} textAnchor="middle" fill="#64748b" fontSize="8.5" fontFamily="monospace">{d}</text>)}
      <rect x={P.l+6} y={P.t+5} width={175} height={28} fill="rgba(15,23,42,0.9)" rx="2"/>
      <line x1={P.l+13} y1={P.t+16} x2={P.l+23} y2={P.t+16} stroke="#3b82f6" strokeWidth="1.5"/><text x={P.l+27} y={P.t+20} fill="#3b82f6" fontSize="9" fontFamily="monospace">EMA20</text>
      <line x1={P.l+75} y1={P.t+16} x2={P.l+85} y2={P.t+16} stroke="#a855f7" strokeWidth="1.5"/><text x={P.l+89} y={P.t+20} fill="#a855f7" fontSize="9" fontFamily="monospace">EMA50</text>
      <rect x={P.l+135} y={P.t+10} width={9} height={7} fill="rgba(39,174,96,0.2)" stroke="#27ae60" strokeWidth="0.5"/><text x={P.l+148} y={P.t+20} fill="#27ae60" fontSize="9" fontFamily="monospace">BZ</text>
    </svg>
  );
}
function VolChart({sig}){
  if(!sig?.candles)return null;
  const W=820,H=50,P={t:4,r:72,b:10,l:56};
  const d=sig.candles.slice(-60),mx=Math.max(...d.map(c=>c.volume||1));
  const cw=W-P.l-P.r,ch=H-P.t-P.b,bw=Math.max(1,Math.floor(cw/d.length)-1);
  return(<svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'auto',display:'block',marginTop:'-1px'}}>
    <rect width={W} height={H} fill="#0f172a"/>
    {d.map((c,i)=>{const x=P.l+(i/(d.length-1))*cw,bH=(c.volume/mx)*ch;return<rect key={i} x={x-bw/2} y={P.t+ch-bH} width={bw} height={bH} fill={c.close>=c.open?'rgba(39,174,96,0.45)':'rgba(231,76,60,0.45)'}/>;})}</svg>);
}

// ─── Strategy right panel ─────────────────────────────────────────────────────
function SR({label,value,vc,bold}){
  return(<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:'1px solid #e2e8f0'}}>
    <span style={{fontSize:'0.73rem',color:'#64748b'}}>{label}</span>
    <span style={{fontFamily:'monospace',fontSize:'0.76rem',color:vc||'#1e293b',fontWeight:bold?700:600}}>{value}</span>
  </div>);
}
function StratPanel({sig}){
  const{action,price,stopLoss,target1,target2,buyingZone,demandZone,supplyZone,rr,marketStage,rsiV,score,lastVol,avgVol}=sig;
  const isB=action==='BUY',isS=action==='SELL';
  const hdrBg=isB?'#1a7a4a':isS?'#c0392b':'#e67e22';
  const strat=isB?'WAIT AND BUY':isS?'WAIT AND SELL':'WAIT AND WATCH';
  const sc=marketStage.includes('Up')||marketStage.includes('Acc')?'#166534':marketStage.includes('Down')||marketStage.includes('Dist')?'#991b1b':'#92400e';
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'8px',minWidth:'230px'}}>
      {/* Strategy box */}
      <div style={{border:'1px solid #cbd5e1',borderRadius:'4px',overflow:'hidden',background:'#fff'}}>
        <div style={{background:hdrBg,padding:'10px 12px',textAlign:'center'}}>
          <div style={{fontSize:'0.65rem',fontWeight:700,color:'#fff',letterSpacing:'0.1em',opacity:0.85}}>CURRENT STRATEGY</div>
          <div style={{fontSize:'1.1rem',fontWeight:800,color:'#fff',letterSpacing:'0.03em'}}>{strat}</div>
          <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.7)',fontWeight:600}}>({action})</div>
        </div>
        <div style={{padding:'8px 12px',display:'flex',flexDirection:'column'}}>
          <SR label="Current Market Stage" value={marketStage} vc={sc}/>
          {isB&&<><SR label="Immediate Demand Zone" value={`${fmt(demandZone[0])} – ${fmt(demandZone[1])}`} vc="#166534"/><SR label="Immediate Supply Zone" value={`${fmt(supplyZone[0])} – ${fmt(supplyZone[1])}`} vc="#991b1b"/></>}
          {isS&&<><SR label="Immediate Supply Zone" value={`${fmt(supplyZone[0])} – ${fmt(supplyZone[1])}`} vc="#991b1b"/><SR label="Immediate Demand Zone" value={`${fmt(demandZone[0])} – ${fmt(demandZone[1])}`} vc="#166534"/></>}
          {!isB&&!isS&&<><SR label="Demand Zone" value={`${fmt(demandZone[0])} – ${fmt(demandZone[1])}`} vc="#166534"/><SR label="Supply Zone" value={`${fmt(supplyZone[0])} – ${fmt(supplyZone[1])}`} vc="#991b1b"/></>}
          <div style={{marginTop:'4px',paddingTop:'4px',borderTop:'2px solid #e2e8f0'}}>
            <SR label="Stop Loss Only If Closing Below" value={`${fmt(stopLoss)}`} vc="#c0392b" bold/>
          </div>
          {isB&&<SR label="Buying Zone" value={`${fmt(buyingZone[0])} – ${fmt(buyingZone[1])}`} vc="#166534"/>}
          <div style={{marginTop:'4px',paddingTop:'4px',borderTop:'1px solid #e2e8f0'}}>
            <SR label="Target 1" value={`Rs ${fmt(target1)}`} vc="#166534"/>
            <SR label="Target 2" value={`Rs ${fmt(target2)}`} vc="#0d9488"/>
            <SR label="Risk : Reward" value={rr?`1 : ${rr.toFixed(2)}`:'—'} vc="#92400e"/>
          </div>
        </div>
      </div>
      {/* BUY / SELL / HOLD buttons */}
      <div style={{display:'flex',borderRadius:'4px',overflow:'hidden',border:'1px solid #cbd5e1'}}>
        {[['BUY','#1a7a4a'],['SELL','#c0392b'],['HOLD','#e67e22']].map(([a,c])=>(
          <div key={a} style={{flex:1,padding:'8px 0',textAlign:'center',background:action===a?c:'#f8fafc',color:action===a?'#fff':c,fontWeight:700,fontSize:'0.82rem',borderRight:'1px solid #cbd5e1'}}>{a}</div>
        ))}
      </div>
      {/* Indicators */}
      <div style={{background:'#fff',border:'1px solid #cbd5e1',borderRadius:'4px',padding:'8px 12px'}}>
        <div style={{fontSize:'0.65rem',color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>Indicators</div>
        <SR label="RSI (14)" value={fmt(rsiV)} vc={rsiV<35?'#166534':rsiV>65?'#991b1b':'#92400e'}/>
        <SR label="Volume" value={fmtK(lastVol)} vc={lastVol>avgVol*1.3?'#166534':'#64748b'}/>
        <SR label="Signal Score" value={`${score>0?'+':''}${score}`} vc={isB?'#166534':isS?'#991b1b':'#92400e'}/>
      </div>
    </div>
  );
}

// ─── Detail view with chart + strategy panel ──────────────────────────────────
function DetailView({sig,onBack}){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'12px',background:'#f1f5f9',minHeight:'100%',padding:'4px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
        <button onClick={onBack} style={{display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',background:'#fff',border:'1px solid #cbd5e1',borderRadius:'4px',color:'#475569',fontSize:'0.8rem',cursor:'pointer'}}>
          <ChevronLeft size={13}/> Back to list
        </button>
        <div style={{fontFamily:'monospace',fontWeight:700,fontSize:'1rem',color:'#1e293b'}}>{sig.sym}</div>
        <div style={{fontSize:'0.72rem',color:'#94a3b8'}}>Live data · Merolagani · {sig.candles.length} days</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'12px',alignItems:'start'}}>
        {/* Chart */}
        <div style={{background:'#0f172a',borderRadius:'6px',overflow:'hidden',border:'1px solid #1e293b'}}>
          <div style={{padding:'7px 12px',borderBottom:'1px solid #1e293b',fontSize:'0.72rem',color:'#64748b',fontFamily:'monospace'}}>
            {sig.sym} · Daily · EMA20 · EMA50 · Bollinger Bands
          </div>
          <CandleChart sig={sig}/>
          <VolChart sig={sig}/>
        </div>
        {/* Strategy panel */}
        <StratPanel sig={sig}/>
      </div>
      {/* Rationale */}
      <div style={{background:'#fff',border:'1px solid #cbd5e1',borderRadius:'4px',padding:'10px 14px'}}>
        <div style={{fontSize:'0.67rem',color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>Signal Rationale</div>
        {sig.reasons.map((r,i)=>(
          <div key={i} style={{display:'flex',gap:'7px',fontSize:'0.78rem',color:'#334155',padding:'3px 0',borderBottom:'1px solid #f1f5f9'}}>
            <span style={{color:sig.color,flexShrink:0}}>▸</span>{r}
          </div>
        ))}
      </div>
      <div style={{fontSize:'0.67rem',color:'#94a3b8'}}>⚠ For educational purposes only. Not financial advice.</div>
    </div>
  );
}

// ─── Main ZenChart ────────────────────────────────────────────────────────────
export default function ZenChart() {
  const [tab,setTab]=useState('BUY');
  const [results,setResults]=useState({BUY:[],SELL:[],HOLD:[]});
  const [scanning,setScanning]=useState(false);
  const [prog,setProg]=useState({done:0,total:0,sym:''});
  const [detail,setDetail]=useState(null);
  const [meta,setMeta]=useState(null);

  const runScan=useCallback(async()=>{
    setScanning(true); setDetail(null);
    setResults({BUY:[],SELL:[],HOLD:[]}); setMeta(null);
    setProg({done:0,total:ALL_TICKERS.length,sym:''});
    const out={BUY:[],SELL:[],HOLD:[]};
    let failed=0;
    for(let i=0;i<ALL_TICKERS.length;i+=5){
      const batch=ALL_TICKERS.slice(i,i+5);
      setProg({done:i,total:ALL_TICKERS.length,sym:batch[0]});
      const fetched=await Promise.all(batch.map(sym=>fetchMerolagani(sym).then(c=>({sym,c}))));
      for(const{sym,c}of fetched){
        if(!c){failed++;continue;}
        const sig=analyze(c,sym);
        if(sig)out[sig.action].push(sig);
      }
      setResults({BUY:[...out.BUY].sort((a,b)=>b.score-a.score),SELL:[...out.SELL].sort((a,b)=>a.score-b.score),HOLD:[...out.HOLD].sort((a,b)=>Math.abs(b.score)-Math.abs(a.score))});
      await new Promise(r=>setTimeout(r,180));
    }
    setProg(p=>({...p,done:ALL_TICKERS.length}));
    setScanning(false);
    setMeta({time:new Date().toLocaleTimeString(),failed});
  },[]);

  useEffect(()=>{runScan();},[runScan]);

  const pct=prog.total?Math.round(prog.done/prog.total*100):0;

  if(detail) return <div className="workspace" style={{background:'#f1f5f9'}}><DetailView sig={detail} onBack={()=>setDetail(null)}/></div>;

  const tabColors={BUY:'#1a7a4a',SELL:'#c0392b',HOLD:'#e67e22'};
  const tabIcons={BUY:<TrendingUp size={13}/>,SELL:<TrendingDown size={13}/>,HOLD:<Minus size={13}/>};
  const list=results[tab];

  return(
    <div className="workspace" style={{gap:'0',padding:'0'}}>
      {/* Header bar */}
      <div style={{background:'#1e293b',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <Zap size={18} color="#f59e0b"/>
          <span style={{color:'#fff',fontWeight:700,fontSize:'1rem'}}>Zen<span style={{color:'#f59e0b'}}>Chart</span></span>
          <span style={{fontSize:'0.65rem',color:'#64748b',fontFamily:'monospace'}}>LIVE · {ALL_TICKERS.length} NEPSE STOCKS</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          {meta&&!scanning&&<span style={{fontSize:'0.68rem',color:'#64748b',fontFamily:'monospace'}}>{meta.time}{meta.failed>0?` · ${meta.failed} no-data`:''}</span>}
          <button onClick={runScan} disabled={scanning}
            style={{display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',background:scanning?'#334155':'#f59e0b',border:'none',borderRadius:'4px',color:scanning?'#64748b':'#1e293b',fontSize:'0.78rem',fontWeight:700,cursor:scanning?'default':'pointer'}}>
            <RefreshCw size={12} style={scanning?{animation:'spin 1s linear infinite'}:{}}/>{scanning?`${pct}%`:'Re-Scan'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {scanning&&(
        <div style={{background:'#0f172a',padding:'0'}}>
          <div style={{height:'3px',background:'#1e293b'}}><div style={{height:'100%',background:'#f59e0b',width:`${pct}%`,transition:'width 0.3s'}}/></div>
          <div style={{padding:'6px 16px',fontSize:'0.68rem',color:'#64748b',fontFamily:'monospace',display:'flex',justifyContent:'space-between'}}>
            <span>Scanning <span style={{color:'#f59e0b'}}>{prog.sym}</span>…</span>
            <span>BUY {results.BUY.length} · SELL {results.SELL.length} · HOLD {results.HOLD.length}</span>
          </div>
        </div>
      )}

      {/* Tabs — exact Merolagani style */}
      <div style={{display:'flex',borderBottom:'2px solid #e2e8f0',background:'#fff'}}>
        {['BUY','SELL','HOLD'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1, padding:'10px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
            background:tab===t?tabColors[t]:'#fff',
            color:tab===t?'#fff':tabColors[t],
            fontWeight:700, fontSize:'0.9rem', border:'none',
            borderRight:'1px solid #e2e8f0', cursor:'pointer',
            transition:'all 0.15s'
          }}>
            {tabIcons[t]}{t}
            <span style={{background:tab===t?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.07)',borderRadius:'99px',padding:'0 7px',fontSize:'0.72rem'}}>{results[t].length}</span>
          </button>
        ))}
      </div>

      {/* Table — exactly like Merolagani */}
      <div style={{background:'#fff',flex:1}}>
        {/* Table header */}
        <div style={{display:'grid',gridTemplateColumns:'40px 1fr 90px 80px 80px',padding:'7px 12px',background:'#f8fafc',borderBottom:'1px solid #e2e8f0'}}>
          {['S.N','Stock','LTP','Change','Score'].map(h=>(
            <div key={h} style={{fontSize:'0.72rem',fontWeight:700,color:'#64748b',textAlign:h==='S.N'?'center':'left'}}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {list.length===0?(
          <div style={{textAlign:'center',padding:'40px 0',color:'#94a3b8'}}>
            <BarChart2 size={28} style={{marginBottom:'8px',opacity:0.3,display:'block',margin:'0 auto 8px'}}/>
            {scanning?'Scanning…':`No ${tab} signals yet.`}
          </div>
        ):(
          list.map((sig,idx)=>{
            const isUp=sig.change>=0;
            const rowBg=tab==='BUY'?(idx%2===0?'#f0fdf4':'#dcfce7'):tab==='SELL'?(idx%2===0?'#fef2f2':'#fee2e2'):(idx%2===0?'#fffbeb':'#fef3c7');
            return(
              <div key={sig.sym} onClick={()=>setDetail(sig)}
                style={{display:'grid',gridTemplateColumns:'40px 1fr 90px 80px 80px',padding:'8px 12px',background:rowBg,borderBottom:'1px solid rgba(0,0,0,0.04)',cursor:'pointer',transition:'filter 0.1s'}}
                onMouseOver={e=>e.currentTarget.style.filter='brightness(0.95)'}
                onMouseOut={e=>e.currentTarget.style.filter='brightness(1)'}>
                <div style={{textAlign:'center',fontSize:'0.78rem',color:'#64748b',fontWeight:600}}>{idx+1}</div>
                <div style={{fontWeight:700,fontSize:'0.82rem',color:'#1e293b',fontFamily:'monospace'}}>{sig.sym}</div>
                <div style={{fontFamily:'monospace',fontSize:'0.82rem',color:'#1e293b',fontWeight:600}}>{fmt(sig.price)}</div>
                <div style={{fontFamily:'monospace',fontSize:'0.78rem',color:isUp?'#166534':'#991b1b',fontWeight:600}}>{isUp?'+':''}{fmt(sig.change)}%</div>
                <div style={{fontFamily:'monospace',fontSize:'0.78rem',color:sig.score>=3?'#166534':sig.score<=-3?'#991b1b':'#92400e',fontWeight:700}}>{sig.score>0?'+':''}{sig.score}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer note */}
      {!scanning&&list.length>0&&(
        <div style={{background:'#f8fafc',borderTop:'1px solid #e2e8f0',padding:'6px 12px',fontSize:'0.67rem',color:'#94a3b8',display:'flex',justifyContent:'space-between'}}>
          <span>Click any row for chart & strategy details</span>
          <span>Data: Merolagani · Signals: EMA, RSI, MACD, BB, ATR</span>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
