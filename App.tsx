import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════
type View = "dashboard" | "live" | "video" | "analytics" | "history" | "settings";
type Language = "EN" | "PT" | "JA";
type Currency = "JPY" | "USD" | "EUR";
type Platform = "Twitch" | "YouTube";

interface LiveBlock {
  id: string; label: string; duration: string; done: boolean; color: string;
}
interface VideoIdea {
  id: string; title: string; color: string; createdAt: string;
}

// ═══════════════════════════════════════════════════════════════
//  I18N
// ═══════════════════════════════════════════════════════════════
const T = {
  EN: {
    dashboard: "Dashboard", live: "Live Planner", video: "Video Manager", analytics: "Analytics", history: "History", settings: "Settings",
    goodEvening: "Good evening", streamIn: "Stream in", followers: "Followers", avgViewers: "Avg viewers", streamHours: "Stream hours", clipViews: "Clip views",
    revenue: "Revenue", thisMonth: "This month", subscriptions: "Subscriptions", donations: "Donations", weeklyViewers: "Weekly viewers", monthlyGrowth: "Monthly growth",
    recentUploads: "Recent uploads", calendar: "Calendar", tonightStream: "Tonight's stream", progress: "Progress", addBlock: "Add segment",
    blockName: "Segment name", duration: "Duration (min)", done: "Done", pending: "Pending",
    videoManager: "Video Manager", videoIdeas: "video ideas", addIdea: "Add video idea", videoTitle: "Video title", noIdeas: "No video ideas yet. Add your first one!",
    noHistory: "No stream history yet.", savePreferences: "Save preferences", preferencesLabel: "Preferences", platformLabel: "Platform", languageLabel: "Language",
    currencyLabel: "Currency", saved: "Saved!", staticPlaceholder: "Static placeholder · Ready for API",
    currentSegment: "Current segment", nextSegment: "Next segment", edit: "Edit", del: "Delete", cancel: "Cancel", save: "Save", add: "Add", min: "min",
    streamHistory: "Stream history", date: "Date", title: "Title", dur: "Duration", viewers: "Viewers",
    topPeakViewers: "Peak viewers", totalStreams: "Total streams", avgDuration: "Avg duration", settingsTitle: "Settings & Preferences", about: "About",
  },
  PT: {
    dashboard: "Painel", live: "Planner Ao Vivo", video: "Vídeos", analytics: "Análises", history: "Histórico", settings: "Configurações",
    goodEvening: "Boa noite", streamIn: "Stream em", followers: "Seguidores", avgViewers: "Esp. médios", streamHours: "Horas de stream", clipViews: "Views de clips",
    revenue: "Receita", thisMonth: "Este mês", subscriptions: "Assinaturas", donations: "Doações", weeklyViewers: "Espectadores semanais", monthlyGrowth: "Crescimento mensal",
    recentUploads: "Uploads recentes", calendar: "Calendário", tonightStream: "Stream de hoje", progress: "Progresso", addBlock: "Adicionar bloco",
    blockName: "Nome do bloco", duration: "Duração (min)", done: "Feito", pending: "Pendente",
    videoManager: "Gerenciador de Vídeos", videoIdeas: "ideias de vídeos", addIdea: "Adicionar ideia", videoTitle: "Título do vídeo", noIdeas: "Sem ideias ainda!",
    noHistory: "Sem histórico de streams.", savePreferences: "Salvar preferências", preferencesLabel: "Preferências", platformLabel: "Plataforma", languageLabel: "Idioma",
    currencyLabel: "Moeda", saved: "Salvo!", staticPlaceholder: "Placeholder · Pronto para API",
    currentSegment: "Segmento atual", nextSegment: "Próximo segmento", edit: "Editar", del: "Excluir", cancel: "Cancelar", save: "Salvar", add: "Adicionar", min: "min",
    streamHistory: "Histórico de streams", date: "Data", title: "Título", dur: "Duração", viewers: "Espectadores",
    topPeakViewers: "Pico de espectadores", totalStreams: "Total de streams", avgDuration: "Duração média", settingsTitle: "Configurações", about: "Sobre",
  },
  JA: {
    dashboard: "ダッシュボード", live: "配信プランナー", video: "動画管理", analytics: "アナリティクス", history: "履歴", settings: "設定",
    goodEvening: "こんばんは", streamIn: "配信まで", followers: "フォロワー", avgViewers: "平均視聴者", streamHours: "配信時間", clipViews: "クリップ再生",
    revenue: "収益", thisMonth: "今月", subscriptions: "サブスク", donations: "ドネーション", weeklyViewers: "週間視聴者", monthlyGrowth: "月間成長",
    recentUploads: "最近のアップロード", calendar: "カレンダー", tonightStream: "今夜の配信", progress: "進捗", addBlock: "セグメント追加",
    blockName: "セグメント名", duration: "時間 (分)", done: "完了", pending: "未完了",
    videoManager: "動画マネージャー", videoIdeas: "本の動画アイデア", addIdea: "アイデアを追加", videoTitle: "動画タイトル", noIdeas: "まだアイデアがありません！",
    noHistory: "配信履歴がありません。", savePreferences: "設定を保存", preferencesLabel: "設定", platformLabel: "プラットフォーム", languageLabel: "言語",
    currencyLabel: "通貨", saved: "保存しました！", staticPlaceholder: "静的 · API準備完了",
    currentSegment: "現在のセグメント", nextSegment: "次のセグメント", edit: "編集", del: "削除", cancel: "キャンセル", save: "保存", add: "追加", min: "分",
    streamHistory: "配信履歴", date: "日付", title: "タイトル", dur: "時間", viewers: "視聴者",
    topPeakViewers: "ピーク視聴者", totalStreams: "配信総数", avgDuration: "平均時間", settingsTitle: "設定", about: "について",
  },
} as const;
type Tr = typeof T["EN"];

// ═══════════════════════════════════════════════════════════════
//  CURRENCY
// ═══════════════════════════════════════════════════════════════
const CURR_CFG: Record<Currency, { locale: string; code: string }> = {
  JPY: { locale: "ja-JP", code: "JPY" },
  USD: { locale: "en-US", code: "USD" },
  EUR: { locale: "de-DE", code: "EUR" },
};
const FX: Record<Currency, number> = { JPY: 1, USD: 0.00667, EUR: 0.00611 };
const REVENUE = { total: 128400, subscriptions: 84200, donations: 44200 };

function fmtCur(amount: number, cur: Currency) {
  const { locale, code } = CURR_CFG[cur];
  return new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: 0 }).format(amount);
}

// ═══════════════════════════════════════════════════════════════
//  LOCALSTORAGE
// ═══════════════════════════════════════════════════════════════
function useLS<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const [s, setS] = useState<T>(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : init; }
    catch { return init; }
  });
  const set = useCallback((v: T | ((p: T) => T)) => {
    setS((p) => {
      const n = typeof v === "function" ? (v as (x: T) => T)(p) : v;
      try { localStorage.setItem(key, JSON.stringify(n)); } catch { }
      return n;
    });
  }, [key]);
  return [s, set];
}

// ═══════════════════════════════════════════════════════════════
//  STATIC DATA
// ═══════════════════════════════════════════════════════════════
const DEF_BLOCKS: LiveBlock[] = [
  { id: "b1", label: "Just Chatting", duration: "30", done: true, color: "#7c3aed" },
  { id: "b2", label: "Fortnite", duration: "90", done: true, color: "#0f6e56" },
  { id: "b3", label: "Ending", duration: "15", done: false, color: "#185fa5" },
];
const DEF_VIDEOS: VideoIdea[] = [
  { id: "v1", title: "How I hit 10K subs in 60 days", color: "#7c3aed", createdAt: "2025-04-01" },
  { id: "v2", title: "Fortnite solo win streak analysis", color: "#0f6e56", createdAt: "2025-04-05" },
  { id: "v3", title: "Stream setup for beginners 2025", color: "#993c1d", createdAt: "2025-04-10" },
  { id: "v4", title: "My monthly revenue breakdown", color: "#185fa5", createdAt: "2025-04-12" },
];
const DEF_HIST = [
  { id: "h1", date: "2025-04-14", title: "Fortnite Ranked Grind", duration: "3h 42m", viewers: 1420 },
  { id: "h2", date: "2025-04-12", title: "Just Chatting + Q&A", duration: "2h 10m", viewers: 980 },
  { id: "h3", date: "2025-04-10", title: "Subscriber Celebration", duration: "4h 05m", viewers: 2310 },
  { id: "h4", date: "2025-04-07", title: "Hollow Knight Blind Run", duration: "5h 30m", viewers: 1150 },
  { id: "h5", date: "2025-04-05", title: "Setup tour + tech chat", duration: "1h 55m", viewers: 760 },
];
const BAR = [
  { l: "Mon", v: 62 }, { l: "Tue", v: 81 }, { l: "Wed", v: 54 }, { l: "Thu", v: 93 }, { l: "Fri", v: 71 }, { l: "Sat", v: 88 }, { l: "Sun", v: 45 },
];
const LINE_V = [28, 42, 37, 61, 55, 78, 66, 84, 72, 91, 80, 95];
const LINE_L = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CAL_EV: Record<number, "live" | "upload"> = { 3: "live", 7: "upload", 12: "live", 15: "upload", 19: "live", 22: "live", 27: "upload", 30: "live" };
const PALETTE = ["#7c3aed", "#0f6e56", "#185fa5", "#993c1d", "#3b6d11", "#854f0b", "#72243e"];

// ═══════════════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════════════
const Ic = {
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  Live: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4" /><path d="M3 3a15.3 15.3 0 0 0 0 18M21 3a15.3 15.3 0 0 1 0 18" /></svg>,
  Video: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="15" height="14" rx="2" /><polygon points="22,5 17,9 17,15 22,19" /></svg>,
  Analytics: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>,
  History: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.95L1 10" /><polyline points="12 7 12 12 15 15" /></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  Play: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>,
};
const NAV_ITEMS: { id: View; icon: React.ReactNode }[] = [
  { id: "dashboard", icon: <Ic.Dashboard /> }, { id: "live", icon: <Ic.Live /> },
  { id: "video", icon: <Ic.Video /> }, { id: "analytics", icon: <Ic.Analytics /> },
  { id: "history", icon: <Ic.History /> }, { id: "settings", icon: <Ic.Settings /> },
];

// ═══════════════════════════════════════════════════════════════
//  PRIMITIVES
// ═══════════════════════════════════════════════════════════════
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 ${className}`}>{children}</div>;
}
function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-white/50 text-[11px] uppercase tracking-widest mb-1">{children}</p>;
}
function STitle({ children }: { children: React.ReactNode }) {
  return <p className="text-white text-base font-semibold">{children}</p>;
}

type BtnVariant = "ghost" | "primary" | "danger";
function Btn({ children, onClick, variant = "ghost", className = "", disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: BtnVariant; className?: string; disabled?: boolean;
}) {
  const v: Record<BtnVariant, string> = {
    ghost: "bg-white/[0.05] text-white/60 hover:bg-white/[0.09] hover:text-white border border-white/[0.08]",
    primary: "bg-violet-600 text-white hover:bg-violet-500",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${v[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Inp({ value, onChange, placeholder, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/60 transition-colors ${className}`} />
  );
}

function Toggle<T extends string>({ opts, val, set, red = false }: {
  opts: T[]; val: T; set: (v: T) => void; red?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-white/[0.05] border border-white/[0.08] rounded-lg overflow-hidden">
      {opts.map(o => (
        <button key={o} onClick={() => set(o)}
          className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${val === o ? (red ? "bg-red-600 text-white" : "bg-violet-600 text-white") : "text-white/40 hover:text-white/70"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════════════
function Sidebar({ view, setView, t }: { view: View; setView: (v: View) => void; t: Tr }) {
  const labels: Record<View, string> = {
    dashboard: t.dashboard, live: t.live, video: t.video,
    analytics: t.analytics, history: t.history, settings: t.settings,
  };
  return (
    <aside className="flex flex-col w-[220px] min-w-[220px] h-full bg-[#0e0e12] border-r border-white/[0.07] px-4 py-6 gap-1">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm select-none">CF</div>
        <div>
          <p className="text-white text-sm font-semibold leading-none">Creator Flow</p>
          <p className="text-white/40 text-[10px] mt-0.5">Studio</p>
        </div>
      </div>
      {NAV_ITEMS.map(({ id, icon }) => (
        <button key={id} onClick={() => setView(id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 w-full text-left ${view === id ? "bg-violet-600/20 text-violet-300" : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"}`}>
          <span className={view === id ? "text-violet-400" : "text-white/30"}>{icon}</span>
          {labels[id]}
        </button>
      ))}
      <div className="mt-auto px-3 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">StreamerKai</p>
            <p className="text-white/30 text-[10px]">Pro plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HEADER
// ═══════════════════════════════════════════════════════════════
function Header({ lang, setLang, currency, setCurrency, platform, setPlatform }: {
  lang: Language; setLang: (l: Language) => void;
  currency: Currency; setCurrency: (c: Currency) => void;
  platform: Platform; setPlatform: (p: Platform) => void;
}) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.07] bg-[#0e0e12]/80 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold text-sm tracking-wide">CF Creator Flow</span>
        <span className="flex items-center gap-1 bg-violet-500/20 text-violet-300 text-[10px] px-1.5 py-0.5 rounded-full border border-violet-500/30">
          <Ic.Check /> Verified
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Toggle<Language> opts={["EN", "PT", "JA"]} val={lang} set={setLang} />
        <Toggle<Currency> opts={["JPY", "USD", "EUR"]} val={currency} set={setCurrency} />
        <Toggle<Platform> opts={["Twitch", "YouTube"]} val={platform} set={setPlatform} red={platform === "YouTube"} />
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MINI CHARTS (shared)
// ═══════════════════════════════════════════════════════════════
function BarChart({ t }: { t: Tr }) {
  const bmax = Math.max(...BAR.map(d => d.v));
  return (
    <Card className="flex flex-col gap-4">
      <div><SLabel>{t.analytics}</SLabel><STitle>{t.weeklyViewers}</STitle></div>
      <div className="flex items-end gap-2 h-28">
        {BAR.map(d => (
          <div key={d.l} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="w-full rounded-t-md bg-violet-600/70 hover:bg-violet-500 transition-colors" style={{ height: `${(d.v / bmax) * 100}%` }} />
            <p className="text-white/30 text-[10px]">{d.l}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LineChart({ t, wide = false }: { t: Tr; wide?: boolean }) {
  const W = wide ? 560 : 340, H = wide ? 120 : 100, pad = 8;
  const mx = Math.max(...LINE_V), mn = Math.min(...LINE_V);
  const pts = LINE_V.map((v, i) => ({
    x: pad + (i / (LINE_V.length - 1)) * (W - pad * 2),
    y: pad + ((mx - v) / (mx - mn)) * (H - pad * 2),
  }));
  const ld = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const ad = ld + ` L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;
  return (
    <Card className="flex flex-col gap-4">
      <div><SLabel>{t.analytics}</SLabel><STitle>{t.monthlyGrowth}</STitle></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: wide ? 140 : 100 }}>
        <defs>
          <linearGradient id="lg_cf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={ad} fill="url(#lg_cf)" />
        <path d={ld} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#7c3aed" />)}
      </svg>
      <div className="flex justify-between">
        {LINE_L.map(l => <p key={l} className="text-white/20 text-[9px]">{l}</p>)}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════
function DashboardView({ currency, t, liveBlocks }: { currency: Currency; t: Tr; liveBlocks: LiveBlock[] }) {
  const done = liveBlocks.filter(b => b.done).length;
  const prog = liveBlocks.length > 0 ? Math.round((done / liveBlocks.length) * 100) : 0;
  const curIdx = liveBlocks.findIndex(b => !b.done);
  const cur = curIdx >= 0 ? liveBlocks[curIdx] : undefined;
  const next = curIdx >= 0 ? liveBlocks[curIdx + 1] : undefined;

  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const cells: (number | null)[] = [...Array(3).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-[11px] uppercase tracking-widest mb-1">Creator Flow · {new Date().toLocaleDateString()}</p>
          <h1 className="text-white text-xl font-semibold">{t.goodEvening}, StreamerKai</h1>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />{t.streamIn} 2h 40m
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t.followers, value: "24.8K", delta: "+320 today" },
          { label: t.avgViewers, value: "1,240", delta: "+8.2%" },
          { label: t.streamHours, value: "142h", delta: "this month" },
          { label: t.clipViews, value: "890K", delta: "+12K this week" },
        ].map(s => (
          <Card key={s.label} className="py-3 px-4">
            <p className="text-white/40 text-[10px] uppercase tracking-widest">{s.label}</p>
            <p className="text-white text-lg font-bold leading-none mt-1">{s.value}</p>
            <p className="text-white/30 text-[10px] mt-1">{s.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Live summary */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div><SLabel>{t.live}</SLabel><STitle>{t.tonightStream}</STitle></div>
            <span className="flex items-center gap-1.5 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse inline-block" />Live
            </span>
          </div>
          {cur ? (
            <div className="flex flex-col gap-2">
              <p className="text-white/30 text-[10px]">{t.currentSegment}</p>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-violet-500/40 bg-violet-500/10">
                <div className="w-1.5 h-7 rounded-full" style={{ background: cur.color }} />
                <div><p className="text-white text-sm font-medium">{cur.label}</p><p className="text-white/30 text-[10px]">{cur.duration} {t.min}</p></div>
              </div>
              {next && <><p className="text-white/30 text-[10px]">{t.nextSegment}</p>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] opacity-60">
                  <div className="w-1.5 h-7 rounded-full" style={{ background: next.color }} />
                  <div><p className="text-white/60 text-sm">{next.label}</p><p className="text-white/30 text-[10px]">{next.duration} {t.min}</p></div>
                </div></>}
            </div>
          ) : (
            <p className="text-emerald-400 text-sm font-medium py-2">All segments complete ✓</p>
          )}
          <div className="mt-auto">
            <div className="flex justify-between mb-1.5">
              <p className="text-white/30 text-[10px]">{t.progress}</p>
              <p className="text-violet-300 text-[10px] font-medium">{prog}%</p>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400" style={{ width: `${prog}%` }} />
            </div>
          </div>
        </Card>

        {/* Revenue */}
        <Card className="flex flex-col gap-4">
          <div><SLabel>{t.revenue}</SLabel><STitle>{t.thisMonth}</STitle></div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {fmtCur(Math.round(REVENUE.total * FX[currency]), currency)}
            </span>
            <span className="text-emerald-400 text-sm mb-1 font-medium">+12.4%</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ l: t.subscriptions, a: REVENUE.subscriptions }, { l: t.donations, a: REVENUE.donations }].map(s => (
              <div key={s.l} className="bg-white/[0.04] rounded-xl px-3 py-2.5">
                <p className="text-white/40 text-[10px] mb-1">{s.l}</p>
                <p className="text-white text-sm font-semibold">{fmtCur(Math.round(s.a * FX[currency]), currency)}</p>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-[10px] border-t border-white/[0.06] pt-3">{t.staticPlaceholder}</p>
        </Card>

        <BarChart t={t} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2"><LineChart t={t} /></div>
        {/* Calendar */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div><SLabel>{t.calendar}</SLabel><STitle>April 2025</STitle></div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] text-violet-300"><span className="w-2 h-2 bg-violet-600 rounded-full inline-block" />Live</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-300"><span className="w-2 h-2 bg-emerald-600 rounded-full inline-block" />Upload</span>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-0.5">
            {DAYS.map(d => <p key={d} className="text-center text-white/25 text-[10px] font-medium py-0.5">{d}</p>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              const ev = day ? CAL_EV[day] : null;
              return <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-[11px] ${ev === "live" ? "bg-violet-600/80 text-white font-semibold" : ev === "upload" ? "bg-emerald-600/70 text-white font-semibold" : day ? "text-white/35 hover:bg-white/[0.04]" : ""}`}>{day}</div>;
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LIVE PLANNER
// ═══════════════════════════════════════════════════════════════
function LivePlannerView({ blocks, setBlocks, t }: {
  blocks: LiveBlock[]; setBlocks: (v: LiveBlock[] | ((p: LiveBlock[]) => LiveBlock[])) => void; t: Tr;
}) {
  const [nLabel, setNLabel] = useState(""); const [nDur, setNDur] = useState("30");
  const [eId, setEId] = useState<string | null>(null); const [eLabel, setELabel] = useState(""); const [eDur, setEDur] = useState("");

  const done = blocks.filter(b => b.done).length;
  const prog = blocks.length > 0 ? Math.round((done / blocks.length) * 100) : 0;
  const curIdx = blocks.findIndex(b => !b.done);
  const cur = curIdx >= 0 ? blocks[curIdx] : undefined;
  const next = curIdx >= 0 ? blocks[curIdx + 1] : undefined;

  const addBlock = () => {
    if (!nLabel.trim()) return;
    setBlocks(p => [...p, { id: `b${Date.now()}`, label: nLabel.trim(), duration: nDur || "30", done: false, color: PALETTE[p.length % PALETTE.length] }]);
    setNLabel(""); setNDur("30");
  };
  const toggle = (id: string) => setBlocks(p => p.map(b => b.id === id ? { ...b, done: !b.done } : b));
  const del = (id: string) => setBlocks(p => p.filter(b => b.id !== id));
  const startEdit = (b: LiveBlock) => { setEId(b.id); setELabel(b.label); setEDur(b.duration); };
  const saveEdit = () => { if (!eId) return; setBlocks(p => p.map(b => b.id === eId ? { ...b, label: eLabel, duration: eDur } : b)); setEId(null); };

  return (
    <div className="flex flex-col gap-5">
      <div><h2 className="text-white text-xl font-semibold">{t.live}</h2><p className="text-white/40 text-sm mt-0.5">{t.tonightStream}</p></div>
      <div className="grid grid-cols-3 gap-4">
        {/* Status panel */}
        <Card className="flex flex-col gap-4">
          {cur ? (
            <>
              <div>
                <SLabel>{t.currentSegment}</SLabel>
                <div className="flex items-center gap-3 mt-2 px-3.5 py-3 rounded-xl border border-violet-500/50 bg-violet-500/10">
                  <div className="w-1.5 h-10 rounded-full" style={{ background: cur.color }} />
                  <div className="flex-1 min-w-0"><p className="text-white font-semibold">{cur.label}</p><p className="text-white/40 text-xs">{cur.duration} {t.min}</p></div>
                  <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                </div>
              </div>
              {next && <div>
                <SLabel>{t.nextSegment}</SLabel>
                <div className="flex items-center gap-3 mt-2 px-3.5 py-3 rounded-xl border border-white/[0.07] bg-white/[0.03] opacity-70">
                  <div className="w-1.5 h-10 rounded-full" style={{ background: next.color }} />
                  <div><p className="text-white/70 font-medium">{next.label}</p><p className="text-white/30 text-xs">{next.duration} {t.min}</p></div>
                </div>
              </div>}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <p className="text-emerald-400 font-medium">All complete!</p>
              <p className="text-white/30 text-xs">Stream plan finished</p>
            </div>
          )}
          <div className="mt-auto">
            <div className="flex justify-between mb-1.5">
              <p className="text-white/30 text-[10px]">{t.progress}</p>
              <p className="text-violet-300 text-[10px] font-medium">{prog}%</p>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all" style={{ width: `${prog}%` }} />
            </div>
            <p className="text-white/25 text-[10px] mt-1.5">{done} / {blocks.length} {t.done.toLowerCase()}</p>
          </div>
        </Card>

        {/* Block list + add form */}
        <div className="col-span-2 flex flex-col gap-3">
          <Card>
            <SLabel>{t.live}</SLabel>
            <div className="flex flex-col gap-2 mt-3">
              {blocks.map(b => (
                <div key={b.id} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${b.done ? "bg-white/[0.02] border-white/[0.05] opacity-55" : "bg-white/[0.04] border-white/[0.08]"}`}>
                  <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: b.color }} />
                  {eId === b.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Inp value={eLabel} onChange={setELabel} className="flex-1 text-xs py-1" />
                      <Inp value={eDur} onChange={setEDur} className="w-14 text-xs py-1" placeholder="min" />
                      <Btn onClick={saveEdit} variant="primary">{t.save}</Btn>
                      <Btn onClick={() => setEId(null)}>{t.cancel}</Btn>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${b.done ? "text-white/40 line-through" : "text-white"}`}>{b.label}</p>
                        <p className="text-white/30 text-[10px]">{b.duration} {t.min}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Btn onClick={() => toggle(b.id)} variant={b.done ? "ghost" : "primary"} className="text-[10px] px-2 py-1">
                          {b.done ? t.pending : t.done}
                        </Btn>
                        <button onClick={() => startEdit(b)} className="p-1.5 text-white/30 hover:text-white/70 transition-colors"><Ic.Edit /></button>
                        <button onClick={() => del(b.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors"><Ic.Trash /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {blocks.length === 0 && <p className="text-white/25 text-sm text-center py-6">No blocks yet.</p>}
            </div>
          </Card>
          <Card>
            <SLabel>{t.addBlock}</SLabel>
            <div className="flex items-center gap-2 mt-3">
              <Inp value={nLabel} onChange={setNLabel} placeholder={t.blockName} className="flex-1" />
              <Inp value={nDur} onChange={setNDur} placeholder={t.duration} className="w-24" />
              <Btn onClick={addBlock} variant="primary" disabled={!nLabel.trim()}><Ic.Plus />{t.add}</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VIDEO MANAGER
// ═══════════════════════════════════════════════════════════════
function VideoManagerView({ videos, setVideos, t }: {
  videos: VideoIdea[]; setVideos: (v: VideoIdea[] | ((p: VideoIdea[]) => VideoIdea[])) => void; t: Tr;
}) {
  const [nTitle, setNTitle] = useState("");
  const add = () => {
    if (!nTitle.trim()) return;
    setVideos(p => [{ id: `v${Date.now()}`, title: nTitle.trim(), color: PALETTE[p.length % PALETTE.length], createdAt: new Date().toISOString().slice(0, 10) }, ...p]);
    setNTitle("");
  };
  const del = (id: string) => setVideos(p => p.filter(v => v.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-white text-xl font-semibold">{t.videoManager}</h2>
        <p className="text-white/40 text-sm mt-0.5">{videos.length} {t.videoIdeas}</p>
      </div>
      <Card>
        <SLabel>{t.addIdea}</SLabel>
        <div className="flex items-center gap-2 mt-3">
          <Inp value={nTitle} onChange={setNTitle} placeholder={t.videoTitle} className="flex-1" />
          <Btn onClick={add} variant="primary" disabled={!nTitle.trim()}><Ic.Plus />{t.add}</Btn>
        </div>
      </Card>
      {videos.length === 0 ? (
        <Card><p className="text-white/25 text-sm text-center py-8">{t.noIdeas}</p></Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {videos.map(v => (
            <Card key={v.id} className="flex items-center gap-3 py-3 px-4">
              <div className="w-24 h-14 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden" style={{ background: `${v.color}22` }}>
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${v.color}33,transparent)` }} />
                <span className="relative text-white/50"><Ic.Play /></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{v.title}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{v.createdAt}</p>
              </div>
              <button onClick={() => del(v.id)} className="p-1.5 text-white/25 hover:text-red-400 transition-colors flex-shrink-0"><Ic.Trash /></button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════════════════════
function AnalyticsView({ currency, t }: { currency: Currency; t: Tr }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-white text-xl font-semibold">{t.analytics}</h2>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t.topPeakViewers, value: "2,310" },
          { label: t.totalStreams, value: "38" },
          { label: t.avgDuration, value: "3h 12m" },
          { label: t.revenue, value: fmtCur(Math.round(REVENUE.total * FX[currency]), currency) },
        ].map(s => (
          <Card key={s.label} className="py-3 px-4">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-white text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>
      <BarChart t={t} />
      <LineChart t={t} wide />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════════════════════════════
function HistoryView({ t }: { t: Tr }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-white text-xl font-semibold">{t.history}</h2>
      <Card>
        <SLabel>{t.streamHistory}</SLabel>
        <table className="w-full mt-3">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {[t.date, t.title, t.dur, t.viewers].map(h => (
                <th key={h} className="text-left text-white/30 text-[10px] uppercase tracking-widest pb-2 pr-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEF_HIST.map(r => (
              <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4 text-white/40 text-xs">{r.date}</td>
                <td className="py-3 pr-4 text-white text-sm font-medium">{r.title}</td>
                <td className="py-3 pr-4 text-white/50 text-xs">{r.duration}</td>
                <td className="py-3 text-violet-300 text-sm font-semibold">{r.viewers.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════
function SettingsView({ lang, setLang, currency, setCurrency, platform, setPlatform, t }: {
  lang: Language; setLang: (l: Language) => void;
  currency: Currency; setCurrency: (c: Currency) => void;
  platform: Platform; setPlatform: (p: Platform) => void; t: Tr;
}) {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <h2 className="text-white text-xl font-semibold">{t.settingsTitle}</h2>
      <Card className="flex flex-col gap-5">
        <p className="text-white/50 text-sm">{t.preferencesLabel}</p>
        {[
          { label: t.languageLabel, node: <Toggle<Language> opts={["EN", "PT", "JA"]} val={lang} set={setLang} /> },
          { label: t.currencyLabel, node: <Toggle<Currency> opts={["JPY", "USD", "EUR"]} val={currency} set={setCurrency} /> },
          { label: t.platformLabel, node: <Toggle<Platform> opts={["Twitch", "YouTube"]} val={platform} set={setPlatform} red={platform === "YouTube"} /> },
        ].map(({ label, node }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-white/[0.05]">
            <p className="text-white text-sm">{label}</p>
            {node}
          </div>
        ))}
        <Btn onClick={save} variant="primary" className="self-start">
          {saved ? <><Ic.Check />{t.saved}</> : t.savePreferences}
        </Btn>
      </Card>
      <Card>
        <SLabel>{t.about}</SLabel>
        <p className="text-white text-sm mt-2">Creator Flow Studio</p>
        <p className="text-white/30 text-xs mt-1">Version 1.0.0-mvp · React + TypeScript + Tailwind</p>
        <p className="text-white/20 text-[10px] mt-3 leading-relaxed">
          All data is persisted in localStorage. No external API connected yet.
          Preferences change take effect instantly across all views.
        </p>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useLS<View>("cf_view", "dashboard");
  const [lang, setLang] = useLS<Language>("cf_lang", "EN");
  const [currency, setCurrency] = useLS<Currency>("cf_curr", "JPY");
  const [platform, setPlatform] = useLS<Platform>("cf_plat", "Twitch");
  const [liveBlocks, setLiveBlocks] = useLS<LiveBlock[]>("cf_live", DEF_BLOCKS);
  const [videoIdeas, setVideoIdeas] = useLS<VideoIdea[]>("cf_vids", DEF_VIDEOS);

  const t = T[lang];

  useEffect(() => { }, [platform]);

  const renderView = () => {
    switch (view) {
      case "dashboard": return <DashboardView currency={currency} t={t} liveBlocks={liveBlocks} />;
      case "live": return <LivePlannerView blocks={liveBlocks} setBlocks={setLiveBlocks} t={t} />;
      case "video": return <VideoManagerView videos={videoIdeas} setVideos={setVideoIdeas} t={t} />;
      case "analytics": return <AnalyticsView currency={currency} t={t} />;
      case "history": return <HistoryView t={t} />;
      case "settings": return <SettingsView lang={lang} setLang={setLang} currency={currency} setCurrency={setCurrency} platform={platform} setPlatform={setPlatform} t={t} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0f] text-white overflow-hidden" style={{ fontFamily: "system-ui,sans-serif" }}>
      <Sidebar view={view} setView={setView} t={t} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header lang={lang} setLang={setLang} currency={currency} setCurrency={setCurrency} platform={platform} setPlatform={setPlatform} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5">{renderView()}</main>
      </div>
    </div>
  );
}
