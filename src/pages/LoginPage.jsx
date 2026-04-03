import { useState } from "react";
import { Users, Eye, Phone, AtSign, BookOpen, Sun, Star, AlertCircle } from "lucide-react";
import { T } from "../constants/theme";
import { createApi } from "../services/api";
import { decodeJwt } from "../utils/jwt";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Btn } from "../components/ui/Btn";
import { Logo } from "../components/ui/Logo";

export function LoginPage() {
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
    } catch {
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

        <Input label="Senha" icon={Eye} placeholder="Sua senha" type="password" showToggle value={form.senha}
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
              <Phone size={13} /> (62) 8574-7327
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
