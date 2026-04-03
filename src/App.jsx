/*
 * ═══════════════════════════════════════════════════════════
 *  ESPAÇO KIDS — Tia Dalqui · Reforço Escolar
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
 *  3) Altere a URL da API em src/services/api.js conforme seu ambiente.
 * ═══════════════════════════════════════════════════════════
 */

import { T } from "./constants/theme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";

function AppRouter() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <DashboardLayout />;
}

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
