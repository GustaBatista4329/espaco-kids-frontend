const STORAGE_KEY = "ek_pending_resp";

export function getPendingResponsaveis() {
  return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
}

export function addPendingResponsavel(user) {
  const list = getPendingResponsaveis();
  if (!list.find((u) => u.id === user.id)) {
    list.push(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function removePendingResponsavel(usuarioId) {
  const list = getPendingResponsaveis().filter((u) => u.id !== Number(usuarioId));
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
