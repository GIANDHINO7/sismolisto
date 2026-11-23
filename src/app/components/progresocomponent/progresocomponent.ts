import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Datosservice } from '../../services/datosservice';
import { SIMULACROS } from '../../data/simulacros';

@Component({
  selector: 'app-progreso',
  imports: [DatePipe, RouterLink],
  template: `
  <div class="page-head">
    <div><h2>Tu progreso</h2><p>Cómo se compone tu índice de preparación y lo que has logrado.</p></div>
    <span class="chip chip-safe" style="height:36px;font-size:15px">{{ datos.nivel() }} · {{ datos.preparacion() }}%</span>
  </div>

  <div class="grid-4">
    @for (c of componentes(); track c.t) {
      <div class="card kpi">
        <div class="top">{{ c.t }} <small style="font-family:var(--f-mono)">peso {{ c.peso }}%</small></div>
        <strong>{{ c.v }}%</strong>
        <div class="bar" style="margin-top:12px"><i [style.width.%]="c.v" [style.background]="c.color"></i></div>
      </div>
    }
  </div>

  <div class="grid-2" style="margin-top:16px">
    <div class="card">
      <h3 class="ct">Últimos simulacros <a class="link" style="font-size:14px" routerLink="/app/simulacros">Practicar</a></h3>
      @if (ultimos().length) {
        <div class="chart" role="img" aria-label="Puntajes de los últimos simulacros">
          @for (r of ultimos(); track $index) {
            <div class="col"><i [style.height.%]="r.puntaje || 2" [attr.data-v]="r.puntaje"></i><small>{{ r.fecha | date:'d/M' }}</small></div>
          }
        </div>
      } @else {
        <div class="empty">Aún no hay resultados. ¡Haz tu primer micro-simulacro!</div>
      }
    </div>
    <div class="card">
      <h3 class="ct">Mejor puntaje por escenario</h3>
      <div style="display:grid;gap:14px">
        @for (s of sims; track s.id) {
          <div>
            <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span>{{ s.titulo }}</span><b style="font-family:var(--f-mono)">{{ datos.mejores()[s.id] ?? '—' }}</b></div>
            <div class="bar"><i [style.width.%]="datos.mejores()[s.id] ?? 0" [style.background]="s.color"></i></div>
          </div>
        }
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <h3 class="ct">Logros <span class="chip">{{ obtenidos() }}/{{ datos.logros().length }}</span></h3>
    <div class="badges">
      @for (l of datos.logros(); track l.t) {
        <div class="badge-card" [class.got]="l.ok"><div class="em">{{ l.em }}</div><b>{{ l.t }}</b><small>{{ l.d }}</small></div>
      }
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <h3 class="ct">Actividad reciente</h3>
    @if (datos.actividad().length) {
      <div class="timeline">
        @for (a of datos.actividad().slice(0, 12); track $index) {
          <div class="tl"><span class="d" [style.background]="a.color"></span><span>{{ a.texto }}</span><small>{{ a.fecha | date:'d MMM, HH:mm' }}</small></div>
        }
      </div>
    } @else {
      <div class="empty">Tu historial aparecerá aquí.</div>
    }
  </div>`,
})
export class Progresocomponent {
  datos = inject(Datosservice)
  sims = SIMULACROS
  ultimos = computed(() => this.datos.resultados().slice(-10))
  obtenidos = computed(() => this.datos.logros().filter(l => l.ok).length)
  componentes = computed(() => [
    { t: 'Evaluación', v: this.datos.pctEvaluacion(), peso: 35, color: 'var(--safe)' },
    { t: 'Simulacros', v: this.datos.pctSimulacros(), peso: 30, color: 'var(--alert)' },
    { t: 'Checklist', v: this.datos.pctChecklist(), peso: 25, color: 'var(--info)' },
    { t: 'Riesgos resueltos', v: this.datos.pctRiesgos(), peso: 10, color: 'var(--danger)' },
  ])
}
