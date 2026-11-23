/** Acceso seguro a localStorage (modo privado o almacenamiento bloqueado no rompe la app). */
export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const v = localStorage.getItem(clave)
    return v ? (JSON.parse(v) as T) : porDefecto
  } catch {
    return porDefecto
  }
}

export function guardar(clave: string, valor: unknown): void {
  try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* sin almacenamiento */ }
}

export function borrar(clave: string): void {
  try { localStorage.removeItem(clave) } catch { /* sin almacenamiento */ }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
