import { useEffect } from "react";
import { X, Download } from "lucide-react";
import { T } from "../../constants/theme";

export function PdfViewer({ titulo, url, onClose, onDownload }) {
  // Fechar com Esc
  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Bloquear scroll do body enquanto aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.white, borderRadius: 18,
          width: "100%", maxWidth: 900,
          height: "90vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${T.lightGray}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, fontFamily: "'Nunito', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 12 }}>
            {titulo}
          </span>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {onDownload && (
              <button onClick={onDownload} style={{
                background: T.lightGray, border: "none", borderRadius: 10, padding: "8px 14px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: T.textSecondary,
              }}>
                <Download size={15} /> Baixar
              </button>
            )}
            <button onClick={onClose} style={{
              background: T.redLight, border: "none", borderRadius: 10, padding: "8px 12px",
              cursor: "pointer", display: "flex", alignItems: "center",
            }}>
              <X size={18} color={T.red} />
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <iframe
          src={url}
          title={titulo}
          style={{ flex: 1, border: "none", width: "100%" }}
        />
      </div>
    </div>
  );
}
