// =============================================================
// MARRIPLAN — Módulo: Identidade do Casamento
// Stack: React (JSX) + Mantine UI simulado via CSS inline/classes
// Arquivo único para preview — em produção separar por pasta
// =============================================================

import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { WeddingIdentityPageId } from '@/types/weddingIdentity';
import {
  DecorationPage,
  DressCodePage,
  InspirationPage,
  MoodboardPage,
  OverviewPage,
  PalettePage,
  SweetsPage,
  WeddingStylePage,
} from './identity/pages';
import WeddingIdentitySidebar from './identity/WeddingIdentitySidebar';

// ─── CSS STYLES ───────────────────────────────────────────────

export const weddingIdentityCss = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600&display=swap');

  :root {
    --marriplan-bg: #FAF8F5;
    --marriplan-surface: #FFFFFF;
    --marriplan-surface-muted: #F5F1EC;
    --marriplan-border: #EDE8E0;
    --marriplan-text: #2C2420;
    --marriplan-muted: #9B8E84;
    --marriplan-champagne: #F7E7C8;
    --marriplan-rose: #C4756A;
    --marriplan-gold: #C9A96E;
    --marriplan-shadow: 0 2px 20px rgba(44,36,32,0.06);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, .wi-root {
    font-family: 'Manrope', sans-serif;
    background: var(--marriplan-bg);
    color: var(--marriplan-text);
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Montserrat', sans-serif;
  }

  /* Layout */
  .wi-layout { display: flex; min-height: 100vh; }
  .wi-sidebar {
    width: 260px;
    min-width: 260px;
    background: var(--marriplan-surface);
    border-right: 1px solid var(--marriplan-border);
    display: flex;
    flex-direction: column;
    padding: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }
  .wi-sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--marriplan-border);
  }
  .wi-sidebar-logo .logo-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    color: var(--marriplan-muted);
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .wi-sidebar-logo .logo-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--marriplan-text);
  }
  .wi-sidebar-nav { padding: 12px 12px; flex: 1; }
  .wi-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--marriplan-muted);
    transition: all 0.18s ease;
    margin-bottom: 2px;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }
  .wi-nav-link:hover { background: var(--marriplan-surface-muted); color: var(--marriplan-text); }
  .wi-nav-link.active {
    background: linear-gradient(135deg, #f5ede7 0%, #faf3ee 100%);
    color: var(--marriplan-rose);
    font-weight: 600;
  }
  .wi-nav-link .nav-icon { font-size: 16px; flex-shrink: 0; }

  /* Main */
  .wi-main { flex: 1; overflow-y: auto; }
  .wi-page { padding: 36px 40px; max-width: 1100px; animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  /* Page Header */
  .wi-page-header {
    background: linear-gradient(135deg, #fff8f5 0%, #faf3ec 50%, #f5ede5 100%);
    border: 1px solid var(--marriplan-border);
    border-radius: 20px;
    padding: 32px 36px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }
  .wi-page-header::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 160px;
    height: 160px;
    background: radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .wi-page-header .eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--marriplan-gold);
    margin-bottom: 8px;
  }
  .wi-page-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--marriplan-text);
    margin-bottom: 8px;
    line-height: 1.2;
  }
  .wi-page-header p {
    font-size: 14px;
    color: var(--marriplan-muted);
    margin-bottom: 20px;
    max-width: 520px;
    line-height: 1.6;
  }
  .wi-page-header .actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* Buttons */
  .btn-primary {
    background: var(--marriplan-rose);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: all 0.18s ease;
    letter-spacing: 0.2px;
  }
  .btn-primary:hover { background: #b8665c; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(196,117,106,0.3); }

  .btn-secondary {
    background: var(--marriplan-surface);
    color: var(--marriplan-text);
    border: 1px solid var(--marriplan-border);
    border-radius: 10px;
    padding: 10px 18px;
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: all 0.18s ease;
  }
  .btn-secondary:hover { background: var(--marriplan-surface-muted); border-color: #d8cfc5; }

  .btn-ghost {
    background: transparent;
    color: var(--marriplan-muted);
    border: none;
    border-radius: 8px;
    padding: 8px 14px;
    font-family: 'Manrope', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .btn-ghost:hover { background: var(--marriplan-surface-muted); color: var(--marriplan-text); }

  /* Cards */
  .marriplan-card {
    background: var(--marriplan-surface);
    border: 1px solid var(--marriplan-border);
    border-radius: 16px;
    box-shadow: var(--marriplan-shadow);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .marriplan-card:hover { box-shadow: 0 4px 32px rgba(44,36,32,0.1); }

  /* Grid */
  .wi-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .wi-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .wi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

  /* Section Title */
  .wi-section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--marriplan-text);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .wi-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--marriplan-border);
  }

  /* Badge */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .badge-rose { background: #fdf0ee; color: var(--marriplan-rose); }
  .badge-gold { background: #faf3e3; color: var(--marriplan-gold); }
  .badge-neutral { background: var(--marriplan-surface-muted); color: var(--marriplan-muted); }
  .badge-selected { background: var(--marriplan-rose); color: #fff; }

  /* Color swatch */
  .color-swatch {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 12px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  .color-swatch:hover { transform: scale(1.06); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
  .color-swatch.selected { border-color: var(--marriplan-text); box-shadow: 0 0 0 3px rgba(44,36,32,0.15); }

  /* Style card */
  .style-card {
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    aspect-ratio: 3/4;
    transition: all 0.25s ease;
    border: 2px solid transparent;
  }
  .style-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); }
  .style-card.selected { border-color: var(--marriplan-gold); box-shadow: 0 0 0 4px rgba(201,169,110,0.25); }
  .style-card-bg { position: absolute; inset: 0; }
  .style-card-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 16px 16px;
    background: linear-gradient(transparent, rgba(0,0,0,0.75));
    color: #fff;
  }
  .style-card-content h3 { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 3px; }
  .style-card-content p { font-size: 11px; opacity: 0.8; margin-bottom: 10px; }
  .style-card-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
  .style-card-tag { background: rgba(255,255,255,0.18); backdrop-filter: blur(4px); border-radius: 20px; padding: 3px 8px; font-size: 10px; color: #fff; }
  .style-card-select-btn {
    background: rgba(255,255,255,0.22);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 8px;
    padding: 7px 14px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Manrope', sans-serif;
    width: 100%;
  }
  .style-card-select-btn:hover, .style-card.selected .style-card-select-btn {
    background: rgba(255,255,255,0.35);
  }
  .style-card-check {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    background: var(--marriplan-gold);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    animation: popIn 0.2s ease;
  }
  @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

  /* Progress ring */
  .progress-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .progress-ring svg { transform: rotate(-90deg); }
  .progress-ring-label { position: absolute; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 18px; color: var(--marriplan-text); }

  /* Dress code card */
  .dress-code-card {
    border-radius: 14px;
    border: 2px solid var(--marriplan-border);
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--marriplan-surface);
  }
  .dress-code-card:hover { border-color: var(--marriplan-gold); box-shadow: 0 4px 20px rgba(201,169,110,0.15); }
  .dress-code-card.selected { border-color: var(--marriplan-rose); background: #fff8f7; }
  .dress-code-dots { display: flex; gap: 3px; margin-top: 8px; }
  .dress-code-dot { width: 8px; height: 8px; border-radius: 50%; }

  /* Masonry */
  .masonry { columns: 3; column-gap: 16px; }
  .masonry-item { break-inside: avoid; margin-bottom: 16px; border-radius: 14px; overflow: hidden; position: relative; cursor: pointer; }
  .masonry-item:hover .masonry-overlay { opacity: 1; }
  .masonry-img { width: 100%; display: block; border-radius: 14px; }
  .masonry-overlay {
    position: absolute;
    inset: 0;
    background: rgba(44,36,32,0.45);
    border-radius: 14px;
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 14px;
  }
  .masonry-overlay h4 { color: #fff; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .masonry-overlay .tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .masonry-overlay .tag { background: rgba(255,255,255,0.2); color: #fff; border-radius: 20px; padding: 3px 8px; font-size: 10px; }

  /* Upload dropzone */
  .dropzone {
    border: 2px dashed var(--marriplan-border);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--marriplan-surface-muted);
  }
  .dropzone:hover { border-color: var(--marriplan-gold); background: #faf3e8; }

  /* Sweets preview */
  .sweets-preview-box {
    background: var(--marriplan-champagne);
    border-radius: 16px;
    min-height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--marriplan-border);
    flex-direction: column;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }

  /* Moodboard */
  .moodboard-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: auto;
    gap: 12px;
  }
  .moodboard-hero { grid-row: span 2; border-radius: 16px; overflow: hidden; }
  .moodboard-cell { border-radius: 12px; overflow: hidden; }

  /* Palette preview bar */
  .palette-bar { display: flex; height: 8px; border-radius: 20px; overflow: hidden; margin: 8px 0; }
  .palette-bar-segment { flex: 1; }

  /* Toggle */
  .wi-tab-bar { display: flex; gap: 4px; background: var(--marriplan-surface-muted); padding: 4px; border-radius: 12px; margin-bottom: 24px; }
  .wi-tab { padding: 8px 18px; border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--marriplan-muted); border: none; background: none; font-family: 'Manrope', sans-serif; transition: all 0.15s; }
  .wi-tab.active { background: var(--marriplan-surface); color: var(--marriplan-text); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

  /* Input */
  .wi-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--marriplan-border);
    border-radius: 10px;
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    color: var(--marriplan-text);
    background: var(--marriplan-surface);
    outline: none;
    transition: border-color 0.15s;
  }
  .wi-input:focus { border-color: var(--marriplan-gold); box-shadow: 0 0 0 3px rgba(201,169,110,0.12); }

  /* Select */
  .wi-select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--marriplan-border);
    border-radius: 10px;
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    color: var(--marriplan-text);
    background: var(--marriplan-surface);
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239B8E84' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
  }
  .wi-select:focus { border-color: var(--marriplan-gold); }

  /* Stat card */
  .stat-card {
    background: var(--marriplan-surface);
    border: 1px solid var(--marriplan-border);
    border-radius: 14px;
    padding: 20px 22px;
    box-shadow: var(--marriplan-shadow);
  }
  .stat-card .stat-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--marriplan-muted);
    margin-bottom: 8px;
  }
  .stat-card .stat-value {
    font-family: 'Montserrat', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--marriplan-text);
    margin-bottom: 4px;
    line-height: 1;
  }
  .stat-card .stat-sub { font-size: 12px; color: var(--marriplan-muted); }

  /* Modal overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(44,36,32,0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: var(--marriplan-surface);
    border-radius: 20px;
    padding: 32px;
    width: 480px;
    max-width: 92vw;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-title { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .modal-sub { font-size: 13px; color: var(--marriplan-muted); margin-bottom: 24px; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--marriplan-muted); margin-bottom: 6px; display: block; letter-spacing: 0.3px; }
  .form-group { margin-bottom: 16px; }

  /* Favorite btn */
  .fav-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(4px);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .fav-btn:hover { transform: scale(1.1); }
  .fav-btn.active { background: var(--marriplan-rose); }

  /* Decoration grid */
  .deco-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .deco-card {
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }
  .deco-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
  .deco-card.selected { border-color: var(--marriplan-gold); }
  .deco-card-img { width: 100%; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 40px; }
  .deco-card-footer { padding: 12px; background: var(--marriplan-surface); }
  .deco-card-footer h4 { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
  .deco-card-footer p { font-size: 11px; color: var(--marriplan-muted); }

  /* Moodboard export */
  .export-card {
    background: linear-gradient(135deg, #2c1a0e 0%, #5a3a1a 100%);
    border-radius: 16px;
    padding: 24px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--marriplan-border); border-radius: 4px; }

  /* Responsive */
  @media (max-width: 900px) {
    .wi-sidebar { display: none; }
    .wi-grid-3 { grid-template-columns: repeat(2, 1fr); }
    .wi-grid-4 { grid-template-columns: repeat(2, 1fr); }
    .masonry { columns: 2; }
    .moodboard-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 600px) {
    .wi-page { padding: 20px 16px; }
    .wi-grid-2, .wi-grid-3, .wi-grid-4 { grid-template-columns: 1fr; }
    .masonry { columns: 1; }
  }

  /* Sweets customizer layout */
  .sweets-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
  @media (max-width: 700px) { .sweets-layout { grid-template-columns: 1fr; } }

  /* Palette builder */
  .palette-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 24px; align-items: start; }
  @media (max-width: 700px) { .palette-layout { grid-template-columns: 1fr; } }

  /* Overview hero */
  .overview-hero {
    background: linear-gradient(135deg, #fff4f0 0%, #fefaf5 50%, #f8f3ed 100%);
    border-radius: 20px;
    border: 1px solid var(--marriplan-border);
    padding: 36px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 36px;
    position: relative;
    overflow: hidden;
  }
  .overview-hero::after {
    content: '✦';
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 80px;
    color: rgba(201,169,110,0.08);
  }

  .color-picker-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
  .palette-preview-block { display: flex; gap: 12px; flex-wrap: wrap; }

  .live-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .live-preview-img {
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 4/3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 300;
    position: relative;
  }
  .live-preview-img p {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    font-size: 11px;
    color: #fff;
    font-weight: 600;
    text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  }

  /* Pill selector */
  .pill-selector { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill {
    padding: 7px 16px;
    border-radius: 20px;
    border: 1px solid var(--marriplan-border);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: var(--marriplan-surface);
    color: var(--marriplan-muted);
    transition: all 0.15s;
  }
  .pill:hover { border-color: var(--marriplan-gold); color: var(--marriplan-text); }
  .pill.selected { background: var(--marriplan-rose); color: #fff; border-color: var(--marriplan-rose); }
`;

// ─── ROOT APP ─────────────────────────────────────────────────

export default function WeddingIdentityModule() {
  const {
    activePage,
    setActivePage,
    palette,
    setPalette,
    selectedStyle,
    setSelectedStyle,
    dressCode,
    setDressCode,
  } = useWeddingIdentityState();

  const renderPage = () => {
    switch (activePage) {
      case "overview": return <OverviewPage selectedStyle={selectedStyle} palette={palette} dressCode={dressCode} />;
      case "palette": return <PalettePage palette={palette} setPalette={setPalette} />;
      case "style": return <WeddingStylePage selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />;
      case "dresscode": return <DressCodePage dressCode={dressCode} setDressCode={setDressCode} />;
      case "sweets": return <SweetsPage />;
      case "decoration": return <DecorationPage />;
      case "inspirations": return <InspirationPage />;
      case "moodboard": return <MoodboardPage selectedStyle={selectedStyle} palette={palette} dressCode={dressCode} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{weddingIdentityCss}</style>
      <div className="wi-root">
        <div className="wi-layout">
          <WeddingIdentitySidebar activePage={activePage as WeddingIdentityPageId} onPageChange={setActivePage} />

          {/* Main content */}
          <main className="wi-main">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}
