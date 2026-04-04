export const CATEGORIAS = [
  { value: "matematica", label: "Matemática", color: "#1565C0" },
  { value: "portugues", label: "Português", color: "#E53935" },
  { value: "ciencias", label: "Ciências", color: "#43A047" },
  { value: "historia", label: "História", color: "#795548" },
  { value: "geografia", label: "Geografia", color: "#00897B" },
  { value: "ingles", label: "Inglês", color: "#FB8C00" },
  { value: "artes", label: "Artes", color: "#8E24AA" },
  { value: "outros", label: "Outros", color: "#6D4C41" },
];

export function categoriaLabel(value) {
  return CATEGORIAS.find((c) => c.value === value)?.label || value || "Sem categoria";
}

export function categoriaColor(value) {
  return CATEGORIAS.find((c) => c.value === value)?.color || "#6D4C41";
}
