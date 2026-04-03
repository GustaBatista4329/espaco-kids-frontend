import { useState, useEffect } from "react";
import { Baby } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Btn } from "../../components/ui/Btn";
import { PageHeader } from "../../components/layout/PageHeader";

const SERIE_OPTIONS = [
  { value: "Jardim 1", label: "Jardim 1" },
  { value: "Jardim 2", label: "Jardim 2" },
  { value: "Jardim 3", label: "Jardim 3" },
  { value: "1º Ano", label: "1º Ano" },
  { value: "2º Ano", label: "2º Ano" },
  { value: "3º Ano", label: "3º Ano" },
  { value: "4º Ano", label: "4º Ano" },
  { value: "5º Ano", label: "5º Ano" },
];

export function CadastrarAluno() {
  const { api } = useAuth();
  const toast = useToast();
  const [responsaveis, setResponsaveis] = useState([]);
  const [form, setForm] = useState({ responsavelId: "", nome: "", dataNascimento: "", serie: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listarResponsaveis().then(setResponsaveis).catch(() => {});
  }, [api]);

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
        <Select label="Série" placeholder="Selecione a série" value={form.serie}
          onChange={(v) => setForm({ ...form, serie: v })}
          options={SERIE_OPTIONS} />
        <Btn loading={loading} onClick={submit} full variant="success" style={{ marginTop: 8 }}>
          <Baby size={18} /> Cadastrar Aluno
        </Btn>
      </Card>
    </div>
  );
}
