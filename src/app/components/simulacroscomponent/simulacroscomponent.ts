import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Datosservice } from '../../services/datosservice';
import { SIMULACROS } from '../../data/simulacros';

@Component({
  selector: 'app-simulacros',
  imports: [RouterLink, Iconcomponent],
  template: `
  <div class="page-head">
    <div><h2>Micro-simulacros</h2><p>Escenarios hipotéticos de 60 segundos. Decide rápido: el tiempo corre en cada escena.</p></div>
    <div class="filters" style="margin:0">
      @for (f of filtros; track f) { <button [class.on]="filtro() === f" (click)="filtro.set(f)">{{ f }}</button> }
    </div>
  </div>
  <div class="sim-list">
    @for (s of lista(); track s.id) {
      <article class="card sim-card card-hover">
        <div class="sim-cover" [style.background]="'linear-gradient(135deg,' + s.color + '26,' + s.color + '08)'">
          <svg viewBox="0 0 320 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path d="M0 95 H 60 L 75 55 L 92 135 L 110 40 L 128 120 L 142 80 L 156 98 H 320" fill="none" [attr.stroke]="s.color" stroke-width="3" stroke-linejoin="round" opacity=".7"/>
          </svg>
          <span class="chip" style="background:var(--surface)">{{ s.espacio }}</span>
          <span class="dur">60 s</span>
        </div>
        <div class="sim-body">
          <div class="meta"><span>{{ s.escenas.length }} decisiones</span><span>·</span><span>{{ s.dificultad }}</span></div>
          <h3>{{ s.titulo }}</h3>
          <p>{{ s.resumen }}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
            @if (datos.mejores()[s.id] !== undefined) {
              <span class="best"><app-icon name="award" /> Mejor: {{ datos.mejores()[s.id] }} pts</span>
            } @else { <span class="hint">Sin intentos</span> }
            <a class="btn btn-dark btn-sm" [routerLink]="s.id"><app-icon name="play" /> {{ datos.mejores()[s.id] !== undefined ? 'Repetir' : 'Jugar' }}</a>
          </div>
        </div>
      </article>
    }
  </div>`,
})
export class Simulacroscomponent {
  datos = inject(Datosservice)
  filtros = ['Todos', 'Aula', 'Oficina', 'Laboratorio', 'Biblioteca']
  filtro = signal('Todos')
  lista = computed(() => this.filtro() === 'Todos' ? SIMULACROS : SIMULACROS.filter(s => s.espacio === this.filtro()))
}
