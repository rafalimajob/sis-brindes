import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, ArrowLeftRight, Boxes, FileBarChart2,
  Search, Sun, Moon, Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2, Circle, Download, Menu, Paperclip, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

/* ------------------------------------------------------------------ */
/* THEME                                                               */
/* ------------------------------------------------------------------ */
const ThemeCtx = createContext(null);
const useTheme = () => useContext(ThemeCtx);

const PALETTE = {
  primary: "#3E4C6E",     // grafite-azul
  primaryDark: "#2A3350",
  accent: "#E86F3B",      // laranja-sinal (compras/atenção)
  ok: "#1F9D6E",          // verde estoque
  warn: "#D9A441",        // âmbar mínimo
  crit: "#D6503F",        // vermelho crítico
  purple: "#7C6FCB",      // kits
};

function tw(isDark, lightCls, darkCls) {
  return isDark ? darkCls : lightCls;
}

/* ------------------------------------------------------------------ */
/* STORAGE HELPERS                                                     */
/* ------------------------------------------------------------------ */
async function loadKey(key, fallback) {
  try {
    const r = await window.storage.get(key, false);
    return r ? JSON.parse(r.value) : fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("storage save failed", key, e);
  }
}

/* ------------------------------------------------------------------ */
/* SEED DATA                                                            */
/* ------------------------------------------------------------------ */
const STATUS_LIST = [
  "Rascunho", "Em elaboração", "Aguardando cotação", "Cotação recebida",
  "Aguardando emissão da OC", "Pedido enviado ao fornecedor", "Em produção",
  "Em transporte", "Entregue", "Cancelado"
];
const STATUS_COLOR = {
  "Rascunho": "#94A3B8", "Em elaboração": "#94A3B8", "Aguardando cotação": PALETTE.warn,
  "Cotação recebida": PALETTE.warn, "Aguardando emissão da OC": PALETTE.accent,
  "Pedido enviado ao fornecedor": PALETTE.accent, "Em produção": PALETTE.purple,
  "Em transporte": PALETTE.purple, "Entregue": PALETTE.ok, "Cancelado": PALETTE.crit
};
const ENTRADA_TYPES = ["Compra", "Devolução", "Ajuste de estoque"];
const SAIDA_TYPES = ["Evento", "Brinde", "Kit", "Consumo interno", "Ajuste"];

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthsAgo = (n) => { const d = new Date(); d.setMonth(d.getMonth() - n); return d.toISOString().slice(0, 10); };
const uid = () => Math.random().toString(36).slice(2, 10);

const SEED_ORDERS = [
  { id: uid(), item: "Camiseta institucional P/M/G", oc: "OC-1042", project: "Trote Solidário 2026", status: "Em transporte", req: monthsAgo(1), exp: todayISO(), deliv: "", notes: "Fornecedor Confecções Vitória", attachments: [] },
  { id: uid(), item: "Ecobag personalizada", oc: "OC-1039", project: "Feira de Profissões", status: "Aguardando cotação", req: monthsAgo(1), exp: monthsAgo(-1), deliv: "", notes: "", attachments: [] },
  { id: uid(), item: "Blocos de anotação kraft", oc: "OC-1030", project: "Onboarding Calouros", status: "Entregue", req: monthsAgo(2), exp: monthsAgo(1), deliv: monthsAgo(1), notes: "", attachments: [] },
  { id: uid(), item: "Squeeze inox 500ml", oc: "OC-1044", project: "Trote Solidário 2026", status: "Pedido enviado ao fornecedor", req: "2026-06-20", exp: "2026-06-28", deliv: "", notes: "Atraso do fornecedor", attachments: [] },
];
const SEED_STOCK = [
  { code: "MKT-0001", name: "Camiseta institucional", category: "Camisetas", qty: 42, min: 50, ideal: 150, lastCost: 18.9, lastPurchase: monthsAgo(1), location: "Almox A1" },
  { code: "MKT-0002", name: "Ecobag personalizada", category: "Brindes", qty: 120, min: 40, ideal: 100, lastCost: 6.5, lastPurchase: monthsAgo(2), location: "Almox A2" },
  { code: "MKT-0003", name: "Squeeze inox 500ml", category: "Brindes", qty: 18, min: 30, ideal: 80, lastCost: 22.0, lastPurchase: "2026-06-20", location: "Almox B1" },
  { code: "MKT-0004", name: "Bloco de anotação kraft", category: "Materiais Gráficos", qty: 260, min: 60, ideal: 200, lastCost: 3.2, lastPurchase: monthsAgo(1), location: "Almox A3" },
  { code: "MKT-0005", name: "Caneta institucional", category: "Brindes", qty: 300, min: 100, ideal: 300, lastCost: 1.4, lastPurchase: monthsAgo(3), location: "Almox A3" },
];
const SEED_MOV = [
  { id: uid(), date: monthsAgo(1), type: "Compra", item: "MKT-0001", qty: 100, project: "-", notes: "Reposição trimestral" },
  { id: uid(), date: monthsAgo(1), type: "Evento", item: "MKT-0001", qty: -58, project: "Onboarding Calouros", notes: "" },
  { id: uid(), date: "2026-06-20", type: "Compra", item: "MKT-0003", qty: 50, project: "-", notes: "" },
  { id: uid(), date: "2026-06-25", type: "Brinde", item: "MKT-0003", qty: -32, project: "Feira de Profissões", notes: "" },
];
const SEED_KITS = [
  { id: uid(), name: "Kit Boas-vindas", items: [{ code: "MKT-0001", qty: 1 }, { code: "MKT-0002", qty: 1 }, { code: "MKT-0004", qty: 1 }, { code: "MKT-0005", qty: 1 }] },
];

/* ------------------------------------------------------------------ */
/* SMALL UI PRIMITIVES                                                  */
/* ------------------------------------------------------------------ */
function Badge({ color, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + "1A", color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  const { dark } = useTheme();
  return (
    <div className={`rounded-2xl border p-5 ${tw(dark, "bg-white border-slate-200", "bg-slate-900 border-slate-800")} ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", className = "", type = "button" }) {
  const base = "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition active:scale-[0.97]";
  const variants = {
    primary: "text-white shadow-sm",
    ghost: "bg-transparent hover:bg-slate-500/10",
    danger: "text-white",
  };
  const style = variant === "primary" ? { backgroundColor: PALETTE.primary } : variant === "danger" ? { backgroundColor: PALETTE.crit } : {};
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} style={style}>
      {children}
    </button>
  );
}

function Input({ label, className = "", ...props }) {
  const { dark } = useTheme();
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className={tw(dark, "text-slate-600", "text-slate-400")}>{label}</span>}
      <input {...props} className={`px-3 py-2 rounded-lg border outline-none text-sm ${tw(dark, "bg-white border-slate-300 focus:border-slate-500", "bg-slate-800 border-slate-700 focus:border-slate-500 text-slate-100")} ${className}`} />
    </label>
  );
}

function Select({ label, children, className = "", ...props }) {
  const { dark } = useTheme();
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className={tw(dark, "text-slate-600", "text-slate-400")}>{label}</span>}
      <select {...props} className={`px-3 py-2 rounded-lg border outline-none text-sm ${tw(dark, "bg-white border-slate-300", "bg-slate-800 border-slate-700 text-slate-100")} ${className}`}>
        {children}
      </select>
    </label>
  );
}

function TextArea({ label, className = "", ...props }) {
  const { dark } = useTheme();
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className={tw(dark, "text-slate-600", "text-slate-400")}>{label}</span>}
      <textarea {...props} className={`px-3 py-2 rounded-lg border outline-none text-sm ${tw(dark, "bg-white border-slate-300", "bg-slate-800 border-slate-700 text-slate-100")} ${className}`} />
    </label>
  );
}

function Modal({ title, onClose, children, wide }) {
  const { dark } = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,17,20,0.55)" }}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl border shadow-xl max-h-[88vh] overflow-y-auto ${tw(dark, "bg-white border-slate-200", "bg-slate-900 border-slate-800")}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${tw(dark, "border-slate-200", "border-slate-800")}`}>
          <h3 className={`font-semibold ${tw(dark, "text-slate-800", "text-slate-100")}`}>{title}</h3>
          <button onClick={onClose} className={tw(dark, "text-slate-400 hover:text-slate-700", "text-slate-500 hover:text-slate-200")}><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function StockLevelDot({ item }) {
  const status = item.qty < item.min ? "crit" : item.qty < item.min * 1.3 ? "warn" : "ok";
  const map = { crit: [PALETTE.crit, "Abaixo do mínimo"], warn: [PALETTE.warn, "Próximo do mínimo"], ok: [PALETTE.ok, "Estoque adequado"] };
  const [color, label] = map[status];
  return <Badge color={color}>{label}</Badge>;
}

function csvDownload(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* APP                                                                  */
/* ------------------------------------------------------------------ */
export default function App() {
  const [dark, setDark] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalQuery, setGlobalQuery] = useState("");

  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [movs, setMovs] = useState([]);
  const [kits, setKits] = useState([]);

  useEffect(() => {
    (async () => {
      const [o, s, m, k] = await Promise.all([
        loadKey("mkt:orders", null), loadKey("mkt:stock", null),
        loadKey("mkt:movs", null), loadKey("mkt:kits", null),
      ]);
      setOrders(o ?? SEED_ORDERS);
      setStock(s ?? SEED_STOCK);
      setMovs(m ?? SEED_MOV);
      setKits(k ?? SEED_KITS);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) saveKey("mkt:orders", orders); }, [orders, loaded]);
  useEffect(() => { if (loaded) saveKey("mkt:stock", stock); }, [stock, loaded]);
  useEffect(() => { if (loaded) saveKey("mkt:movs", movs); }, [movs, loaded]);
  useEffect(() => { if (loaded) saveKey("mkt:kits", kits); }, [kits, loaded]);

  const theme = { dark };

  const applyMovement = useCallback((mov) => {
    setStock(prev => prev.map(it => it.code === mov.item ? { ...it, qty: it.qty + mov.qty } : it));
    setMovs(prev => [{ ...mov, id: uid() }, ...prev]);
  }, []);

  const registerKitOutput = useCallback((kit, qty, project, notes) => {
    const newMovs = kit.items.map(ci => ({
      id: uid(), date: todayISO(), type: "Kit", item: ci.code, qty: -(ci.qty * qty),
      project: project || kit.name, notes: notes || `Saída de ${qty}x ${kit.name}`
    }));
    setStock(prev => prev.map(it => {
      const line = kit.items.find(ci => ci.code === it.code);
      return line ? { ...it, qty: it.qty - line.qty * qty } : it;
    }));
    setMovs(prev => [...newMovs, ...prev]);
  }, []);

  if (!loaded) return null;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pedidos", label: "Pedidos de Compra", icon: ShoppingCart },
    { id: "estoque", label: "Estoque", icon: Package },
    { id: "movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
    { id: "kits", label: "Kits", icon: Boxes },
    { id: "relatorios", label: "Relatórios", icon: FileBarChart2 },
  ];

  const bg = tw(dark, "bg-slate-50", "bg-slate-950");
  const text = tw(dark, "text-slate-800", "text-slate-100");
  const border = tw(dark, "border-slate-200", "border-slate-800");

  return (
    <ThemeCtx.Provider value={theme}>
      <div className={`min-h-screen flex ${bg} ${text}`} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? "w-60" : "w-16"} shrink-0 border-r transition-all duration-200 ${border} flex flex-col`}>
          <div className={`flex items-center gap-2 px-4 h-16 border-b ${border}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: PALETTE.primary }}>M</div>
            {sidebarOpen && <span className="font-semibold text-sm truncate">Marketing Ops</span>}
          </div>
          <nav className="flex-1 py-3 px-2 space-y-1">
            {NAV.map(n => {
              const Icon = n.icon;
              const active = tab === n.id;
              return (
                <button key={n.id} onClick={() => setTab(n.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${active ? "text-white" : tw(dark, "text-slate-600 hover:bg-slate-200/60", "text-slate-400 hover:bg-slate-800")}`}
                  style={active ? { backgroundColor: PALETTE.primary } : {}}>
                  <Icon size={18} className="shrink-0" />
                  {sidebarOpen && <span className="truncate">{n.label}</span>}
                </button>
              );
            })}
          </nav>
          <button onClick={() => setSidebarOpen(v => !v)} className={`flex items-center justify-center h-12 border-t ${border} ${tw(dark, "text-slate-400 hover:bg-slate-100", "text-slate-500 hover:bg-slate-900")}`}>
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className={`h-16 border-b flex items-center gap-4 px-6 ${border}`}>
            <button onClick={() => setSidebarOpen(v => !v)} className="md:hidden"><Menu size={20} /></button>
            <div className={`flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-xl border ${tw(dark, "bg-white border-slate-200", "bg-slate-900 border-slate-800")}`}>
              <Search size={16} className={tw(dark, "text-slate-400", "text-slate-500")} />
              <input value={globalQuery} onChange={e => setGlobalQuery(e.target.value)} placeholder="Buscar pedidos, itens, projetos, OCs, kits..."
                className={`flex-1 bg-transparent outline-none text-sm ${tw(dark, "placeholder-slate-400", "placeholder-slate-600")}`} />
            </div>
            <div className="flex-1" />
            <button onClick={() => setDark(v => !v)} className={`p-2 rounded-lg ${tw(dark, "hover:bg-slate-200/60", "hover:bg-slate-800")}`}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: PALETTE.accent }}>RF</div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {globalQuery.trim() ? (
              <GlobalSearch query={globalQuery} orders={orders} stock={stock} kits={kits}
                onOpen={(t) => { setTab(t); setGlobalQuery(""); }} />
            ) : (
              <>
                {tab === "dashboard" && <Dashboard orders={orders} stock={stock} movs={movs} setTab={setTab} />}
                {tab === "pedidos" && <Pedidos orders={orders} setOrders={setOrders} />}
                {tab === "estoque" && <Estoque stock={stock} setStock={setStock} />}
                {tab === "movimentacoes" && <Movimentacoes movs={movs} stock={stock} applyMovement={applyMovement} />}
                {tab === "kits" && <Kits kits={kits} setKits={setKits} stock={stock} registerKitOutput={registerKitOutput} />}
                {tab === "relatorios" && <Relatorios orders={orders} stock={stock} movs={movs} />}
              </>
            )}
          </main>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* GLOBAL SEARCH                                                        */
/* ------------------------------------------------------------------ */
function GlobalSearch({ query, orders, stock, kits, onOpen }) {
  const q = query.toLowerCase();
  const oR = orders.filter(o => [o.item, o.oc, o.project, o.status].join(" ").toLowerCase().includes(q));
  const sR = stock.filter(s => [s.name, s.category, s.code].join(" ").toLowerCase().includes(q));
  const kR = kits.filter(k => k.name.toLowerCase().includes(q));
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-lg font-semibold">Resultados para "{query}"</h2>
      {oR.length > 0 && (
        <Card>
          <div className="font-medium mb-3 text-sm">Pedidos ({oR.length})</div>
          <div className="space-y-2">
            {oR.map(o => (
              <div key={o.id} onClick={() => onOpen("pedidos")} className="flex items-center justify-between text-sm cursor-pointer hover:opacity-70">
                <span>{o.item} · <span className="opacity-60">{o.oc}</span></span>
                <Badge color={STATUS_COLOR[o.status]}>{o.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
      {sR.length > 0 && (
        <Card>
          <div className="font-medium mb-3 text-sm">Estoque ({sR.length})</div>
          <div className="space-y-2">
            {sR.map(s => (
              <div key={s.code} onClick={() => onOpen("estoque")} className="flex items-center justify-between text-sm cursor-pointer hover:opacity-70">
                <span>{s.name} · <span className="opacity-60">{s.code}</span></span>
                <span className="opacity-70">{s.qty} un.</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      {kR.length > 0 && (
        <Card>
          <div className="font-medium mb-3 text-sm">Kits ({kR.length})</div>
          {kR.map(k => (
            <div key={k.id} onClick={() => onOpen("kits")} className="text-sm cursor-pointer hover:opacity-70">{k.name}</div>
          ))}
        </Card>
      )}
      {oR.length + sR.length + kR.length === 0 && <p className="opacity-60 text-sm">Nenhum resultado encontrado.</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DASHBOARD                                                            */
/* ------------------------------------------------------------------ */
function Dashboard({ orders, stock, movs, setTab }) {
  const { dark } = useTheme();
  const today = todayISO();
  const emAndamento = orders.filter(o => o.status !== "Entregue" && o.status !== "Cancelado").length;
  const atrasados = orders.filter(o => o.status !== "Entregue" && o.status !== "Cancelado" && o.exp && o.exp < today).length;
  const thisMonth = today.slice(0, 7);
  const entreguesMes = orders.filter(o => o.status === "Entregue" && o.deliv?.slice(0, 7) === thisMonth).length;
  const totalItens = stock.reduce((a, s) => a + s.qty, 0);
  const abaixoMin = stock.filter(s => s.qty < s.min).length;

  const statusData = STATUS_LIST.map(s => ({ status: s, count: orders.filter(o => o.status === s).length })).filter(d => d.count > 0);

  const evolMap = {};
  orders.forEach(o => { const m = o.req?.slice(0, 7); if (m) evolMap[m] = (evolMap[m] || 0) + 1; });
  const evolData = Object.keys(evolMap).sort().map(m => ({ month: m, pedidos: evolMap[m] }));

  const projMap = {};
  movs.filter(m => m.qty < 0).forEach(m => { const p = m.project || "Outros"; projMap[p] = (projMap[p] || 0) + Math.abs(m.qty); });
  const projData = Object.entries(projMap).map(([project, qty]) => ({ project, qty }));

  const cardBase = tw(dark, "bg-white border-slate-200", "bg-slate-900 border-slate-800");

  const StatCard = ({ label, value, color, icon: Icon, onClick }) => (
    <Card className={`flex items-center justify-between cursor-pointer hover:shadow-md transition ${cardBase}`}>
      <div onClick={onClick}>
        <div className={`text-xs mb-1 ${tw(dark, "text-slate-500", "text-slate-400")}`}>{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "1A" }}>
        <Icon size={18} style={{ color }} />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Visão geral</h1>
        <p className={`text-sm ${tw(dark, "text-slate-500", "text-slate-400")}`}>Painel executivo do Departamento de Marketing</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Pedidos em andamento" value={emAndamento} color={PALETTE.primary} icon={ShoppingCart} onClick={() => setTab("pedidos")} />
        <StatCard label="Pedidos atrasados" value={atrasados} color={PALETTE.crit} icon={AlertTriangle} onClick={() => setTab("pedidos")} />
        <StatCard label="Entregues no mês" value={entreguesMes} color={PALETTE.ok} icon={CheckCircle2} onClick={() => setTab("pedidos")} />
        <StatCard label="Itens em estoque" value={totalItens} color={PALETTE.purple} icon={Package} onClick={() => setTab("estoque")} />
        <StatCard label="Abaixo do mínimo" value={abaixoMin} color={PALETTE.warn} icon={AlertTriangle} onClick={() => setTab("estoque")} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-medium text-sm mb-4">Pedidos por status</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="status" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {statusData.map((d, i) => <Cell key={i} fill={STATUS_COLOR[d.status]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="font-medium text-sm mb-4">Evolução de pedidos (por mês de solicitação)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="pedidos" stroke={PALETTE.primary} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="font-medium text-sm mb-4">Consumo por Projeto/Campanha</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projData}>
              <XAxis dataKey="project" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="qty" fill={PALETTE.accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="font-medium text-sm mb-4">Itens com estoque crítico</div>
          <div className="space-y-2">
            {stock.filter(s => s.qty < s.min).slice(0, 6).map(s => (
              <div key={s.code} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span style={{ color: PALETTE.crit }}>{s.qty} / mín. {s.min}</span>
              </div>
            ))}
            {stock.filter(s => s.qty < s.min).length === 0 && <p className="text-sm opacity-60">Nenhum item crítico.</p>}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-medium text-sm mb-3">Últimos pedidos cadastrados</div>
          <div className="space-y-2">
            {[...orders].slice(-5).reverse().map(o => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{o.item}</span>
                <Badge color={STATUS_COLOR[o.status]}>{o.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="font-medium text-sm mb-3">Últimas movimentações</div>
          <div className="space-y-2">
            {[...movs].slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  {m.qty > 0 ? <ArrowUpRight size={14} color={PALETTE.ok} /> : <ArrowDownRight size={14} color={PALETTE.crit} />}
                  {m.type} · {stock.find(s => s.code === m.item)?.name || m.item}
                </span>
                <span className="opacity-70">{m.qty > 0 ? "+" : ""}{m.qty}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PEDIDOS                                                              */
/* ------------------------------------------------------------------ */
function Pedidos({ orders, setOrders }) {
  const { dark } = useTheme();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [sortKey, setSortKey] = useState("req");
  const [sortDir, setSortDir] = useState("desc");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    let list = orders.filter(o =>
      (statusFilter === "Todos" || o.status === statusFilter) &&
      [o.item, o.oc, o.project].join(" ").toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return (a[sortKey] || "") > (b[sortKey] || "") ? dir : -dir;
    });
    return list;
  }, [orders, search, statusFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const saveOrder = (data) => {
    if (data.id) setOrders(prev => prev.map(o => o.id === data.id ? data : o));
    else setOrders(prev => [...prev, { ...data, id: uid() }]);
    setShowModal(false); setEditing(null);
  };
  const removeOrder = (id) => setOrders(prev => prev.filter(o => o.id !== id));

  const th = (label, key) => (
    <th onClick={() => toggleSort(key)} className="text-left px-3 py-2 text-xs font-medium opacity-60 cursor-pointer select-none whitespace-nowrap">
      {label} {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Pedidos de Compra</h1>
        <Button onClick={() => { setEditing(null); setShowModal(true); }}><Plus size={16} /> Novo pedido</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar por item, OC ou projeto..." value={search} onChange={e => setSearch(e.target.value)} className="w-72" />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-56">
          <option>Todos</option>
          {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
        </Select>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={tw(dark, "bg-slate-50", "bg-slate-800/50")}>
            <tr>
              {th("Item", "item")}{th("OC", "oc")}{th("Projeto/Campanha", "project")}{th("Status", "status")}
              {th("Solicitação", "req")}{th("Previsão", "exp")}{th("Entrega", "deliv")}
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const atrasado = o.status !== "Entregue" && o.status !== "Cancelado" && o.exp && o.exp < todayISO();
              return (
                <tr key={o.id} className={`border-t ${tw(dark, "border-slate-100", "border-slate-800")} ${atrasado ? "bg-red-500/5" : ""}`}>
                  <td className="px-3 py-2.5">{o.item}</td>
                  <td className="px-3 py-2.5 opacity-70">{o.oc}</td>
                  <td className="px-3 py-2.5 opacity-70">{o.project}</td>
                  <td className="px-3 py-2.5"><Badge color={STATUS_COLOR[o.status]}>{o.status}</Badge></td>
                  <td className="px-3 py-2.5 opacity-70">{o.req}</td>
                  <td className={`px-3 py-2.5 ${atrasado ? "font-medium" : "opacity-70"}`} style={atrasado ? { color: PALETTE.crit } : {}}>{o.exp}</td>
                  <td className="px-3 py-2.5 opacity-70">{o.deliv || "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => { setEditing(o); setShowModal(true); }} className="opacity-60 hover:opacity-100"><Edit2 size={15} /></button>
                      <button onClick={() => removeOrder(o.id)} className="opacity-60 hover:opacity-100" style={{ color: PALETTE.crit }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 opacity-50">Nenhum pedido encontrado.</td></tr>}
          </tbody>
        </table>
      </Card>

      {showModal && <OrderModal order={editing} onClose={() => setShowModal(false)} onSave={saveOrder} />}
    </div>
  );
}

function OrderModal({ order, onClose, onSave }) {
  const [form, setForm] = useState(order || {
    item: "", oc: "", project: "", status: "Rascunho", req: todayISO(), exp: "", deliv: "", notes: "", attachments: []
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleFiles = (e) => {
    const names = Array.from(e.target.files || []).map(f => f.name);
    set("attachments", [...(form.attachments || []), ...names]);
  };
  return (
    <Modal title={order ? "Editar pedido" : "Novo pedido de compra"} onClose={onClose} wide>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input label="Nome do item" value={form.item} onChange={e => set("item", e.target.value)} />
        <Input label="Número da OC" value={form.oc} onChange={e => set("oc", e.target.value)} />
        <Input label="Projeto/Campanha" value={form.project} onChange={e => set("project", e.target.value)} />
        <Select label="Status" value={form.status} onChange={e => set("status", e.target.value)}>
          {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Input label="Data da solicitação" type="date" value={form.req} onChange={e => set("req", e.target.value)} />
        <Input label="Previsão de entrega" type="date" value={form.exp} onChange={e => set("exp", e.target.value)} />
        <Input label="Data efetiva de entrega" type="date" value={form.deliv} onChange={e => set("deliv", e.target.value)} />
        <div className="flex flex-col gap-1 text-sm">
          <span className="opacity-60">Anexos</span>
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed cursor-pointer text-xs opacity-70">
            <Paperclip size={14} /> Arraste ou clique para anexar
            <input type="file" multiple className="hidden" onChange={handleFiles} />
          </label>
          {form.attachments?.length > 0 && <div className="text-xs opacity-60">{form.attachments.join(", ")}</div>}
        </div>
      </div>
      <div className="mt-3">
        <TextArea label="Observações" rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} className="w-full" />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(form)}>Salvar pedido</Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* ESTOQUE                                                              */
/* ------------------------------------------------------------------ */
function Estoque({ stock, setStock }) {
  const { dark } = useTheme();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = stock.filter(s => [s.name, s.category, s.code].join(" ").toLowerCase().includes(search.toLowerCase()));

  const saveItem = (data) => {
    if (editing) setStock(prev => prev.map(s => s.code === editing.code ? data : s));
    else {
      const nextNum = stock.length + 1;
      const code = `MKT-${String(nextNum).padStart(4, "0")}`;
      setStock(prev => [...prev, { ...data, code }]);
    }
    setShowModal(false); setEditing(null);
  };
  const removeItem = (code) => setStock(prev => prev.filter(s => s.code !== code));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Estoque</h1>
        <Button onClick={() => { setEditing(null); setShowModal(true); }}><Plus size={16} /> Novo item</Button>
      </div>
      <Input placeholder="Buscar por nome, código ou categoria..." value={search} onChange={e => setSearch(e.target.value)} className="w-80" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <Card key={s.code}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs opacity-50">{s.code} · {s.category}</div>
                <div className="font-medium">{s.name}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(s); setShowModal(true); }} className="opacity-60 hover:opacity-100"><Edit2 size={14} /></button>
                <button onClick={() => removeItem(s.code)} className="opacity-60 hover:opacity-100" style={{ color: PALETTE.crit }}><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-2xl font-semibold">{s.qty}</div>
                <div className="text-xs opacity-50">mín. {s.min} · ideal {s.ideal}</div>
              </div>
              <StockLevelDot item={s} />
            </div>
            <div className={`mt-3 pt-3 border-t text-xs opacity-60 flex justify-between ${tw(dark, "border-slate-100", "border-slate-800")}`}>
              <span>Local: {s.location}</span>
              <span>Últ. custo: R$ {Number(s.lastCost).toFixed(2)}</span>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="opacity-50 text-sm">Nenhum item encontrado.</p>}
      </div>

      {showModal && <StockModal item={editing} onClose={() => setShowModal(false)} onSave={saveItem} />}
    </div>
  );
}

function StockModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    name: "", category: "Brindes", qty: 0, min: 0, ideal: 0, lastCost: 0, lastPurchase: todayISO(), location: ""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal title={item ? "Editar item de estoque" : "Novo item de estoque"} onClose={onClose} wide>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input label="Nome" value={form.name} onChange={e => set("name", e.target.value)} />
        <Input label="Categoria" list="categorias" value={form.category} onChange={e => set("category", e.target.value)} />
        <datalist id="categorias">
          <option>Brindes</option><option>Materiais Gráficos</option><option>Camisetas</option><option>Kits</option><option>Outros</option>
        </datalist>
        <Input label="Quantidade disponível" type="number" value={form.qty} onChange={e => set("qty", Number(e.target.value))} />
        <Input label="Estoque mínimo" type="number" value={form.min} onChange={e => set("min", Number(e.target.value))} />
        <Input label="Estoque ideal" type="number" value={form.ideal} onChange={e => set("ideal", Number(e.target.value))} />
        <Input label="Último custo (R$)" type="number" step="0.01" value={form.lastCost} onChange={e => set("lastCost", Number(e.target.value))} />
        <Input label="Data da última compra" type="date" value={form.lastPurchase} onChange={e => set("lastPurchase", e.target.value)} />
        <Input label="Localização física" value={form.location} onChange={e => set("location", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(form)}>Salvar item</Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* MOVIMENTAÇÕES                                                        */
/* ------------------------------------------------------------------ */
function Movimentacoes({ movs, stock, applyMovement }) {
  const { dark } = useTheme();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Movimentações</h1>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> Nova movimentação</Button>
      </div>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={tw(dark, "bg-slate-50", "bg-slate-800/50")}>
            <tr>
              <th className="text-left px-3 py-2 text-xs font-medium opacity-60">Data</th>
              <th className="text-left px-3 py-2 text-xs font-medium opacity-60">Tipo</th>
              <th className="text-left px-3 py-2 text-xs font-medium opacity-60">Item</th>
              <th className="text-left px-3 py-2 text-xs font-medium opacity-60">Quantidade</th>
              <th className="text-left px-3 py-2 text-xs font-medium opacity-60">Projeto/Campanha</th>
              <th className="text-left px-3 py-2 text-xs font-medium opacity-60">Observação</th>
            </tr>
          </thead>
          <tbody>
            {movs.map(m => (
              <tr key={m.id} className={`border-t ${tw(dark, "border-slate-100", "border-slate-800")}`}>
                <td className="px-3 py-2.5 opacity-70">{m.date}</td>
                <td className="px-3 py-2.5">{m.type}</td>
                <td className="px-3 py-2.5">{stock.find(s => s.code === m.item)?.name || m.item}</td>
                <td className="px-3 py-2.5 font-medium" style={{ color: m.qty > 0 ? PALETTE.ok : PALETTE.crit }}>{m.qty > 0 ? "+" : ""}{m.qty}</td>
                <td className="px-3 py-2.5 opacity-70">{m.project}</td>
                <td className="px-3 py-2.5 opacity-70">{m.notes}</td>
              </tr>
            ))}
            {movs.length === 0 && <tr><td colSpan={6} className="text-center py-8 opacity-50">Nenhuma movimentação registrada.</td></tr>}
          </tbody>
        </table>
      </Card>
      {showModal && <MovementModal stock={stock} onClose={() => setShowModal(false)} onSave={(m) => { applyMovement(m); setShowModal(false); }} />}
    </div>
  );
}

function MovementModal({ stock, onClose, onSave }) {
  const [kind, setKind] = useState("entrada");
  const [form, setForm] = useState({ date: todayISO(), type: ENTRADA_TYPES[0], item: stock[0]?.code || "", qty: 1, project: "", notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const types = kind === "entrada" ? ENTRADA_TYPES : SAIDA_TYPES;

  return (
    <Modal title="Nova movimentação" onClose={onClose}>
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setKind("entrada"); set("type", ENTRADA_TYPES[0]); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${kind === "entrada" ? "text-white" : "opacity-60"}`}
          style={kind === "entrada" ? { backgroundColor: PALETTE.ok } : { border: "1px solid currentColor" }}>Entrada</button>
        <button onClick={() => { setKind("saida"); set("type", SAIDA_TYPES[0]); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${kind === "saida" ? "text-white" : "opacity-60"}`}
          style={kind === "saida" ? { backgroundColor: PALETTE.crit } : { border: "1px solid currentColor" }}>Saída</button>
      </div>
      <div className="grid gap-3">
        <Input label="Data" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
        <Select label="Tipo" value={form.type} onChange={e => set("type", e.target.value)}>
          {types.map(t => <option key={t}>{t}</option>)}
        </Select>
        <Select label="Item" value={form.item} onChange={e => set("item", e.target.value)}>
          {stock.map(s => <option key={s.code} value={s.code}>{s.name} ({s.qty} disp.)</option>)}
        </Select>
        <Input label="Quantidade" type="number" min="1" value={form.qty} onChange={e => set("qty", Number(e.target.value))} />
        <Input label="Projeto/Campanha" value={form.project} onChange={e => set("project", e.target.value)} />
        <TextArea label="Observação" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave({ ...form, qty: kind === "entrada" ? Math.abs(form.qty) : -Math.abs(form.qty) })}>Registrar</Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* KITS                                                                 */
/* ------------------------------------------------------------------ */
function Kits({ kits, setKits, stock, registerKitOutput }) {
  const [showModal, setShowModal] = useState(false);
  const [outModal, setOutModal] = useState(null);

  const saveKit = (data) => { setKits(prev => [...prev, { ...data, id: uid() }]); setShowModal(false); };
  const removeKit = (id) => setKits(prev => prev.filter(k => k.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kits</h1>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> Novo kit</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kits.map(k => (
          <Card key={k.id}>
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium">{k.name}</div>
              <button onClick={() => removeKit(k.id)} className="opacity-60 hover:opacity-100" style={{ color: PALETTE.crit }}><Trash2 size={14} /></button>
            </div>
            <ul className="text-sm space-y-1 opacity-75 mb-3">
              {k.items.map(ci => {
                const s = stock.find(s => s.code === ci.code);
                return <li key={ci.code}>{ci.qty}x {s?.name || ci.code}</li>;
              })}
            </ul>
            <Button variant="ghost" className="w-full justify-center border" onClick={() => setOutModal(k)}>Registrar saída de kit</Button>
          </Card>
        ))}
        {kits.length === 0 && <p className="opacity-50 text-sm">Nenhum kit cadastrado.</p>}
      </div>
      {showModal && <KitModal stock={stock} onClose={() => setShowModal(false)} onSave={saveKit} />}
      {outModal && <KitOutputModal kit={outModal} onClose={() => setOutModal(null)} onSave={(qty, project, notes) => { registerKitOutput(outModal, qty, project, notes); setOutModal(null); }} />}
    </div>
  );
}

function KitModal({ stock, onClose, onSave }) {
  const [name, setName] = useState("");
  const [items, setItems] = useState([{ code: stock[0]?.code || "", qty: 1 }]);
  const addLine = () => setItems(prev => [...prev, { code: stock[0]?.code || "", qty: 1 }]);
  const setLine = (i, patch) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  const removeLine = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  return (
    <Modal title="Novo kit" onClose={onClose} wide>
      <Input label="Nome do kit" value={name} onChange={e => setName(e.target.value)} className="w-full mb-4" />
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-end">
            <Select label="Item" value={it.code} onChange={e => setLine(i, { code: e.target.value })} className="flex-1">
              {stock.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </Select>
            <Input label="Qtd." type="number" min="1" value={it.qty} onChange={e => setLine(i, { qty: Number(e.target.value) })} className="w-20" />
            <button onClick={() => removeLine(i)} className="mb-2 opacity-60 hover:opacity-100" style={{ color: PALETTE.crit }}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <Button variant="ghost" onClick={addLine} className="mt-2 border"><Plus size={14} /> Adicionar item</Button>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave({ name, items })}>Salvar kit</Button>
      </div>
    </Modal>
  );
}

function KitOutputModal({ kit, onClose, onSave }) {
  const [qty, setQty] = useState(1);
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <Modal title={`Saída de kit: ${kit.name}`} onClose={onClose}>
      <div className="grid gap-3">
        <Input label="Quantidade de kits" type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} />
        <Input label="Projeto/Campanha" value={project} onChange={e => setProject(e.target.value)} />
        <TextArea label="Observação" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <p className="text-xs opacity-60 mt-3">Isso reduzirá automaticamente o estoque de todos os itens que compõem o kit.</p>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onSave(qty, project, notes)}>Confirmar saída</Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* RELATÓRIOS                                                           */
/* ------------------------------------------------------------------ */
function Relatorios({ orders, stock, movs }) {
  const reports = [
    {
      name: "Pedidos por status", run: () => csvDownload("pedidos_por_status.csv",
        [["Status", "Quantidade"], ...STATUS_LIST.map(s => [s, orders.filter(o => o.status === s).length])])
    },
    {
      name: "Pedidos por período", run: () => csvDownload("pedidos.csv",
        [["Item", "OC", "Projeto", "Status", "Solicitação", "Previsão", "Entrega"], ...orders.map(o => [o.item, o.oc, o.project, o.status, o.req, o.exp, o.deliv])])
    },
    {
      name: "Pedidos por Projeto/Campanha", run: () => {
        const map = {}; orders.forEach(o => { map[o.project] = (map[o.project] || 0) + 1; });
        csvDownload("pedidos_por_projeto.csv", [["Projeto", "Quantidade"], ...Object.entries(map)]);
      }
    },
    {
      name: "Estoque atual", run: () => csvDownload("estoque_atual.csv",
        [["Código", "Nome", "Categoria", "Quantidade", "Mínimo", "Ideal", "Local"], ...stock.map(s => [s.code, s.name, s.category, s.qty, s.min, s.ideal, s.location])])
    },
    {
      name: "Itens abaixo do estoque mínimo", run: () => csvDownload("itens_criticos.csv",
        [["Código", "Nome", "Quantidade", "Mínimo"], ...stock.filter(s => s.qty < s.min).map(s => [s.code, s.name, s.qty, s.min])])
    },
    {
      name: "Histórico de movimentações", run: () => csvDownload("movimentacoes.csv",
        [["Data", "Tipo", "Item", "Quantidade", "Projeto", "Observação"], ...movs.map(m => [m.date, m.type, stock.find(s => s.code === m.item)?.name || m.item, m.qty, m.project, m.notes])])
    },
    {
      name: "Consumo por Projeto/Campanha", run: () => {
        const map = {}; movs.filter(m => m.qty < 0).forEach(m => { map[m.project || "Outros"] = (map[m.project || "Outros"] || 0) + Math.abs(m.qty); });
        csvDownload("consumo_por_projeto.csv", [["Projeto", "Quantidade consumida"], ...Object.entries(map)]);
      }
    },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Relatórios</h1>
      <p className="text-sm opacity-60 -mt-2">Exportação em CSV (compatível com Excel). Para PDF, abra o CSV e use "Imprimir → Salvar como PDF".</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {reports.map(r => (
          <Card key={r.name} className="flex items-center justify-between">
            <span className="text-sm font-medium">{r.name}</span>
            <Button variant="ghost" className="border" onClick={r.run}><Download size={14} /> Exportar</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
