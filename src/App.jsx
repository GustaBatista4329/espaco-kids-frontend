/*
 * ═══════════════════════════════════════════════════════════
 *  ESPAÇO KIDS — Tia Dalquí · Reforço Escolar
 *  Frontend React SPA
 * ═══════════════════════════════════════════════════════════
 *
 *  IMPORTANTE — ALTERAÇÕES NECESSÁRIAS NO BACKEND:
 *
 *  1) JwtService.java — Adicionar claims de perfil e IDs:
 *     public String gerarToken(UserDetails userDetails) {
 *         Usuario usuario = (Usuario) userDetails;
 *         var builder = JWT.create()
 *             .withSubject(usuario.getUsername())
 *             .withClaim("perfil", usuario.getPerfil().name())
 *             .withClaim("userId", usuario.getId())
 *             .withIssuedAt(Instant.now())
 *             .withExpiresAt(Instant.now().plus(2, ChronoUnit.HOURS));
 *         if (usuario.getResponsavel() != null) {
 *             builder.withClaim("responsavelId", usuario.getResponsavel().getId());
 *         }
 *         return builder.sign(getAlgorithm());
 *     }
 *
 *  2) SecurityConfig.java — Adicionar CORS:
 *     No método securityFilterChain, adicione antes do csrf:
 *       .cors(cors -> cors.configurationSource(corsConfig()))
 *
 *     E adicione o bean:
 *       @Bean
 *       public CorsConfigurationSource corsConfig() {
 *           CorsConfiguration c = new CorsConfiguration();
 *           c.setAllowedOrigins(List.of("http://localhost:5173","http://localhost:3000"));
 *           c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
 *           c.setAllowedHeaders(List.of("*"));
 *           c.setAllowCredentials(true);
 *           UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
 *           src.registerCorsConfiguration("/**", c);
 *           return src;
 *       }
 *
 *  3) Altere a URL da API abaixo (API_BASE) conforme seu ambiente.
 * ═══════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import {
  BookOpen, Users, Calendar, Clock, LogOut, Plus, ChevronRight,
  GraduationCap, UserPlus, ClipboardList, Home, Menu, X,
  Phone, AtSign, Eye, Search, Baby, Shield, Pencil, Sun, Star,
  AlertCircle, CheckCircle, Loader2, ChevronDown
} from "lucide-react";

// ─── CONFIG ────────────────────────────────────────────────
const API_BASE = "http://localhost:8080";

// ─── THEME ─────────────────────────────────────────────────
const T = {
  red: "#E53935",
  redLight: "#FFEBEE",
  redDark: "#B71C1C",
  blue: "#1565C0",
  blueLight: "#E3F2FD",
  blueDark: "#0D47A1",
  yellow: "#FFD600",
  yellowLight: "#FFFDE7",
  yellowWarm: "#FFF8E1",
  green: "#43A047",
  greenLight: "#E8F5E9",
  cream: "#FFFAF3",
  warmGray: "#5D4037",
  lightGray: "#F5F0EB",
  white: "#FFFFFF",
  textPrimary: "#3E2723",
  textSecondary: "#6D4C41",
  shadow: "0 4px 24px rgba(93,64,55,0.08)",
  shadowHover: "0 8px 32px rgba(93,64,55,0.14)",
};

// ─── JWT DECODE ────────────────────────────────────────────
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch { return null; }
}

// ─── API SERVICE ───────────────────────────────────────────
function createApi(getToken) {
  async function req(method, path, body) {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (res.status === 401) throw new Error("TOKEN_EXPIRED");
    if (res.status === 403) throw new Error("FORBIDDEN");
    if (res.status === 201 && res.headers.get("content-length") === "0") return null;
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.mensagem || `Erro ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  return {
    login: (login, senha) => req("POST", "/autenticacao/login", { login, senha }),
    cadastrarUsuario: (dto) => req("POST", "/autenticacao/cadastro", dto),
    listarResponsaveis: () => req("GET", "/responsavel"),
    cadastrarResponsavel: (dto) => req("POST", "/responsavel", dto),
    buscarAlunosDoResponsavel: (id) => req("GET", `/aluno/${id}`),
    buscarDetalhesAluno: (respId, alunoId) => req("GET", `/aluno/${respId}/${alunoId}`),
    cadastrarAluno: (dto) => req("POST", "/aluno", dto),
    cadastrarHorario: (dto) => req("POST", "/horario/cadastrar", dto),
    buscarTodosHorarios: () => req("GET", "/horario/todos"),
    buscarHorariosPorAluno: (id) => req("GET", `/horario/aluno/${id}`),
    buscarHorariosPorResponsavel: (id) => req("GET", `/horario/responsavel/${id}`),
  };
}

// ─── AUTH CONTEXT ──────────────────────────────────────────
const AuthCtx = createContext(null);
function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem("ek_token"); } catch { return null; }
  });
  const [user, setUser] = useState(() => {
    if (!token) return null;
    const d = decodeJwt(token);
    if (!d) return null;
    return { login: d.sub, perfil: d.perfil, userId: d.userId, responsavelId: d.responsavelId };
  });

  const getToken = useCallback(() => token, [token]);
  const api = useCallback(() => createApi(getToken), [getToken])();

  function login(tk) {
    sessionStorage.setItem("ek_token", tk);
    setToken(tk);
    const d = decodeJwt(tk);
    if (d) setUser({ login: d.sub, perfil: d.perfil, userId: d.userId, responsavelId: d.responsavelId });
  }
  function logout() {
    sessionStorage.removeItem("ek_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ token, user, api, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ─── TOAST SYSTEM ──────────────────────────────────────────
const ToastCtx = createContext(null);
function useToast() { return useContext(ToastCtx); }

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: "12px 20px", borderRadius: 14,
            background: t.type === "error" ? T.red : T.green,
            color: "#fff", fontSize: 14, fontWeight: 600,
            boxShadow: T.shadow, display: "flex", alignItems: "center", gap: 8,
            animation: "slideIn .3s ease",
            fontFamily: "'Nunito', sans-serif",
          }}>
            {t.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ─── SHARED COMPONENTS ─────────────────────────────────────

function Btn({ children, onClick, variant = "primary", disabled, loading, full, style: sx, ...props }) {
  const base = {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700, fontSize: 14, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 12, padding: "12px 24px", display: "inline-flex", alignItems: "center", gap: 8,
    transition: "all .2s", opacity: disabled ? 0.5 : 1,
    width: full ? "100%" : "auto", justifyContent: "center",
  };
  const variants = {
    primary: { background: T.red, color: "#fff" },
    secondary: { background: T.blue, color: "#fff" },
    outline: { background: "transparent", color: T.red, border: `2px solid ${T.red}` },
    ghost: { background: "transparent", color: T.textSecondary },
    success: { background: T.green, color: "#fff" },
    yellow: { background: T.yellow, color: T.textPrimary },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant], ...sx }}
      onMouseEnter={(e) => { if (!disabled) e.target.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.target.style.transform = "none"; }}
      {...props}
    >
      {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
      {children}
    </button>
  );
}

function Input({ label, icon: Icon, error, style: sx, ...props }) {
  return (
    <div style={{ marginBottom: 16, ...sx }}>
      {label && <label style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, marginBottom: 6, display: "block", fontFamily: "'Nunito', sans-serif" }}>{label}</label>}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: T.lightGray, borderRadius: 12, padding: "0 14px",
        border: error ? `2px solid ${T.red}` : "2px solid transparent",
        transition: "border .2s",
      }}>
        {Icon && <Icon size={18} color={T.textSecondary} />}
        <input style={{
          border: "none", background: "transparent", padding: "13px 0",
          fontSize: 15, color: T.textPrimary, outline: "none", width: "100%",
          fontFamily: "'Nunito', sans-serif", fontWeight: 600,
        }} {...props} />
      </div>
      {error && <span style={{ fontSize: 12, color: T.red, marginTop: 4, display: "block", fontFamily: "'Nunito', sans-serif" }}>{error}</span>}
    </div>
  );
}

function Select({ label, options, value, onChange, placeholder, style: sx }) {
  return (
    <div style={{ marginBottom: 16, ...sx }}>
      {label && <label style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, marginBottom: 6, display: "block", fontFamily: "'Nunito', sans-serif" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{
          width: "100%", padding: "13px 40px 13px 14px", borderRadius: 12,
          border: "2px solid transparent", background: T.lightGray,
          fontSize: 15, color: T.textPrimary, fontWeight: 600,
          fontFamily: "'Nunito', sans-serif", cursor: "pointer",
          appearance: "none", outline: "none",
        }}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={18} color={T.textSecondary} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function Card({ children, style: sx, onClick, hover }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white, borderRadius: 20, padding: 24,
        boxShadow: hover && hovered ? T.shadowHover : T.shadow,
        transition: "all .25s", cursor: onClick ? "pointer" : "default",
        transform: hover && hovered ? "translateY(-2px)" : "none",
        ...sx,
      }}>
      {children}
    </div>
  );
}

function Badge({ children, color = T.blue }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: color + "18", color: color, fontFamily: "'Nunito', sans-serif",
    }}>{children}</span>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", background: T.yellowLight,
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
      }}>
        <Icon size={36} color={T.yellow} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, margin: "0 0 8px", fontFamily: "'Nunito', sans-serif" }}>{title}</h3>
      <p style={{ fontSize: 14, color: T.textSecondary, margin: 0, fontFamily: "'Nunito', sans-serif" }}>{subtitle}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16, background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900, color: T.textPrimary, lineHeight: 1, fontFamily: "'Nunito', sans-serif" }}>{value}</div>
        <div style={{ fontSize: 13, color: T.textSecondary, fontWeight: 600, marginTop: 2, fontFamily: "'Nunito', sans-serif" }}>{label}</div>
      </div>
    </Card>
  );
}

// ─── LOGO COMPONENT ────────────────────────────────────────
function Logo({ size = "md" }) {
  const s = size === "lg" ? 1.4 : size === "sm" ? 0.7 : 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * s }}>
      <div style={{ position: "relative", width: 44 * s, height: 44 * s }}>
        <div style={{
          width: 44 * s, height: 44 * s, borderRadius: 12 * s,
          background: `linear-gradient(135deg, ${T.red}, ${T.red}dd)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 12px ${T.red}44`,
          transform: "rotate(-3deg)",
        }}>
          <span style={{ color: "#fff", fontSize: 18 * s, fontWeight: 900, fontFamily: "'Nunito', sans-serif" }}>A</span>
        </div>
        <div style={{
          position: "absolute", top: -4 * s, right: -6 * s,
          width: 18 * s, height: 18 * s, borderRadius: 6 * s,
          background: T.yellow, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 2px 8px ${T.yellow}66`,
        }}>
          <Sun size={10 * s} color={T.warmGray} strokeWidth={3} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11 * s, fontWeight: 700, color: T.blue, letterSpacing: 1, fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>Tia Dalquí</div>
        <div style={{ fontSize: 18 * s, fontWeight: 900, color: T.red, lineHeight: 1.1, fontFamily: "'Nunito', sans-serif" }}>Espaço Kids</div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────
function Sidebar({ items, active, onNavigate, onLogout, user, open, onClose }) {
  const perfilLabels = { ADM: "Administrador(a)", PROFESSORA: "Professora", RESPONSAVEL: "Responsável" };
  const perfilColors = { ADM: T.red, PROFESSORA: T.blue, RESPONSAVEL: T.green };

  return (
    <>
      {open && <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 998,
        display: "none",
      }} className="sidebar-overlay" />}
      <aside style={{
        width: 272, height: "100vh", position: "fixed", left: 0, top: 0,
        background: T.white, borderRight: `1px solid ${T.lightGray}`,
        display: "flex", flexDirection: "column", zIndex: 999,
        boxShadow: "2px 0 20px rgba(93,64,55,0.06)",
        transform: open ? "translateX(0)" : undefined,
        transition: "transform .3s",
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${T.lightGray}` }}>
          <Logo />
        </div>

        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.cream}, ${T.yellowLight})`,
            borderRadius: 14, padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: perfilColors[user?.perfil] || T.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: "'Nunito', sans-serif" }}>
                {(user?.login || "?")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{user?.login}</div>
              <Badge color={perfilColors[user?.perfil] || T.blue}>{perfilLabels[user?.perfil] || user?.perfil}</Badge>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 12, border: "none",
                background: isActive ? T.red + "12" : "transparent",
                color: isActive ? T.red : T.textSecondary,
                cursor: "pointer", transition: "all .2s", marginBottom: 2,
                fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: isActive ? 800 : 600,
                textAlign: "left",
              }}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
                {isActive && <div style={{
                  marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T.red,
                }} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 16px 20px", borderTop: `1px solid ${T.lightGray}` }}>
          <div style={{ marginBottom: 12, padding: "10px 14px", background: T.blueLight, borderRadius: 12, fontSize: 12, color: T.blue, fontFamily: "'Nunito', sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, marginBottom: 4 }}>
              <Phone size={13} /> (62) 98630-9743
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
              <AtSign size={13} /> @tia_dalqui
            </div>
          </div>
          <Btn variant="ghost" full onClick={onLogout} style={{ color: T.red, justifyContent: "flex-start", padding: "10px 14px" }}>
            <LogOut size={18} /> Sair
          </Btn>
        </div>
      </aside>
    </>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: T.textPrimary, margin: 0, fontFamily: "'Nunito', sans-serif" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: T.textSecondary, margin: "4px 0 0", fontFamily: "'Nunito', sans-serif", fontWeight: 500 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── DAYS HELPER ───────────────────────────────────────────
const DIAS = [
  { value: "SEG", label: "Segunda" },
  { value: "TER", label: "Terça" },
  { value: "QUA", label: "Quarta" },
  { value: "QUI", label: "Quinta" },
  { value: "SEX", label: "Sexta" },
  { value: "SAB", label: "Sábado" },
];
const diaLabel = (v) => DIAS.find((d) => d.value === v)?.label || v;

// ─── LOGIN PAGE ────────────────────────────────────────────
function LoginPage() {
  const { login: doLogin } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ login: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const api = createApi(() => null);

  async function handleLogin(e) {
    e?.preventDefault?.();
    if (!form.login || !form.senha) { setError("Preencha todos os campos"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.login(form.login, form.senha);
      if (res?.token) {
        const decoded = decodeJwt(res.token);
        if (!decoded?.perfil) {
          setError("Token não contém perfil. Verifique as alterações no backend (JwtService).");
          setLoading(false);
          return;
        }
        doLogin(res.token);
        toast("Bem-vindo(a) ao Espaço Kids!");
      }
    } catch (err) {
      setError("Login ou senha inválidos");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(150deg, ${T.cream} 0%, ${T.yellowWarm} 40%, ${T.redLight} 100%)`,
      padding: 20, fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Decorative elements */}
      <div style={{ position: "fixed", top: 40, left: 50, opacity: 0.12 }}>
        <Sun size={120} color={T.yellow} strokeWidth={1.5} />
      </div>
      <div style={{ position: "fixed", bottom: 60, right: 80, opacity: 0.08 }}>
        <BookOpen size={160} color={T.blue} strokeWidth={1} />
      </div>
      <div style={{ position: "fixed", top: "30%", right: 60, opacity: 0.06 }}>
        <Star size={80} color={T.red} strokeWidth={1.5} />
      </div>

      <Card style={{ width: "100%", maxWidth: 420, padding: 40, position: "relative", overflow: "hidden" }}>
        {/* Top color bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 5,
          background: `linear-gradient(90deg, ${T.red}, ${T.yellow}, ${T.green}, ${T.blue})`,
        }} />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Logo size="lg" />
          </div>
          <p style={{ fontSize: 15, color: T.textSecondary, margin: 0, fontWeight: 600 }}>
            Reforço Escolar — Área Restrita
          </p>
        </div>

        {error && (
          <div style={{
            background: T.redLight, border: `1px solid ${T.red}33`,
            borderRadius: 12, padding: "10px 14px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.red, fontWeight: 600,
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <Input label="Login" icon={Users} placeholder="Seu login" value={form.login}
          onChange={(e) => setForm({ ...form, login: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()} />

        <Input label="Senha" icon={Eye} placeholder="Sua senha" type="password" value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()} />

        <Btn full loading={loading} onClick={handleLogin} style={{ marginTop: 8, padding: "14px 24px", fontSize: 16 }}>
          Entrar
        </Btn>

        <div style={{
          marginTop: 28, paddingTop: 20, borderTop: `1px solid ${T.lightGray}`,
          textAlign: "center", fontSize: 12, color: T.textSecondary, fontWeight: 600,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Phone size={13} /> (62) 98630-9743
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <AtSign size={13} /> @tia_dalqui
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ADM PAGES
// ════════════════════════════════════════════════════════════

function AdmHome({ onNavigate }) {
  const { api } = useAuth();
  const [stats, setStats] = useState({ responsaveis: 0, horarios: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [resp, hor] = await Promise.all([
          api.listarResponsaveis().catch(() => []),
          api.buscarTodosHorarios().catch(() => []),
        ]);
        setStats({ responsaveis: resp.length, horarios: hor.length });
      } catch {}
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Painel Administrativo" subtitle="Gerencie a escolinha com facilidade" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users} label="Responsáveis" value={stats.responsaveis} color={T.blue} />
        <StatCard icon={Calendar} label="Aulas agendadas" value={stats.horarios} color={T.green} />
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, marginBottom: 16, fontFamily: "'Nunito', sans-serif" }}>Ações rápidas</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {[
          { id: "cadastrar-usuario", icon: UserPlus, label: "Novo Usuário", desc: "Cadastrar login no sistema", color: T.red },
          { id: "cadastrar-responsavel", icon: Users, label: "Novo Responsável", desc: "Vincular responsável a usuário", color: T.blue },
          { id: "cadastrar-aluno", icon: Baby, label: "Novo Aluno", desc: "Matricular um estudante", color: T.green },
          { id: "cadastrar-horario", icon: Clock, label: "Novo Horário", desc: "Agendar aula de reforço", color: T.yellow },
        ].map((a) => (
          <Card key={a.id} hover onClick={() => onNavigate(a.id)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: a.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <a.icon size={22} color={a.color} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.label}</div>
                <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif" }}>{a.desc}</div>
              </div>
              <ChevronRight size={18} color={T.textSecondary} style={{ marginLeft: "auto" }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CadastrarUsuario() {
  const { api } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ nome: "", login: "", senha: "", perfil: "" });
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.nome || !form.login || !form.senha || !form.perfil) { toast("Preencha todos os campos", "error"); return; }
    setLoading(true);
    try {
      await api.cadastrarUsuario(form);
      toast("Usuário criado com sucesso!");
      setForm({ nome: "", login: "", senha: "", perfil: "" });
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="Cadastrar Usuário" subtitle="Crie uma conta de acesso ao sistema" />
      <Card style={{ maxWidth: 520 }}>
        <Input label="Nome completo" icon={Users} placeholder="Ex: Maria Silva" value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <Input label="Login" icon={Pencil} placeholder="Ex: maria.silva" value={form.login}
          onChange={(e) => setForm({ ...form, login: e.target.value })} />
        <Input label="Senha" icon={Eye} placeholder="Senha de acesso" type="password" value={form.senha}
          onChange={(e) => setForm({ ...form, senha: e.target.value })} />
        <Select label="Perfil" placeholder="Selecione o perfil" value={form.perfil}
          onChange={(v) => setForm({ ...form, perfil: v })}
          options={[
            { value: "ADM", label: "Administrador(a)" },
            { value: "PROFESSORA", label: "Professora" },
            { value: "RESPONSAVEL", label: "Responsável" },
          ]} />
        <Btn loading={loading} onClick={submit} full style={{ marginTop: 8 }}>
          <UserPlus size={18} /> Cadastrar Usuário
        </Btn>
      </Card>
    </div>
  );
}

function CadastrarResponsavel() {
  const { api } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ usuarioId: "", telefone: "" });
  const [loading, setLoading] = useState(false);

  // Em produção, seria ideal ter um endpoint para listar usuarios com perfil RESPONSAVEL que ainda não têm responsavel vinculado
  async function submit() {
    if (!form.usuarioId || !form.telefone) { toast("Preencha todos os campos", "error"); return; }
    setLoading(true);
    try {
      await api.cadastrarResponsavel({ usuarioId: Number(form.usuarioId), telefone: form.telefone });
      toast("Responsável cadastrado com sucesso!");
      setForm({ usuarioId: "", telefone: "" });
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="Cadastrar Responsável" subtitle="Vincule um responsável a um usuário existente" />
      <Card style={{ maxWidth: 520 }}>
        <div style={{
          background: T.yellowLight, borderRadius: 12, padding: "12px 16px", marginBottom: 20,
          fontSize: 13, color: T.warmGray, fontFamily: "'Nunito', sans-serif", fontWeight: 600,
          display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <AlertCircle size={18} color={T.yellow} style={{ flexShrink: 0, marginTop: 1 }} />
          O usuário deve ter sido cadastrado previamente com o perfil "Responsável".
        </div>
        <Input label="ID do Usuário" icon={Users} placeholder="Ex: 5" type="number" value={form.usuarioId}
          onChange={(e) => setForm({ ...form, usuarioId: e.target.value })} />
        <Input label="Telefone" icon={Phone} placeholder="Ex: (62) 99999-9999" value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
        <Btn loading={loading} onClick={submit} full variant="secondary" style={{ marginTop: 8 }}>
          <Users size={18} /> Cadastrar Responsável
        </Btn>
      </Card>
    </div>
  );
}

function CadastrarAluno() {
  const { api } = useAuth();
  const toast = useToast();
  const [responsaveis, setResponsaveis] = useState([]);
  const [form, setForm] = useState({ responsavelId: "", nome: "", dataNascimento: "", serie: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listarResponsaveis().then(setResponsaveis).catch(() => {});
  }, []);

  async function submit() {
    if (!form.responsavelId || !form.nome || !form.dataNascimento || !form.serie) {
      toast("Preencha todos os campos", "error"); return;
    }
    setLoading(true);
    try {
      await api.cadastrarAluno({
        responsavelId: Number(form.responsavelId),
        nome: form.nome,
        dataNascimento: form.dataNascimento,
        serie: form.serie,
      });
      toast("Aluno cadastrado com sucesso!");
      setForm({ responsavelId: "", nome: "", dataNascimento: "", serie: "" });
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="Cadastrar Aluno" subtitle="Matricule um novo estudante no reforço" />
      <Card style={{ maxWidth: 520 }}>
        <Select label="Responsável" placeholder="Selecione o responsável"
          value={form.responsavelId} onChange={(v) => setForm({ ...form, responsavelId: v })}
          options={responsaveis.map((r) => ({ value: String(r.id), label: `${r.nome} (Tel: ${r.telefone})` }))} />
        <Input label="Nome do Aluno" icon={Baby} placeholder="Ex: João Pedro" value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <Input label="Data de Nascimento" type="date" value={form.dataNascimento}
          onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} />
        <Input label="Série" icon={GraduationCap} placeholder="Ex: 3º ano" value={form.serie}
          onChange={(e) => setForm({ ...form, serie: e.target.value })} />
        <Btn loading={loading} onClick={submit} full variant="success" style={{ marginTop: 8 }}>
          <Baby size={18} /> Cadastrar Aluno
        </Btn>
      </Card>
    </div>
  );
}

function CadastrarHorario() {
  const { api } = useAuth();
  const toast = useToast();
  const [responsaveis, setResponsaveis] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [selResp, setSelResp] = useState("");
  const [form, setForm] = useState({ alunoId: "", diaSemana: "", horaInicio: "", horaFim: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listarResponsaveis().then(setResponsaveis).catch(() => {});
  }, []);

  useEffect(() => {
    if (selResp) {
      api.buscarAlunosDoResponsavel(selResp).then(setAlunos).catch(() => setAlunos([]));
    } else { setAlunos([]); }
  }, [selResp]);

  async function submit() {
    if (!form.alunoId || !form.diaSemana || !form.horaInicio || !form.horaFim) {
      toast("Preencha todos os campos", "error"); return;
    }
    setLoading(true);
    try {
      await api.cadastrarHorario({
        alunoId: Number(form.alunoId),
        diaSemana: form.diaSemana,
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
      });
      toast("Horário cadastrado com sucesso!");
      setForm({ alunoId: "", diaSemana: "", horaInicio: "", horaFim: "" });
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="Cadastrar Horário" subtitle="Agende uma aula de reforço" />
      <Card style={{ maxWidth: 520 }}>
        <Select label="Responsável" placeholder="Filtrar por responsável" value={selResp}
          onChange={(v) => { setSelResp(v); setForm({ ...form, alunoId: "" }); }}
          options={responsaveis.map((r) => ({ value: String(r.id), label: r.nome }))} />
        <Select label="Aluno" placeholder={selResp ? "Selecione o aluno" : "Selecione o responsável primeiro"}
          value={form.alunoId} onChange={(v) => setForm({ ...form, alunoId: v })}
          options={alunos.map((a) => ({ value: String(a.id), label: `${a.nome} — ${a.serie}` }))} />
        <Select label="Dia da Semana" placeholder="Selecione o dia" value={form.diaSemana}
          onChange={(v) => setForm({ ...form, diaSemana: v })} options={DIAS} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Hora Início" type="time" value={form.horaInicio}
            onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} />
          <Input label="Hora Fim" type="time" value={form.horaFim}
            onChange={(e) => setForm({ ...form, horaFim: e.target.value })} />
        </div>
        <Btn loading={loading} onClick={submit} full variant="yellow" style={{ marginTop: 8 }}>
          <Clock size={18} /> Cadastrar Horário
        </Btn>
      </Card>
    </div>
  );
}

function ListarResponsaveis({ onNavigate }) {
  const { api } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listarResponsaveis().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = data.filter((r) => r.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Responsáveis" subtitle={`${data.length} responsáveis cadastrados`} />
      <div style={{ marginBottom: 20 }}>
        <Input icon={Search} placeholder="Buscar por nome..." value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 0, maxWidth: 360 }} />
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} color={T.red} style={{ animation: "spin 1s linear infinite" }} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum responsável" subtitle="Cadastre o primeiro responsável para começar" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {filtered.map((r) => (
            <Card key={r.id} hover onClick={() => onNavigate("ver-alunos", { responsavelId: r.id, responsavelNome: r.nome })}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: T.blueLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Users size={20} color={T.blue} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{r.nome}</div>
                  <div style={{ fontSize: 13, color: T.textSecondary, fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                    <Phone size={12} /> {r.telefone}
                  </div>
                </div>
                <Badge color={T.blue}>ID: {r.id}</Badge>
                <ChevronRight size={18} color={T.textSecondary} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function VerAlunos({ params, onNavigate }) {
  const { api } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.responsavelId) {
      api.buscarAlunosDoResponsavel(params.responsavelId).then(setAlunos).catch(() => {}).finally(() => setLoading(false));
    }
  }, [params?.responsavelId]);

  return (
    <div>
      <PageHeader title={`Alunos — ${params?.responsavelNome || "Responsável"}`}
        subtitle={`${alunos.length} aluno(s) vinculados`}
        action={<Btn variant="ghost" onClick={() => onNavigate("listar-responsaveis")}> Voltar</Btn>} />
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} color={T.green} style={{ animation: "spin 1s linear infinite" }} /></div>
      ) : alunos.length === 0 ? (
        <EmptyState icon={Baby} title="Nenhum aluno" subtitle="Este responsável ainda não tem alunos cadastrados" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {alunos.map((a) => (
            <Card key={a.id} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                background: `linear-gradient(90deg, ${T.green}, ${T.blue})`,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: T.greenLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <GraduationCap size={24} color={T.green} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.nome}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <Badge color={T.blue}>{a.serie}</Badge>
                    {a.dataNascimento && <Badge color={T.warmGray}>{new Date(a.dataNascimento + "T12:00:00").toLocaleDateString("pt-BR")}</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ListarHorarios() {
  const { api } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDia, setFilterDia] = useState("");

  useEffect(() => {
    api.buscarTodosHorarios().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filterDia ? data.filter((h) => h.diaSemana === filterDia) : data;
  const grouped = {};
  filtered.forEach((h) => {
    if (!grouped[h.diaSemana]) grouped[h.diaSemana] = [];
    grouped[h.diaSemana].push(h);
  });
  const diaOrder = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

  return (
    <div>
      <PageHeader title="Todos os Horários" subtitle={`${data.length} aulas agendadas`} />
      <div style={{ marginBottom: 20 }}>
        <Select placeholder="Filtrar por dia" value={filterDia} onChange={setFilterDia}
          options={[{ value: "", label: "Todos os dias" }, ...DIAS]} style={{ maxWidth: 260, marginBottom: 0 }} />
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} color={T.blue} style={{ animation: "spin 1s linear infinite" }} /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState icon={Calendar} title="Sem horários" subtitle="Nenhuma aula encontrada" />
      ) : (
        diaOrder.filter((d) => grouped[d]).map((dia) => (
          <div key={dia} style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
              fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif",
            }}>
              <Calendar size={18} color={T.red} /> {diaLabel(dia)}
              <Badge color={T.red}>{grouped[dia].length}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
              {grouped[dia].map((h, i) => (
                <Card key={i} style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{h.nomeAluno}</div>
                      <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif" }}>Responsável: {h.nomeResponsavel}</div>
                    </div>
                    <Badge color={T.green}>
                      <Clock size={12} /> {h.horaInicio?.slice(0, 5)} — {h.horaFim?.slice(0, 5)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// RESPONSAVEL PAGES
// ════════════════════════════════════════════════════════════

function RespHome() {
  const { api, user } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const rid = user?.responsavelId;

  useEffect(() => {
    if (!rid) { setLoading(false); return; }
    Promise.all([
      api.buscarAlunosDoResponsavel(rid).catch(() => []),
      api.buscarHorariosPorResponsavel(rid).catch(() => []),
    ]).then(([a, h]) => { setAlunos(a); setHorarios(h); }).finally(() => setLoading(false));
  }, [rid]);

  if (!rid) return (
    <Card>
      <div style={{ textAlign: "center", padding: 40 }}>
        <AlertCircle size={40} color={T.yellow} />
        <h3 style={{ fontFamily: "'Nunito', sans-serif", color: T.textPrimary, marginTop: 12 }}>Perfil incompleto</h3>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: T.textSecondary, fontSize: 14 }}>
          Seu cadastro de responsável ainda não foi vinculado. Entre em contato com a administração.
        </p>
      </div>
    </Card>
  );

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Loader2 size={36} color={T.green} style={{ animation: "spin 1s linear infinite" }} /></div>;

  const grouped = {};
  horarios.forEach((h) => {
    if (!grouped[h.diaSemana]) grouped[h.diaSemana] = [];
    grouped[h.diaSemana].push(h);
  });

  return (
    <div>
      <PageHeader title="Meus Filhos" subtitle="Acompanhe os horários de aula do reforço" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon={Baby} label="Filhos matriculados" value={alunos.length} color={T.green} />
        <StatCard icon={Calendar} label="Aulas agendadas" value={horarios.length} color={T.blue} />
      </div>

      {alunos.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>
            Alunos
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 28 }}>
            {alunos.map((a) => (
              <Card key={a.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: T.greenLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <GraduationCap size={22} color={T.green} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.nome}</div>
                    <Badge color={T.blue}>{a.serie}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {horarios.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>
            Horários da Semana
          </h3>
          {["SEG", "TER", "QUA", "QUI", "SEX", "SAB"].filter((d) => grouped[d]).map((dia) => (
            <div key={dia} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 13, fontWeight: 800, color: T.red, marginBottom: 8,
                fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: 1,
              }}>
                {diaLabel(dia)}
              </div>
              {grouped[dia].map((h, i) => (
                <Card key={i} style={{ padding: 14, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Clock size={16} color={T.blue} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{h.nomeAluno}</span>
                    </div>
                    <Badge color={T.green}>{h.horaInicio?.slice(0, 5)} — {h.horaFim?.slice(0, 5)}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </>
      )}

      {alunos.length === 0 && horarios.length === 0 && (
        <EmptyState icon={BookOpen} title="Tudo tranquilo por aqui" subtitle="Seus filhos ainda não possuem horários agendados" />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PROFESSORA PAGES
// ════════════════════════════════════════════════════════════

function ProfHome() {
  const { api } = useAuth();
  const [responsaveis, setResponsaveis] = useState([]);
  const [selectedResp, setSelectedResp] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("responsaveis");

  useEffect(() => {
    api.listarResponsaveis().then(setResponsaveis).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function selectResp(r) {
    setSelectedResp(r);
    setTab("alunos");
    const [a, h] = await Promise.all([
      api.buscarAlunosDoResponsavel(r.id).catch(() => []),
      api.buscarHorariosPorResponsavel(r.id).catch(() => []),
    ]);
    setAlunos(a);
    setHorarios(h);
  }

  if (loading) return <div style={{ textAlign: "center", padding: 60 }}><Loader2 size={36} color={T.blue} style={{ animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div>
      <PageHeader title="Painel da Professora" subtitle="Visualize alunos e horários" />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "responsaveis", label: "Responsáveis", icon: Users },
          { id: "alunos", label: "Alunos", icon: GraduationCap, disabled: !selectedResp },
        ].map((t) => (
          <button key={t.id} onClick={() => !t.disabled && setTab(t.id)} style={{
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: tab === t.id ? T.blue : T.lightGray,
            color: tab === t.id ? "#fff" : T.textSecondary,
            fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13,
            cursor: t.disabled ? "not-allowed" : "pointer", opacity: t.disabled ? 0.4 : 1,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "responsaveis" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {responsaveis.map((r) => (
            <Card key={r.id} hover onClick={() => selectResp(r)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: T.blueLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Users size={20} color={T.blue} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{r.nome}</div>
                  <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif" }}>{r.telefone}</div>
                </div>
                <ChevronRight size={18} color={T.textSecondary} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "alunos" && selectedResp && (
        <div>
          <Btn variant="ghost" onClick={() => { setTab("responsaveis"); setSelectedResp(null); }}
            style={{ marginBottom: 16, padding: "6px 12px", fontSize: 13 }}>
            ← Voltar para responsáveis
          </Btn>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", marginBottom: 12 }}>
            Alunos de {selectedResp.nome}
          </h3>
          {alunos.length === 0 ? (
            <EmptyState icon={Baby} title="Sem alunos" subtitle="Nenhum aluno vinculado" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 24 }}>
              {alunos.map((a) => (
                <Card key={a.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: T.greenLight,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <GraduationCap size={22} color={T.green} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{a.nome}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <Badge color={T.blue}>{a.serie}</Badge>
                        {a.dataNascimento && <Badge color={T.warmGray}>{new Date(a.dataNascimento + "T12:00:00").toLocaleDateString("pt-BR")}</Badge>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {horarios.length > 0 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", marginBottom: 12 }}>
                Horários
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
                {horarios.map((h, i) => (
                  <Card key={i} style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif" }}>{h.nomeAluno}</div>
                        <Badge color={T.red}>{diaLabel(h.diaSemana)}</Badge>
                      </div>
                      <Badge color={T.green}><Clock size={12} /> {h.horaInicio?.slice(0, 5)} — {h.horaFim?.slice(0, 5)}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN LAYOUT & ROUTER
// ════════════════════════════════════════════════════════════

const ADM_MENU = [
  { id: "home", label: "Início", icon: Home },
  { id: "cadastrar-usuario", label: "Novo Usuário", icon: UserPlus },
  { id: "cadastrar-responsavel", label: "Novo Responsável", icon: Users },
  { id: "cadastrar-aluno", label: "Novo Aluno", icon: Baby },
  { id: "cadastrar-horario", label: "Novo Horário", icon: Clock },
  { id: "listar-responsaveis", label: "Responsáveis", icon: ClipboardList },
  { id: "listar-horarios", label: "Todos Horários", icon: Calendar },
];

const RESP_MENU = [
  { id: "home", label: "Meus Filhos", icon: Home },
];

const PROF_MENU = [
  { id: "home", label: "Painel", icon: Home },
];

function DashboardLayout() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("home");
  const [pageParams, setPageParams] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function navigate(pageId, params) {
    setPage(pageId);
    setPageParams(params || null);
    setSidebarOpen(false);
  }

  const menu = user?.perfil === "ADM" ? ADM_MENU : user?.perfil === "PROFESSORA" ? PROF_MENU : RESP_MENU;

  function renderPage() {
    if (user?.perfil === "ADM") {
      switch (page) {
        case "home": return <AdmHome onNavigate={navigate} />;
        case "cadastrar-usuario": return <CadastrarUsuario />;
        case "cadastrar-responsavel": return <CadastrarResponsavel />;
        case "cadastrar-aluno": return <CadastrarAluno />;
        case "cadastrar-horario": return <CadastrarHorario />;
        case "listar-responsaveis": return <ListarResponsaveis onNavigate={navigate} />;
        case "ver-alunos": return <VerAlunos params={pageParams} onNavigate={navigate} />;
        case "listar-horarios": return <ListarHorarios />;
        default: return <AdmHome onNavigate={navigate} />;
      }
    }
    if (user?.perfil === "PROFESSORA") return <ProfHome />;
    if (user?.perfil === "RESPONSAVEL") return <RespHome />;
    return <div style={{ fontFamily: "'Nunito', sans-serif" }}>Perfil não reconhecido.</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.cream, fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar items={menu} active={page} onNavigate={navigate} onLogout={logout}
        user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main style={{ flex: 1, marginLeft: 272, minHeight: "100vh" }}>
        {/* Top bar (mobile) */}
        <header style={{
          padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: T.white, borderBottom: `1px solid ${T.lightGray}`,
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            display: "none", // show on mobile with CSS
          }}>
            <Menu size={24} color={T.textPrimary} />
          </button>
          <div style={{ fontSize: 13, color: T.textSecondary, fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>
            Reforço Escolar — Tia Dalquí
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: T.red + "18", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={16} color={T.red} />
            </div>
          </div>
        </header>

        <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
          {renderPage()}
        </div>

        {/* Footer */}
        <footer style={{
          padding: "20px 32px", borderTop: `1px solid ${T.lightGray}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif", fontWeight: 600,
          flexWrap: "wrap", gap: 8,
        }}>
          <span>Espaço Kids — Tia Dalquí · Reforço Escolar</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="https://www.instagram.com/tia_dalqui/" target="_blank" rel="noopener"
              style={{ color: T.red, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <AtSign size={14} /> @tia_dalqui
            </a>
            <a href="https://wa.me/5562986309743" target="_blank" rel="noopener"
              style={{ color: T.green, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <Phone size={14} /> (62) 98630-9743
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════

export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', sans-serif; background: ${T.cream}; }
        ::selection { background: ${T.red}33; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.red}44; border-radius: 3px; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; }
        input[type="time"]::-webkit-calendar-picker-indicator { cursor: pointer; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
          aside { transform: translateX(-100%) !important; }
          aside[style*="translateX(0)"] { transform: translateX(0) !important; }
          main { margin-left: 0 !important; }
          header button:first-child { display: flex !important; }
        }
      `}</style>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}

function AppRouter() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <DashboardLayout />;
}