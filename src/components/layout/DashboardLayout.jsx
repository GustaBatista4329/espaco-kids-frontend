import { useState } from "react";
import { Menu, Shield, AtSign, Phone } from "lucide-react";
import { T } from "../../constants/theme";
import { ADM_MENU, RESP_MENU, PROF_MENU } from "../../constants/menus";
import { useAuth } from "../../contexts/AuthContext";
import { Sidebar } from "./Sidebar";
import { AdmHome } from "../../pages/adm/AdmHome";
import { CadastrarUsuario } from "../../pages/adm/CadastrarUsuario";
import { CadastrarResponsavel } from "../../pages/adm/CadastrarResponsavel";
import { CadastrarAluno } from "../../pages/adm/CadastrarAluno";
import { CadastrarHorario } from "../../pages/adm/CadastrarHorario";
import { ListarResponsaveis } from "../../pages/adm/ListarResponsaveis";
import { VerAlunos } from "../../pages/adm/VerAlunos";
import { ListarHorarios } from "../../pages/adm/ListarHorarios";
import { AtualizarSenha } from "../../pages/adm/AtualizarSenha";
import { ListarUsuarios } from "../../pages/adm/ListarUsuarios";
import { BancoAtividades } from "../../pages/shared/BancoAtividades";
import { AtividadesAluno } from "../../pages/shared/AtividadesAluno";
import { ProfHome } from "../../pages/professora/ProfHome";
import { ProfResponsaveis } from "../../pages/professora/ProfResponsaveis";
import { ProfTodosAlunos } from "../../pages/professora/ProfTodosAlunos";
import { ProfVerAlunos } from "../../pages/professora/ProfVerAlunos";
import { RespHome } from "../../pages/responsavel/RespHome";
import { RespAtividades } from "../../pages/responsavel/RespAtividades";

function renderAdmPage(page, pageParams, navigate) {
  switch (page) {
    case "home": return <AdmHome onNavigate={navigate} />;
    case "cadastrar-usuario": return <CadastrarUsuario />;
    case "cadastrar-responsavel": return <CadastrarResponsavel />;
    case "cadastrar-aluno": return <CadastrarAluno />;
    case "cadastrar-horario": return <CadastrarHorario />;
    case "listar-responsaveis": return <ListarResponsaveis onNavigate={navigate} />;
    case "ver-alunos": return <VerAlunos params={pageParams} onNavigate={navigate} />;
    case "listar-horarios": return <ListarHorarios />;
    case "listar-usuarios": return <ListarUsuarios />;
    case "banco-atividades": return <BancoAtividades onNavigate={navigate} />;
    case "ver-atividades-aluno": return <AtividadesAluno params={pageParams} onNavigate={navigate} podeExcluir={true} />;
    case "atualizar-senha": return <AtualizarSenha />;
    default: return <AdmHome onNavigate={navigate} />;
  }
}

function renderProfPage(page, pageParams, navigate) {
  switch (page) {
    case "home": return <ProfHome />;
    case "responsaveis": return <ProfResponsaveis onNavigate={navigate} />;
    case "alunos": return <ProfTodosAlunos onNavigate={navigate} />;
    case "prof-ver-alunos": return <ProfVerAlunos params={pageParams} onNavigate={navigate} />;
    case "banco-atividades": return <BancoAtividades onNavigate={navigate} />;
    case "ver-atividades-aluno": return <AtividadesAluno params={pageParams} onNavigate={navigate} podeExcluir={true} />;
    default: return <ProfHome />;
  }
}

export function DashboardLayout() {
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

  // Mapeia sub-páginas para o item de menu pai correspondente
  function getActiveMenuItem() {
    if (user?.perfil === "RESPONSAVEL" && page === "ver-atividades-aluno") return "atividades";
    if (user?.perfil === "ADM" && page === "ver-alunos") return "listar-responsaveis";
    if (user?.perfil === "ADM" && page === "ver-atividades-aluno") return "banco-atividades";
    if (user?.perfil === "PROFESSORA" && page === "prof-ver-alunos") return "responsaveis";
    if (user?.perfil === "PROFESSORA" && page === "ver-atividades-aluno") return "banco-atividades";
    return page;
  }

  function renderPage() {
    if (user?.perfil === "ADM") return renderAdmPage(page, pageParams, navigate);
    if (user?.perfil === "PROFESSORA") return renderProfPage(page, pageParams, navigate);
    if (user?.perfil === "RESPONSAVEL") {
      switch (page) {
        case "atividades": return <RespAtividades onNavigate={navigate} />;
        case "ver-atividades-aluno": return <AtividadesAluno params={pageParams} onNavigate={navigate} podeExcluir={false} />;
        default: return <RespHome onNavigate={navigate} />;
      }
    }
    return <div style={{ fontFamily: "'Nunito', sans-serif" }}>Perfil não reconhecido.</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.cream, fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar items={menu} active={getActiveMenuItem()} onNavigate={navigate} onLogout={logout}
        user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main style={{ flex: 1, marginLeft: 272, minHeight: "100vh" }}>
        <header style={{
          padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: T.white, borderBottom: `1px solid ${T.lightGray}`,
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            display: "none",
          }}>
            <Menu size={24} color={T.textPrimary} />
          </button>
          <div style={{ fontSize: 13, color: T.textSecondary, fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>
            Reforço Escolar — Tia Dalqui
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

        <footer style={{
          padding: "20px 32px", borderTop: `1px solid ${T.lightGray}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 12, color: T.textSecondary, fontFamily: "'Nunito', sans-serif", fontWeight: 600,
          flexWrap: "wrap", gap: 8,
        }}>
          <span>Espaço Kids — Tia Dalqui · Reforço Escolar</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="https://www.instagram.com/tia_dalqui/" target="_blank" rel="noopener"
              style={{ color: T.red, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <AtSign size={14} /> @tia_dalqui
            </a>
            <a href="https://wa.me/556285747327" target="_blank" rel="noopener"
              style={{ color: T.green, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <Phone size={14} /> (62) 8574-7327
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
