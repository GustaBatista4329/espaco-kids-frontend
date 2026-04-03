import { useState } from "react";
import { Users, Phone, AlertCircle } from "lucide-react";
import { T } from "../../constants/theme";
import { formatarTelefone } from "../../utils/formatters";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Btn } from "../../components/ui/Btn";
import { PageHeader } from "../../components/layout/PageHeader";

export function CadastrarResponsavel() {
  const { api } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ usuarioId: "", telefone: "" });
  const [loading, setLoading] = useState(false);

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
          onChange={(e) => setForm({ ...form, telefone: formatarTelefone(e.target.value) })} />
        <Btn loading={loading} onClick={submit} full variant="secondary" style={{ marginTop: 8 }}>
          <Users size={18} /> Cadastrar Responsável
        </Btn>
      </Card>
    </div>
  );
}
