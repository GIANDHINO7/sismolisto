import { Injectable, signal } from '@angular/core';
import { guardar } from '../shared/storage';

@Injectable({ providedIn: 'root' })
export class Temaservice {
  oscuro = signal(document.documentElement.getAttribute('data-theme') === 'dark')

  alternar() {
    const o = !this.oscuro()
    this.oscuro.set(o)
    document.documentElement.setAttribute('data-theme', o ? 'dark' : 'light')
    guardar('sl.tema', o ? 'dark' : 'light')
  }
}
