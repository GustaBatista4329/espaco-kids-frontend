import { useEffect, useRef, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { T } from "../../constants/theme";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PDFJS_CDN;
    script.onload = () => resolve(window.pdfjsLib);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function PdfViewer({ titulo, url, onClose, onDownload }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // "loading" | "done" | "error"

  // Fechar com Esc
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Travar scroll do body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Renderizar páginas do PDF
  useEffect(() => {
    let cancelled = false;

    async function render() {
      const pdfjsLib = await loadPdfJs();
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

      const pdf = await pdfjsLib.getDocument(url).promise;
      if (cancelled) return;

      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = "";

      const containerWidth = container.offsetWidth || 820;

      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) return;
        const page = await pdf.getPage(i);

        // Calcular escala para preencher a largura do container
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / baseViewport.width;
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * dpr });

        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = i < pdf.numPages ? "16px" : "0";
        wrapper.style.borderRadius = "10px";
        wrapper.style.overflow = "hidden";
        wrapper.style.boxShadow = "0 4px 20px rgba(0,0,0,0.18)";
        wrapper.style.background = "#fff";

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // CSS size = tamanho lógico (sem DPR), para não ficar gigante na tela
        canvas.style.display = "block";
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      }

      if (!cancelled) setStatus("done");
    }

    render().catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [url]);

  return (
    // Overlay — clique fora fecha
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.72)",
        overflowY: "auto",
        padding: "28px 16px 48px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 880,
          margin: "0 auto",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 32px 100px rgba(0,0,0,0.45)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header fixo dentro do modal */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          background: T.white,
          borderBottom: `1px solid ${T.lightGray}`,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 15, fontWeight: 800, color: T.textPrimary,
            fontFamily: "'Nunito', sans-serif",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 12,
          }}>
            {titulo}
          </span>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {onDownload && (
              <button
                onClick={onDownload}
                style={{
                  background: T.lightGray, border: "none", borderRadius: 10, padding: "8px 14px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: T.textSecondary,
                }}
              >
                <Download size={15} /> Baixar
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: T.redLight, border: "none", borderRadius: 10, padding: "8px 12px",
                cursor: "pointer", display: "flex", alignItems: "center",
              }}
            >
              <X size={18} color={T.red} />
            </button>
          </div>
        </div>

        {/* Área de conteúdo */}
        <div style={{ background: "#d1d5db", padding: "24px 20px" }}>
          {status === "loading" && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={36} color={T.red} style={{ animation: "spin 1s linear infinite" }} />
              <p style={{
                fontFamily: "'Nunito', sans-serif", color: T.textSecondary,
                marginTop: 14, fontSize: 14, fontWeight: 600,
              }}>
                Carregando PDF...
              </p>
            </div>
          )}
          {status === "error" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontFamily: "'Nunito', sans-serif", color: T.red, fontWeight: 700, fontSize: 15 }}>
                Não foi possível carregar o PDF.
              </p>
            </div>
          )}
          <div ref={containerRef} style={{ visibility: status === "done" ? "visible" : "hidden" }} />
        </div>
      </div>
    </div>
  );
}
