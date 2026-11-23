import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; texto: string; tipo: 'ok' | 'warn' | 'bad' }

@Injectable({ providedIn: 'root' })
export class Toastservice {
  toasts = signal<Toast[]>([])
  private n = 0

  mostrar(texto: string, tipo: Toast['tipo'] = 'ok') {
    const id = ++this.n
    this.toasts.update(t => [...t, { id, texto, tipo }])
    setTimeout(() => this.toasts.update(t => t.filter(x => x.id !== id)), 3200)
  }
}
