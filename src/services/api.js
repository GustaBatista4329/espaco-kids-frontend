const API_BASE = "http://localhost:8080";

export function createApi(getToken) {
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
    listarUsuariosDisponiveis: () => req("GET", "/responsavel/usuarios-disponiveis"),
    atualizarSenha: (dto) => req("PUT", "/autenticacao/senha", dto),
    listarUsuariosParaSenha: () => req("GET", "/autenticacao/usuarios-para-senha"),
    listarTodosUsuarios: () => req("GET", "/autenticacao/usuarios"),
    editarUsuario: (id, dto) => req("PUT", `/autenticacao/usuarios/${id}`, dto),
    alterarStatusUsuario: (id, ativo) => req("PATCH", `/autenticacao/usuarios/${id}/status`, { ativo }),
    listarTodosAlunos: () => req("GET", "/aluno"),
    uploadAtividade: (titulo, descricao, arquivo) => {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descricao", descricao || "");
      formData.append("arquivo", arquivo);
      const token = getToken();
      return fetch(`${API_BASE}/atividade/upload`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      }).then(async (res) => {
        if (res.status === 401) throw new Error("TOKEN_EXPIRED");
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.mensagem || `Erro ${res.status}`); }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      });
    },
    listarBancoAtividades: () => req("GET", "/atividade/banco"),
    excluirAtividadeBanco: (id) => req("DELETE", `/atividade/banco/${id}`),
    atribuirAtividade: (dto) => req("POST", "/atividade/atribuir", dto),
    removerAtribuicao: (id) => req("DELETE", `/atividade/atribuicao/${id}`),
    listarAtividadesAluno: (alunoId) => req("GET", `/atividade/aluno/${alunoId}`),
    visualizarAtividade: (nomeArquivo) => {
      const token = getToken();
      return fetch(`${API_BASE}/atividade/download/${encodeURIComponent(nomeArquivo)}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      }).then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar arquivo");
        const blob = await res.blob();
        return window.URL.createObjectURL(blob);
      });
    },
    downloadAtividade: (nomeArquivo) => {
      const token = getToken();
      return fetch(`${API_BASE}/atividade/download/${encodeURIComponent(nomeArquivo)}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      }).then(async (res) => {
        if (!res.ok) throw new Error("Erro ao baixar arquivo");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nomeArquivo;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    },
  };
}
