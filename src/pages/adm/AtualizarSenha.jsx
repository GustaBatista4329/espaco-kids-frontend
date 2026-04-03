import { useState, useEffect } from "react";
import { Lock, KeyRound } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Btn } from "../../components/ui/Btn";
import { PageHeader } from "../../components/layout/PageHeader";

export function AtualizarSenha() {
  const { api } = useAuth();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ usuarioId: "", novaSenha: "", confirmarSenha: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listarUsuariosParaSenha()
      .then(setUsuarios)
      .catch(() => toast("Erro ao carregar usuários", "error"));
  }, []);

  async function submit() {
    if (!form.usuarioId || !form.novaSenha || !form.confirmarSenha) {
      toast("Preencha todos os campos", "error"); return;
    }
    if (form.novaSenha !== form.confirmarSenha) {
      toast("As senhas não coincidem", "error"); return;
    }
    if (form.novaSenha.length < 6) {
      toast("A senha deve ter no mínimo 6 caracteres", "error"); return;
    }
    setLoading(true);
    try {
      await api.atualizarSenha({ usuarioId: Number(form.usuarioId), novaSenha: form.novaSenha });
      toast("Senha atualizada com sucesso!");
      setForm({ usuarioId: "", novaSenha: "", confirmarSenha: "" });
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="Atualizar Senha" subtitle="Redefina a senha de um usuário" />
      <Card style={{ maxWidth: 520 }}>
        <Select
          label="Usuário"
          placeholder="Selecione um usuário"
          options={usuarios.map((u) => ({ value: String(u.id), label: `${u.nome} (${u.login}) — ${u.perfil}` }))}
          value={form.usuarioId}
          onChange={(val) => setForm({ ...form, usuarioId: val })}
        />
        <Input label="Nova Senha" icon={Lock} placeholder="Mínimo 6 caracteres" type="password" showToggle
          value={form.novaSenha} onChange={(e) => setForm({ ...form, novaSenha: e.target.value })} />
        <Input label="Confirmar Senha" icon={Lock} placeholder="Repita a nova senha" type="password" showToggle
          value={form.confirmarSenha} onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })} />
        <Btn loading={loading} onClick={submit} full style={{ marginTop: 8 }}>
          <KeyRound size={18} /> Atualizar Senha
        </Btn>
      </Card>
    </div>
  );
}
