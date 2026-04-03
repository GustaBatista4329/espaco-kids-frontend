import { Home, UserPlus, Users, Baby, Clock, ClipboardList, Calendar, KeyRound, GraduationCap } from "lucide-react";

export const ADM_MENU = [
  { id: "home", label: "Início", icon: Home },
  { id: "cadastrar-usuario", label: "Novo Usuário", icon: UserPlus },
  { id: "cadastrar-responsavel", label: "Novo Responsável", icon: Users },
  { id: "cadastrar-aluno", label: "Novo Aluno", icon: Baby },
  { id: "cadastrar-horario", label: "Novo Horário", icon: Clock },
  { id: "listar-responsaveis", label: "Responsáveis", icon: ClipboardList },
  { id: "listar-horarios", label: "Todos Horários", icon: Calendar },
  { id: "listar-usuarios", label: "Usuários", icon: Users },
  { id: "atualizar-senha", label: "Atualizar Senha", icon: KeyRound },
];

export const RESP_MENU = [
  { id: "home", label: "Meus Filhos", icon: Home },
];

export const PROF_MENU = [
  { id: "home", label: "Painel", icon: Home },
  { id: "responsaveis", label: "Responsáveis", icon: Users },
  { id: "alunos", label: "Todos Alunos", icon: GraduationCap },
];
