import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Authservice } from '../../services/authservice';
import { Datosservice, nombreEspacio, preguntasDe } from '../../services/datosservice';
import { Toastservice } from '../../services/toastservice';
import { ESPACIOS } from '../../data/contenido';
import { EvaluacionDTO, Respuesta } from '../../models/EvaluacionDTO';
import { ConCambios } from '../../shared/guards';

@Component({
  selector: 'app-evaluar',
  imports: [RouterLink, Iconcomponent],
  templateUrl: './evaluarcomponent.html',
})
export class Evaluarcomponent implements ConCambios {
  private auth = inject(Authservice)
  datos = inject(Datosservice)
  private toast = inject(Toastservice)
  private router = inject(Router)

  espacios = computed(() => {
    const t = this.auth.usuario()?.tipo
    return [...ESPACIOS].sort((a, b) => +(b.para === t || b.para === 'ambos') - +(a.para === t || a.para === 'ambos'))
  })
  espacio = signal<string | null>(null)
  paso = signal(0) // 0 = elegir espacio, 1..n = preguntas
  respuestas = signal<Record<string, Respuesta>>({})
  resultado = signal<EvaluacionDTO | null>(null)
  sucio = signal(false)
  circ = 2 * Math.PI * 70
  nombreEspacio = nombreEspacio

  preguntas = computed(() => this.espacio() ? preguntasDe(this.espacio()!) : [])
  pregunta = computed(() => this.preguntas()[this.paso() - 1])
  total = computed(() => this.preguntas().length)
  nuevosRiesgos = computed(() => this.preguntas().filter(p => this.respuestas()[p.id] === 'no'))

  // Diálogos
  dialogo = signal<null | 'salir' | 'pendientes'>(null)
  private resolver?: (v: boolean) => void

  constructor() {
    const b = this.datos.borrador()
    if (b) { this.espacio.set(b.espacio); this.paso.set(b.paso); this.respuestas.set(b.respuestas) }
  }

  elegir(id: string) {
    if (this.espacio() !== id) this.respuestas.set({})
    this.espacio.set(id)
  }
  empezar() { if (this.espacio()) { this.paso.set(1); this.sucio.set(true); this.autoguardar() } }

  responder(r: Respuesta) {
    const p = this.pregunta()
    this.respuestas.update(x => ({ ...x, [p.id]: r }))
    this.sucio.set(true)
    this.autoguardar()
    setTimeout(() => { if (this.paso() < this.total()) this.siguiente() }, 260)
  }

  siguiente() { this.paso.update(p => Math.min(p + 1, this.total())); this.autoguardar() }
  anterior() { this.paso.update(p => Math.max(p - 1, 0)); this.autoguardar() }

  finalizar(forzar = false) {
    const faltan = this.preguntas().filter(p => !this.respuestas()[p.id])
    if (faltan.length && !forzar) { this.dialogo.set('pendientes'); return }
    const resp = { ...this.respuestas() }
    faltan.forEach(p => resp[p.id] = 'ns')
    this.resultado.set(this.datos.completarEvaluacion(this.espacio()!, resp))
    this.sucio.set(false)
    this.dialogo.set(null)
    this.toast.mostrar('Evaluación guardada')
  }

  completarPendientes() {
    const i = this.preguntas().findIndex(p => !this.respuestas()[p.id])
    this.paso.set(i + 1)
    this.dialogo.set(null)
  }

  nueva() {
    this.resultado.set(null); this.espacio.set(null); this.paso.set(0); this.respuestas.set({})
  }

  private autoguardar() {
    if (this.espacio() && this.paso() > 0) this.datos.guardarBorrador({ espacio: this.espacio()!, paso: this.paso(), respuestas: this.respuestas() })
  }

  // ---------- Salida con cambios ----------
  puedeSalir(): boolean | Promise<boolean> {
    if (!this.sucio() || this.resultado()) return true
    this.dialogo.set('salir')
    return new Promise<boolean>(res => this.resolver = res)
  }
  decidirSalida(accion: 'seguir' | 'guardar' | 'descartar') {
    if (accion === 'guardar') { this.autoguardar(); this.toast.mostrar('Borrador guardado. Puedes continuar después.') }
    if (accion === 'descartar') this.datos.guardarBorrador(null)
    this.dialogo.set(null)
    this.resolver?.(accion !== 'seguir')
    this.resolver = undefined
  }

  @HostListener('window:keydown', ['$event'])
  teclas(e: KeyboardEvent) {
    if (this.paso() < 1 || this.resultado() || this.dialogo() || (e.target as HTMLElement).tagName === 'INPUT') return
    if (e.key === '1') this.responder('si')
    if (e.key === '2') this.responder('no')
    if (e.key === '3') this.responder('ns')
  }

  verRiesgos() { this.router.navigate(['/app/riesgos']) }
}
