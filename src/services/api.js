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
    listarTodosAlunos: () => req("GET", "/aluno"),
  };
}
