import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { DIAS } from "../../constants/days";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Btn } from "../../components/ui/Btn";
import { PageHeader } from "../../components/layout/PageHeader";

export function CadastrarHorario() {
  const { api } = useAuth();
  const toast = useToast();
  const [responsaveis, setResponsaveis] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [selResp, setSelResp] = useState("");
  const [form, setForm] = useState({ alunoId: "", diaSemana: "", horaInicio: "", horaFim: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listarResponsaveis().then(setResponsaveis).catch(() => {});
  }, [api]);

  useEffect(() => {
    if (selResp) {
      api.buscarAlunosDoResponsavel(selResp).then(setAlunos).catch(() => setAlunos([]));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    } else { setAlunos([]); }
  }, [selResp, api]);

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
