import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Ondascomponent } from '../ondascomponent/ondascomponent';
import { Sismoservice } from '../../services/sismoservice';
import { Authservice } from '../../services/authservice';
import { Datosservice, nombreEspacio } from '../../services/datosservice';
import { SIMULACROS } from '../../data/simulacros';
import { CHECKLIST, RECURSOS } from '../../data/contenido';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Iconcomponent, Ondascomponent],
  templateUrl: './iniciocomponent.html',
})
export class Iniciocomponent {
  auth = inject(Authservice)
  datos = inject(Datosservice)
  sismo = inject(Sismoservice)
  mejorAlerta = this.sismo.mejorAlerta
  nombreEspacio = nombreEspacio
  circ = 2 * Math.PI * 70

  saludo = (() => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches' })()

  /** Simulacro recomendado: el primero no jugado del perfil, o el de menor puntaje. */
  recomendado = computed(() => {
    const m = this.datos.mejores()
    const tipo = this.auth.usuario()?.tipo
    const orden = [...SIMULACROS].sort((a, b) => {
      const pa = (a.espacio === 'Oficina') === (tipo === 'oficina') ? 0 : 1
      const pb = (b.espacio === 'Oficina') === (tipo === 'oficina') ? 0 : 1
      return pa - pb
    })
    return orden.find(s => m[s.id] === undefined) ?? orden.reduce((a, b) => (m[a.id] ?? 0) <= (m[b.id] ?? 0) ? a : b)
  })

  tareas = computed(() => {
    const d = this.datos
    const ev = d.evaluaciones().some(e => e.completa)
    return [
      { t: d.borrador() ? 'Continúa tu evaluación' : 'Evalúa tu espacio principal', s: d.borrador() ? `Borrador: ${nombreEspacio(d.borrador()!.espacio)}` : '3 minutos · preguntas guiadas', r: '/app/evaluar', i: 'clipboard', c: 'var(--safe)', ok: ev && !d.borrador() },
      { t: 'Haz tu primer micro-simulacro', s: '60 segundos · ' + this.recomendado().titulo, r: '/app/simulacros/' + this.recomendado().id, i: 'timer', c: 'var(--alert)', ok: d.resultados().length > 0 },
      { t: 'Revisa tus zonas y rutas', s: 'Plano interactivo didáctico', r: '/app/mapa', i: 'map', c: 'var(--info)', ok: false },
      { t: 'Completa la mochila de emergencia', s: `${d.checklist().size}/${CHECKLIST.length} ítems del checklist`, r: '/app/checklist', i: 'bag', c: '#8B5CF6', ok: d.pctChecklist() === 100 },
    ].sort((a, b) => +a.ok - +b.ok)
  })

  hechas = computed(() => this.tareas().filter(t => t.ok).length)

  tip = RECURSOS[new Date().getDate() % RECURSOS.length]
}
