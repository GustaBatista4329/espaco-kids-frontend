export const CATEGORIAS = [
  { value: "PORTUGUES", label: "Português", color: "#E53935" },
  { value: "MATEMATICA", label: "Matemática", color: "#1565C0" },
  { value: "CIENCIAS", label: "Ciências", color: "#43A047" },
  { value: "HISTORIA", label: "História", color: "#795548" },
  { value: "GEOGRAFIA", label: "Geografia", color: "#00897B" },
  { value: "INGLES", label: "Inglês", color: "#FB8C00" },
  { value: "ARTES", label: "Artes", color: "#8E24AA" },
  { value: "GERAL", label: "Geral", color: "#6D4C41" },
];

export function categoriaLabel(value) {
  return CATEGORIAS.find((c) => c.value === value)?.label || value || "Sem categoria";
}

export function categoriaColor(value) {
  return CATEGORIAS.find((c) => c.value === value)?.color || "#6D4C41";
}
