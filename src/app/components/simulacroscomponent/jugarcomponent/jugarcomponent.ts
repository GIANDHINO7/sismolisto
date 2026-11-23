import { Component, HostListener, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Iconcomponent } from '../../iconcomponent/iconcomponent';
import { Datosservice } from '../../../services/datosservice';
import { Toastservice } from '../../../services/toastservice';
import { SIMULACROS, puntosCalidad } from '../../../data/simulacros';
import { Calidad, OpcionDTO } from '../../../models/SimulacroDTO';

type Fase = 'intro' | 'cuenta' | 'escena' | 'fin'

@Component({
  selector: 'app-jugar',
  imports: [RouterLink, Iconcomponent],
  templateUrl: './jugarcomponent.html',
})
export class Jugarcomponent implements OnDestroy {
  private datos = inject(Datosservice)
  private toast = inject(Toastservice)
  id = input.required<string>()

  sim = computed(() => SIMULACROS.find(s => s.id === this.id()))
  fase = signal<Fase>('intro')
  cuenta = signal(3)
  idx = signal(0)
  escena = computed(() => this.sim()?.escenas[this.idx()])
  restante = signal(0)
  elegida = signal<OpcionDTO | null>(null)
  agotado = signal(false)
  decisiones = signal<Calidad[]>([])
  sacude = signal(false)
  usados = 0
  /** Orden aleatorio de opciones por escena (evita memorizar posiciones). */
  orden = signal<OpcionDTO[]>([])
  circ = 2 * Math.PI * 32
  letras = ['A', 'B', 'C', 'D']

  puntaje = computed(() => {
    const d = this.decisiones()
    return d.length ? Math.round(d.reduce((a, c) => a + puntosCalidad[c], 0) / d.length) : 0
  })
  mejorPrevio = computed(() => this.datos.mejores()[this.id()])

  private t?: ReturnType<typeof setInterval>

  empezar() {
    this.fase.set('cuenta'); this.cuenta.set(3)
    this.idx.set(0); this.decisiones.set([]); this.usados = 0
    const c = setInterval(() => {
      if (this.cuenta() === 1) { clearInterval(c); this.iniciarEscena() } else this.cuenta.update(n => n - 1)
    }, 800)
  }

  private iniciarEscena() {
    const e = this.escena()!
    this.fase.set('escena')
    this.elegida.set(null); this.agotado.set(false)
    this.orden.set([...e.opciones].sort(() => Math.random() - .5))
    this.restante.set(e.segundos)
    if (e.sacudida) {
      this.sacude.set(true)
      try { navigator.vibrate?.([200, 80, 300, 80, 200]) } catch { /* sin vibración */ }
      setTimeout(() => this.sacude.set(false), 850)
    }
    clearInterval(this.t)
    this.t = setInterval(() => {
      this.restante.update(s => s - 1)
      this.usados++
      if (this.restante() <= 0) { clearInterval(this.t); this.agotado.set(true); this.decisiones.update(d => [...d, 'bad']) }
    }, 1000)
  }

  elegir(o: OpcionDTO) {
    if (this.elegida() || this.agotado()) return
    clearInterval(this.t)
    this.elegida.set(o)
    this.decisiones.update(d => [...d, o.calidad])
  }

  siguiente() {
    const s = this.sim()!
    if (this.idx() < s.escenas.length - 1) { this.idx.update(i => i + 1); this.iniciarEscena(); return }
    this.fase.set('fin')
    const previo = this.mejorPrevio()
    this.datos.registrarResultado({ simId: s.id, puntaje: this.puntaje(), fecha: new Date().toISOString(), decisiones: this.decisiones(), segundos: this.usados })
    if (previo !== undefined && this.puntaje() > previo) this.toast.mostrar('¡Nuevo récord personal!')
  }

  claseOpcion(o: OpcionDTO) {
    const e = this.elegida()
    if (!e && !this.agotado()) return ''
    if (o === e) return o.calidad
    if (o.calidad === 'good') return 'good'
    return ''
  }

  @HostListener('window:keydown', ['$event'])
  teclas(ev: KeyboardEvent) {
    if (this.fase() !== 'escena') return
    const i = ['1', '2', '3', 'a', 'b', 'c'].indexOf(ev.key.toLowerCase()) % 3
    if (i >= 0 && !this.elegida() && !this.agotado()) this.elegir(this.orden()[i])
    else if (ev.key === 'Enter' && (this.elegida() || this.agotado())) this.siguiente()
  }

  ngOnDestroy() { clearInterval(this.t) }
}
