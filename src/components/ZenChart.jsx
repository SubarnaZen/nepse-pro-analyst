import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle,
  Target, ShieldAlert, DollarSign, BarChart2, ChevronDown, Zap
} from 'lucide-react';

// ─── NEPSE ticker list (reuse from SectorPanel) ───────────────────────────────
const ALL_TICKERS = [
  'ADBL','CZBIL','EBL','GBIME','HBL','KBL','MBL','NABIL','NBL','NICA','NIB','NMB','PCBL','PRVU','SBI','SANIMA','SCB','SRBL',
  'CORBL','EDBL','GBBL','GRDBL','HAMRO','JBBL','KSBBL','LBBL','MDB','MNBBL','MSLB','NABBC','NGBL','SADBL','SAPDBL','SHINE','SINDU',
  'CFCL','GFCL','GUFL','ICFC','JFL','MFIL','NFS','PFL','PROFL','RLFL','SFCL','SIFC',
  'CLI','GLI','HLI','ILI','JLI','LIC','MLBSL','NLIC','PLI','PLIC','RNLI','SNLI',
  'AIL','GILB','HGI','IGI','LGIL','MIC','NICL','NIL','NLG','PICL','PIC','PRIN','RBCL','SALICO','SGI','SICL','UAIL',
  'AHPC','AKJCL','API','BARUN','BPCL','CHCL','DHPL','GHL','HDHPC','HURJA','KBSH','KPCL','KRBL','MBJC','MCHL','NHDL','NHPC','NWEDC','PMHPL','RADHI','RIDI','RHPC','RRHPCL','SHEL','SHPC','SHL','SJCL','SSHL','UMHL','UNHPL','UPPER','UPCL',
  'BNL','BNT','BSL','CIT','GCIL','HDL','NKU','NTC','SHIVM','STML','CGH','OMHL','OHL','TRH','YHL',
  'CHDC','HIDCL','NIFRA','NRN','SPDL','STC'
].sort();

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toUnix = (daysAgo) => Math.floor((Date.now() - daysAgo * 86400000) / 1000);
const fmt = (n) => n != null ? Number(n).toFixed(2) : '—';

// ─── Technical indicator math ─────────────────────────────────────────────────
function calcSMA(closes, period) {
  const result = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    const slice = closes.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
}

function calcEMA(closes, period) {
  const k = 2 / (period + 1);
  const result = [];
  let ema = null;
  for (let i = 0; i < closes.length; i++) {
    if (ema === null) {
      if (i < period - 1) { result.push(null); continue; }
      ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
    } else {
      ema = closes[i] * k + ema * (1 - k);
    }
    result.push(ema);
  }
  return result;
}

function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return closes.map(() => null);
  const result = Array(period).fill(null);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  result.push(100 - 100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss)));
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    result.push(100 - 100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss)));
  }
  return result;
}

function calcMACD(closes) {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => (v != null && ema26[i] != null) ? v - ema26[i] : null);
  const validMacd = macdLine.filter(v => v != null);
  const signalRaw = calcEMA(validMacd, 9);
  const signal = Array(macdLine.length - validMacd.length).fill(null).concat(signalRaw);
  const histogram = macdLine.map((v, i) => (v != null && signal[i] != null) ? v - signal[i] : null);
  return { macdLine, signal, histogram };
}

function calcBollingerBands(closes, period = 20, stdDev = 2) {
  const sma = calcSMA(closes, period);
  return sma.map((mid, i) => {
    if (mid == null) return { upper: null, mid: null, lower: null };
    const slice = closes.slice(i - period + 1, i + 1);
    const variance = slice.reduce((s, v) => s + Math.pow(v - mid, 2), 0) / period;
    const sd = Math.sqrt(variance) * stdDev;
    return { upper: mid + sd, mid, lower: mid - sd };
  });
}

function calcATR(highs, lows, closes, period = 14) {
  const trs = [null];
  for (let i = 1; i < closes.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  const atr = calcSMA(trs.slice(1), period);
  return [null, ...atr];
}

// ─── Signal engine ────────────────────────────────────────────────────────────
function generateSignal(candles) {
  if (!candles || candles.length < 30) return null;
  const closes = candles.map(c => c.close);
  const highs  = candles.map(c => c.high);
  const lows   = candles.map(c => c.low);

  const rsi    = calcRSI(closes);
  const ema20  = calcEMA(closes, 20);
  const ema50  = calcEMA(closes, 50);
  const { macdLine, signal: macdSignal, histogram } = calcMACD(closes);
  const bb     = calcBollingerBands(closes);
  const atr    = calcATR(highs, lows, closes);

  const last = candles.length - 1;
  const price   = closes[last];
  const rsiVal  = rsi[last];
  const e20     = ema20[last];
  const e50     = ema50[last];
  const macd    = macdLine[last];
  const sig     = macdSignal[last];
  const hist    = histogram[last];
  const histPrev = histogram[last - 1];
  const bbLast  = bb[last];
  const atrVal  = atr[last];

  // ── support / resistance from recent swing highs & lows ──
  const window = 10;
  const recentHighs = highs.slice(last - window, last);
  const recentLows  = lows.slice(last - window, last);
  const resistance  = Math.max(...recentHighs);
  const support     = Math.min(...recentLows);

  // ── scoring ──
  let score = 0;
  const reasons = [];

  // EMA trend
  if (e20 != null && e50 != null) {
    if (price > e20 && e20 > e50)  { score += 2; reasons.push('Price > EMA20 > EMA50 (Bullish trend)'); }
    else if (price < e20 && e20 < e50) { score -= 2; reasons.push('Price < EMA20 < EMA50 (Bearish trend)'); }
    else if (price > e50) { score += 1; reasons.push('Price above EMA50'); }
    else { score -= 1; reasons.push('Price below EMA50'); }
  }

  // RSI
  if (rsiVal != null) {
    if (rsiVal < 35)        { score += 2; reasons.push(`RSI ${fmt(rsiVal)} — Oversold zone (potential bounce)`); }
    else if (rsiVal > 68)   { score -= 2; reasons.push(`RSI ${fmt(rsiVal)} — Overbought zone (potential pullback)`); }
    else if (rsiVal > 55)   { score += 1; reasons.push(`RSI ${fmt(rsiVal)} — Bullish momentum`); }
    else if (rsiVal < 45)   { score -= 1; reasons.push(`RSI ${fmt(rsiVal)} — Bearish momentum`); }
    else                    { reasons.push(`RSI ${fmt(rsiVal)} — Neutral`); }
  }

  // MACD
  if (macd != null && sig != null) {
    if (macd > sig && hist != null && histPrev != null && hist > histPrev) { score += 2; reasons.push('MACD bullish crossover with strengthening histogram'); }
    else if (macd > sig) { score += 1; reasons.push('MACD above signal line'); }
    else if (macd < sig && hist != null && histPrev != null && hist < histPrev) { score -= 2; reasons.push('MACD bearish crossover with weakening histogram'); }
    else if (macd < sig) { score -= 1; reasons.push('MACD below signal line'); }
  }

  // Bollinger Bands
  if (bbLast.lower != null) {
    if (price <= bbLast.lower) { score += 2; reasons.push('Price at lower Bollinger Band — oversold squeeze'); }
    else if (price >= bbLast.upper) { score -= 2; reasons.push('Price at upper Bollinger Band — overbought'); }
    else if (price > bbLast.mid) { score += 1; reasons.push('Price above BB midline'); }
    else { score -= 1; reasons.push('Price below BB midline'); }
  }

  // Proximity to support/resistance
  const distToSupport    = ((price - support) / price) * 100;
  const distToResistance = ((resistance - price) / price) * 100;
  if (distToSupport < 3)      { score += 1; reasons.push(`Price near strong support at Rs ${fmt(support)}`); }
  if (distToResistance < 3)   { score -= 1; reasons.push(`Price near strong resistance at Rs ${fmt(resistance)}`); }

  // Determine action
  let action, color, Icon;
  if (score >= 3)       { action = 'BUY';  color = '#00D4AA'; Icon = TrendingUp;   }
  else if (score <= -3) { action = 'SELL'; color = '#E53E3E'; Icon = TrendingDown; }
  else                  { action = 'HOLD'; color = '#F5A623'; Icon = Minus;        }

  // Targets & stop loss based on ATR
  const atrMult = atrVal ?? (price * 0.02);
  const stopLoss  = action === 'BUY'  ? price - 1.5 * atrMult
                  : action === 'SELL' ? price + 1.5 * atrMult
                  : price - 1.5 * atrMult;
  const target1   = action === 'BUY'  ? price + 2 * atrMult
                  : action === 'SELL' ? price - 2 * atrMult
                  : null;
  const target2   = action === 'BUY'  ? price + 3.5 * atrMult
                  : action === 'SELL' ? price - 3.5 * atrMult
                  : null;
  const rr        = target1 ? Math.abs(target1 - price) / Math.abs(stopLoss - price) : null;

  return {
    action, color, Icon, score, reasons,
    price, rsiVal, macd, sig, e20, e50, atrVal,
    support, resistance,
    stopLoss, target1, target2, rr,
    bbUpper: bbLast?.upper, bbLower: bbLast?.lower
  };
}

// ─── Candlestick SVG chart ────────────────────────────────────────────────────
function CandlestickChart({ candles, signal }) {
  if (!candles || candles.length === 0) return null;

  const W = 900, H = 340, PAD = { top: 20, right: 60, bottom: 40, left: 60 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const display = candles.slice(-80);
  const allHighs = display.map(c => c.high);
  const allLows  = display.map(c => c.low);
  let minP = Math.min(...allLows) * 0.998;
  let maxP = Math.max(...allHighs) * 1.002;

  // include BB and EMAs in range
  if (signal) {
    if (signal.bbUpper) maxP = Math.max(maxP, signal.bbUpper * 1.001);
    if (signal.bbLower) minP = Math.min(minP, signal.bbLower * 0.999);
  }

  const range = maxP - minP;
  const xScale = (i) => PAD.left + (i / (display.length - 1)) * cw;
  const yScale = (p) => PAD.top + ch - ((p - minP) / range) * ch;

  const candleW = Math.max(2, Math.floor(cw / display.length) - 2);

  // EMA lines for display candles
  const allCloses  = candles.map(c => c.close);
  const ema20full  = calcEMA(allCloses, 20);
  const ema50full  = calcEMA(allCloses, 50);
  const bbFull     = calcBollingerBands(allCloses);
  const start      = candles.length - display.length;

  const linePoints = (vals) =>
    vals.slice(start).map((v, i) => v != null ? `${xScale(i)},${yScale(v)}` : null)
      .filter(Boolean).join(' ');

  const bbUpper  = bbFull.slice(start).map((b, i) => b.upper != null ? `${xScale(i)},${yScale(b.upper)}` : null).filter(Boolean).join(' ');
  const bbLower  = bbFull.slice(start).map((b, i) => b.lower != null ? `${xScale(i)},${yScale(b.lower)}` : null).filter(Boolean).join(' ');
  const bbMid    = bbFull.slice(start).map((b, i) => b.mid   != null ? `${xScale(i)},${yScale(b.mid)}`   : null).filter(Boolean).join(' ');

  // Price grid lines
  const gridCount = 5;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const price = minP + (range * i) / gridCount;
    return { y: yScale(price), price };
  });

  // x-axis dates
  const dateStep = Math.max(1, Math.floor(display.length / 8));
  const dateLabels = display.map((c, i) => ({ i, date: c.date })).filter((_, i) => i % dateStep === 0);

  // Signal lines
  const sigLines = signal ? [
    { price: signal.stopLoss,  color: '#E53E3E', label: `SL ${fmt(signal.stopLoss)}`,   dash: '6,3' },
    { price: signal.target1,   color: '#00D4AA', label: `T1 ${fmt(signal.target1)}`,    dash: '4,2' },
    { price: signal.target2,   color: '#00D4AA', label: `T2 ${fmt(signal.target2)}`,    dash: '2,2' },
  ].filter(l => l.price != null && l.price > minP && l.price < maxP) : [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Background */}
      <rect width={W} height={H} fill="#0A0E1A" />
      <rect x={PAD.left} y={PAD.top} width={cw} height={ch} fill="#0D1120" rx="2" />

      {/* Grid lines */}
      {gridLines.map(({ y, price }) => (
        <g key={price}>
          <line x1={PAD.left} y1={y} x2={PAD.left + cw} y2={y} stroke="#1E293B" strokeWidth="1" />
          <text x={PAD.left - 6} y={y + 4} textAnchor="end" fill="#8892A4" fontSize="10" fontFamily="JetBrains Mono, monospace">
            {price.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Bollinger Bands fill */}
      {bbUpper && bbLower && (
        <polygon
          points={`${bbUpper} ${bbLower.split(' ').reverse().join(' ')}`}
          fill="rgba(245,166,35,0.06)"
        />
      )}
      {bbUpper && <polyline points={bbUpper} fill="none" stroke="#F5A623" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />}
      {bbLower && <polyline points={bbLower} fill="none" stroke="#F5A623" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.6" />}
      {bbMid   && <polyline points={bbMid}   fill="none" stroke="#F5A623" strokeWidth="0.6" strokeDasharray="2,4" opacity="0.4" />}

      {/* EMA lines */}
      <polyline points={linePoints(ema20full)} fill="none" stroke="#00D4AA" strokeWidth="1.2" opacity="0.8" />
      <polyline points={linePoints(ema50full)} fill="none" stroke="#a78bfa" strokeWidth="1.2" opacity="0.8" />

      {/* Candles */}
      {display.map((c, i) => {
        const x   = xScale(i);
        const isUp = c.close >= c.open;
        const col  = isUp ? '#00D4AA' : '#E53E3E';
        const bodyTop  = yScale(Math.max(c.open, c.close));
        const bodyBot  = yScale(Math.min(c.open, c.close));
        const bodyH    = Math.max(1, bodyBot - bodyTop);
        const halfW    = Math.max(1, candleW / 2);
        return (
          <g key={i}>
            <line x1={x} y1={yScale(c.high)} x2={x} y2={yScale(c.low)} stroke={col} strokeWidth="1" />
            <rect x={x - halfW} y={bodyTop} width={candleW} height={bodyH} fill={col} opacity="0.85" />
          </g>
        );
      })}

      {/* Signal horizontal lines */}
      {sigLines.map(({ price: p, color, label, dash }) => {
        const y = yScale(p);
        return (
          <g key={label}>
            <line x1={PAD.left} y1={y} x2={PAD.left + cw} y2={y} stroke={color} strokeWidth="1.2" strokeDasharray={dash} opacity="0.9" />
            <rect x={PAD.left + cw + 2} y={y - 8} width={54} height={14} fill="#0A0E1A" />
            <text x={PAD.left + cw + 4} y={y + 3} fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace">{label}</text>
          </g>
        );
      })}

      {/* Date labels */}
      {dateLabels.map(({ i, date }) => (
        <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle" fill="#8892A4" fontSize="9" fontFamily="JetBrains Mono, monospace">
          {date}
        </text>
      ))}

      {/* Legend */}
      <g>
        <rect x={PAD.left + 8} y={PAD.top + 8} width={190} height={46} fill="rgba(10,14,26,0.85)" rx="3" />
        <line x1={PAD.left + 16} y1={PAD.top + 22} x2={PAD.left + 30} y2={PAD.top + 22} stroke="#00D4AA" strokeWidth="1.5" />
        <text x={PAD.left + 34} y={PAD.top + 26} fill="#00D4AA" fontSize="10" fontFamily="JetBrains Mono, monospace">EMA 20</text>
        <line x1={PAD.left + 86} y1={PAD.top + 22} x2={PAD.left + 100} y2={PAD.top + 22} stroke="#a78bfa" strokeWidth="1.5" />
        <text x={PAD.left + 104} y={PAD.top + 26} fill="#a78bfa" fontSize="10" fontFamily="JetBrains Mono, monospace">EMA 50</text>
        <line x1={PAD.left + 16} y1={PAD.top + 40} x2={PAD.left + 30} y2={PAD.top + 40} stroke="#F5A623" strokeWidth="1" strokeDasharray="3,3" />
        <text x={PAD.left + 34} y={PAD.top + 44} fill="#F5A623" fontSize="10" fontFamily="JetBrains Mono, monospace">Bollinger Bands</text>
      </g>
    </svg>
  );
}

// ─── Volume bar chart ─────────────────────────────────────────────────────────
function VolumeChart({ candles }) {
  if (!candles || candles.length === 0) return null;
  const W = 900, H = 80, PAD = { top: 8, right: 60, bottom: 20, left: 60 };
  const display = candles.slice(-80);
  const maxVol = Math.max(...display.map(c => c.volume || 0));
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;
  const barW = Math.max(1, Math.floor(cw / display.length) - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', marginTop: '-2px' }}>
      <rect width={W} height={H} fill="#0A0E1A" />
      {display.map((c, i) => {
        const x = PAD.left + (i / (display.length - 1)) * cw;
        const barH = maxVol ? (c.volume / maxVol) * ch : 0;
        const isUp = c.close >= c.open;
        return (
          <rect key={i} x={x - barW / 2} y={PAD.top + ch - barH} width={barW} height={barH}
            fill={isUp ? 'rgba(0,212,170,0.45)' : 'rgba(229,62,62,0.45)'} />
        );
      })}
      <text x={PAD.left - 6} y={PAD.top + 10} textAnchor="end" fill="#8892A4" fontSize="9" fontFamily="JetBrains Mono, monospace">VOL</text>
    </svg>
  );
}

// ─── RSI mini chart ───────────────────────────────────────────────────────────
function RSIChart({ candles }) {
  if (!candles || candles.length === 0) return null;
  const W = 900, H = 70, PAD = { top: 8, right: 60, bottom: 18, left: 60 };
  const display = candles.slice(-80);
  const closes  = candles.map(c => c.close);
  const rsiAll  = calcRSI(closes);
  const rsiDisp = rsiAll.slice(-80);
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;
  const yR = (v) => PAD.top + ch - ((v - 0) / 100) * ch;
  const points = rsiDisp.map((v, i) => {
    if (v == null) return null;
    const x = PAD.left + (i / (rsiDisp.length - 1)) * cw;
    return `${x},${yR(v)}`;
  }).filter(Boolean).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', marginTop: '-2px' }}>
      <rect width={W} height={H} fill="#0A0E1A" />
      {/* 30/70 lines */}
      {[30, 50, 70].map(level => (
        <g key={level}>
          <line x1={PAD.left} y1={yR(level)} x2={PAD.left + cw} y2={yR(level)}
            stroke={level === 50 ? '#2D3748' : level === 70 ? '#E53E3E' : '#00D4AA'}
            strokeWidth="0.7" strokeDasharray="3,3" opacity="0.6" />
          <text x={PAD.left - 6} y={yR(level) + 3} textAnchor="end" fill="#8892A4" fontSize="8" fontFamily="JetBrains Mono, monospace">{level}</text>
        </g>
      ))}
      <polyline points={points} fill="none" stroke="#a78bfa" strokeWidth="1.2" />
      <text x={PAD.left - 6} y={PAD.top + 8} textAnchor="end" fill="#8892A4" fontSize="9" fontFamily="JetBrains Mono, monospace">RSI</text>
    </svg>
  );
}

// ─── Signal card ──────────────────────────────────────────────────────────────
function SignalCard({ signal, ticker }) {
  if (!signal) return null;
  const { action, color, Icon, score, reasons, price, rsiVal, stopLoss, target1, target2, rr, support, resistance } = signal;

  const bgColor = action === 'BUY' ? 'rgba(0,212,170,0.07)'
               : action === 'SELL' ? 'rgba(229,62,62,0.07)'
               : 'rgba(245,166,35,0.07)';
  const borderCol = action === 'BUY' ? 'rgba(0,212,170,0.35)'
                  : action === 'SELL' ? 'rgba(229,62,62,0.35)'
                  : 'rgba(245,166,35,0.35)';

  return (
    <div style={{ background: bgColor, border: `1px solid ${borderCol}`, borderRadius: '4px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: color, borderRadius: '4px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={24} color="#0A0E1A" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>{action}</div>
            <div style={{ fontSize: '0.78rem', color: '#8892A4' }}>{ticker} · ZenChart Signal</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', color: '#fff' }}>Rs {fmt(price)}</div>
          <div style={{ fontSize: '0.75rem', color: '#8892A4' }}>Current Price</div>
        </div>
      </div>

      {/* Key levels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '10px' }}>
        {[
          { label: 'Stop Loss',  value: `Rs ${fmt(stopLoss)}`,  icon: ShieldAlert, col: '#E53E3E' },
          { label: 'Target 1',   value: `Rs ${fmt(target1)}`,   icon: Target,      col: '#00D4AA' },
          { label: 'Target 2',   value: `Rs ${fmt(target2)}`,   icon: Target,      col: '#00D4AA' },
          { label: 'Risk/Reward',value: rr ? `1 : ${rr.toFixed(2)}` : '—', icon: DollarSign, col: '#F5A623' },
          { label: 'Support',    value: `Rs ${fmt(support)}`,   icon: BarChart2,   col: '#a78bfa' },
          { label: 'Resistance', value: `Rs ${fmt(resistance)}`,icon: BarChart2,   col: '#a78bfa' },
        ].map(({ label, value, icon: Ic, col }) => (
          <div key={label} style={{ background: '#111827', border: '1px solid #2D3748', borderRadius: '4px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Ic size={12} color={col} />
              <span style={{ fontSize: '0.72rem', color: '#8892A4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.88rem', color: col, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      <div style={{ background: '#111827', border: '1px solid #2D3748', borderRadius: '4px', padding: '12px 16px' }}>
        <div style={{ fontSize: '0.75rem', color: '#8892A4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          Signal Rationale  <span style={{ color: color }}>Score: {score > 0 ? '+' : ''}{score}</span>
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {reasons.map((r, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: '#cdd5e0' }}>
              <span style={{ color, marginTop: '2px', flexShrink: 0 }}>▸</span>{r}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ fontSize: '0.72rem', color: '#4B5563', borderTop: '1px solid #2D3748', paddingTop: '10px' }}>
        ⚠ ZenChart signals are generated from technical indicators (EMA, RSI, MACD, Bollinger Bands, ATR) on historical price data. This is for educational purposes only — not financial advice. Always do your own due diligence.
      </div>
    </div>
  );
}

// ─── Main ZenChart component ──────────────────────────────────────────────────
export default function ZenChart({ initialTicker }) {
  const [ticker,   setTicker]   = useState(initialTicker || 'NABIL');
  const [input,    setInput]    = useState(initialTicker || 'NABIL');
  const [candles,  setCandles]  = useState(null);
  const [signal,   setSignal]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [showDrop, setShowDrop] = useState(false);
  const [dropFilter, setDropFilter] = useState('');
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchData = useCallback(async (sym) => {
    setLoading(true);
    setError(null);
    setCandles(null);
    setSignal(null);

    const to   = toUnix(0);
    const from = toUnix(365);
    const url  = `https://nepsealpha.com/trading/1/history?symbol=${sym}&resolution=1D&from=${from}&to=${to}&currencyCode=NRS`;

    try {
      const res  = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.t || data.t.length < 20) throw new Error('Insufficient price history for this symbol.');

      const parsed = data.t.map((t, i) => ({
        date:   new Date(t * 1000).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' }),
        open:   data.o[i], high: data.h[i], low: data.l[i], close: data.c[i], volume: data.v?.[i] || 0
      }));

      setCandles(parsed);
      setSignal(generateSignal(parsed));
    } catch (err) {
      // NepseAlpha may block CORS — fall back to demo data
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('CORS')) {
        setError('cors');
        // Generate plausible demo candles for signal demonstration
        const demo = generateDemoCandles(sym);
        setCandles(demo);
        setSignal(generateSignal(demo));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(ticker); }, [ticker, fetchData]);

  const handleGo = () => {
    const sym = input.trim().toUpperCase();
    if (!sym) return;
    setTicker(sym);
    setShowDrop(false);
  };

  const handleSelect = (sym) => {
    setInput(sym);
    setTicker(sym);
    setShowDrop(false);
    setDropFilter('');
  };

  const filtered = ALL_TICKERS.filter(t => t.includes(dropFilter.toUpperCase())).slice(0, 40);

  return (
    <div className="workspace" style={{ gap: '20px' }}>
      {/* ── Title bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={22} color="#00D4AA" />
          <h2 style={{ color: '#fff' }}>
            Zen<span style={{ color: '#00D4AA' }}>Chart</span>
            <span style={{ fontSize: '0.7rem', color: '#8892A4', marginLeft: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 400 }}>
              AI-POWERED TECHNICAL SIGNALS
            </span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} ref={dropRef}>
          {/* Ticker input + dropdown */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: '0' }}>
              <input
                value={input}
                onChange={e => { setInput(e.target.value.toUpperCase()); setShowDrop(true); setDropFilter(e.target.value); }}
                onFocus={() => setShowDrop(true)}
                onKeyDown={e => e.key === 'Enter' && handleGo()}
                placeholder="Symbol…"
                style={{
                  padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace',
                  background: '#111827', border: '1px solid #2D3748', borderRight: 'none',
                  color: '#00D4AA', borderRadius: '4px 0 0 4px', width: '110px', textTransform: 'uppercase'
                }}
              />
              <button
                onClick={() => setShowDrop(v => !v)}
                style={{ padding: '8px 6px', background: '#111827', border: '1px solid #2D3748', borderLeft: 'none', color: '#8892A4', borderRadius: '0' }}
              ><ChevronDown size={14} /></button>
              <button
                onClick={handleGo}
                style={{ padding: '8px 14px', background: '#00D4AA', color: '#0A0E1A', fontWeight: 700, borderRadius: '0 4px 4px 0', fontSize: '0.85rem' }}
              >GO</button>
            </div>
            {showDrop && (
              <div style={{
                position: 'absolute', top: '38px', left: 0, zIndex: 100,
                background: '#111827', border: '1px solid #2D3748', borderRadius: '4px',
                maxHeight: '260px', overflowY: 'auto', width: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
              }}>
                <div style={{ padding: '6px' }}>
                  <input
                    autoFocus
                    placeholder="Search…"
                    value={dropFilter}
                    onChange={e => setDropFilter(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '5px 8px', background: '#0A0E1A', border: '1px solid #2D3748', color: '#fff', borderRadius: '3px', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </div>
                {filtered.map(sym => (
                  <button key={sym} onClick={() => handleSelect(sym)} style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem',
                    color: sym === ticker ? '#00D4AA' : '#cdd5e0',
                    background: sym === ticker ? 'rgba(0,212,170,0.08)' : 'transparent',
                    borderBottom: '1px solid #1E293B'
                  }}>{sym}</button>
                ))}
                {filtered.length === 0 && <div style={{ padding: '10px 12px', color: '#8892A4', fontSize: '0.8rem' }}>No match</div>}
              </div>
            )}
          </div>
          <button
            onClick={() => fetchData(ticker)}
            disabled={loading}
            title="Refresh"
            style={{ padding: '8px 10px', background: '#111827', border: '1px solid #2D3748', borderRadius: '4px', color: '#8892A4' }}
          ><RefreshCw size={15} className={loading ? 'spin' : ''} /></button>
        </div>
      </div>

      {/* ── CORS warning ── */}
      {error === 'cors' && (
        <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '4px', padding: '10px 14px', display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#F5A623' }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          NepseAlpha data couldn't be fetched directly (CORS restriction). Showing chart with demo price data. Open the site via NepseAlpha for real data.
        </div>
      )}
      {error && error !== 'cors' && (
        <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.3)', borderRadius: '4px', padding: '10px 14px', fontSize: '0.82rem', color: '#E53E3E' }}>
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8892A4' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div style={{ fontFamily: 'JetBrains Mono, monospace' }}>Fetching {ticker} data…</div>
        </div>
      )}

      {/* ── Chart area ── */}
      {!loading && candles && (
        <div style={{ background: '#111827', border: '1px solid #2D3748', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #2D3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#00D4AA' }}>{ticker}</span>
            <span style={{ fontSize: '0.75rem', color: '#8892A4' }}>Daily · {candles.length} candles · EMA20 · EMA50 · Bollinger Bands</span>
          </div>
          <CandlestickChart candles={candles} signal={signal} />
          <VolumeChart candles={candles} />
          <RSIChart   candles={candles} />
        </div>
      )}

      {/* ── Signal card ── */}
      {!loading && signal && <SignalCard signal={signal} ticker={ticker} />}

      {/* Spin keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}

// ─── Demo candle generator (fallback when CORS blocks real data) ──────────────
function generateDemoCandles(sym) {
  const seed = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng  = (() => { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; }; })();

  const basePrice = 200 + rng() * 1800;
  const candles = [];
  let price = basePrice;
  const today = Date.now();

  for (let i = 180; i >= 0; i--) {
    const d = new Date(today - i * 86400000);
    const day = d.getDay();
    if (day === 0 || day === 6) continue; // skip weekends
    const change = (rng() - 0.48) * price * 0.025;
    const open  = price;
    const close = Math.max(10, price + change);
    const high  = Math.max(open, close) * (1 + rng() * 0.012);
    const low   = Math.min(open, close) * (1 - rng() * 0.012);
    const vol   = Math.floor(10000 + rng() * 200000);
    candles.push({
      date: d.toLocaleDateString('en-NP', { month: 'short', day: 'numeric' }),
      open: +open.toFixed(2), high: +high.toFixed(2),
      low:  +low.toFixed(2), close: +close.toFixed(2), volume: vol
    });
    price = close;
  }
  return candles;
}
