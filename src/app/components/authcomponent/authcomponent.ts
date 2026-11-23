import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Logocomponent } from '../logocomponent/logocomponent';
import { Ondascomponent } from '../ondascomponent/ondascomponent';
import { Authservice } from '../../services/authservice';
import { CHECKLIST } from '../../data/contenido';
import { SIMULACROS } from '../../data/simulacros';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, Logocomponent, Ondascomponent],
  template: `
  <div class="auth">
    <aside class="auth-side">
      <app-ondas [paso]="24" />
      <app-logo />
      <div class="auth-role-art" aria-hidden="true">
        @if (auth.rolElegido() === 'estudiante') {
          <span class="ar-emoji">🎓</span>
        } @else {
          <span class="ar-emoji">💼</span>
        }
      </div>
      @for (c of [contenido()]; track c.h) {
        <div class="auth-copy">
          <span class="auth-kicker">{{ c.k }}</span>
          <h2>{{ c.h }}</h2>
          <p>{{ c.p }}</p>
          <div class="auth-stats">
            @for (s of c.s; track s.l) { <div><b>{{ s.v }}</b><small>{{ s.l }}</small></div> }
          </div>
        </div>
      }
      <small class="auth-hint">Toca el fondo para generar un epicentro</small>
    </aside>
    <main class="auth-main"><router-outlet /></main>
  </div>`,
})
export class Authcomponent {
  auth = inject(Authservice)
  contenido = computed(() => this.auth.rolElegido() === 'estudiante'
    ? { k: 'PORTAL ESTUDIANTE', h: 'Tu aula cambia cada día. Tu preparación también.', p: 'Evalúa aulas, laboratorios y bibliotecas, ubica la zona segura en segundos y practica entre clase y clase.',
        s: [{ v: '<10 s', l: 'para ubicar la zona segura' }, { v: String(SIMULACROS.length), l: 'micro-simulacros' }, { v: '60 s', l: 'por práctica' }] }
    : { k: 'PORTAL OFICINA', h: 'Tu puesto de trabajo también debe estar listo.', p: 'Revisa mobiliario y objetos en altura, conoce rutas alternas en pisos elevados y comparte el checklist con tu equipo.',
        s: [{ v: '2', l: 'rutas de evacuación' }, { v: String(CHECKLIST.length), l: 'ítems de checklist' }, { v: '0', l: 'ascensores en un sismo' }] })
}
