import { Component, HostListener, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { Sismoservice } from '../../services/sismoservice';
import { Authservice } from '../../services/authservice';
import { guardar } from '../../shared/storage';

type Fase = 'aviso' | 'agachate' | 'cubrete' | 'sujetate' | 'resultado'
interface Opcion { t: string; e: string; ok: boolean; d: string }

const OPCIONES: Record<'estudiante' | 'oficina', Opcion[]> = {
  estudiante: [
    { t: 'Bajo la mesa de trabajo, sujetando una pata', e: '🪑', ok: true, d: 'Correcto: una mesa firme te protege de objetos que caen.' },
    { t: 'Correr hacia la puerta del aula', e: '🏃', ok: false, d: 'Correr durante la sacudida provoca caídas y atoros en la puerta.' },
    { t: 'Junto a la ventana para ver qué pasa', e: '🪟', ok: false, d: 'Los vidrios pueden romperse: aléjate de ventanas.' },
    { t: 'Al lado del estante de libros', e: '📚', ok: false, d: 'Los estantes sin anclaje pueden volcarse sobre ti.' },
  ],
  oficina: [
    { t: 'Bajo el escritorio, sujetando una pata', e: '🗄️', ok: true, d: 'Correcto: el escritorio te cubre de lámparas y objetos que caen.' },
    { t: 'Tomar el ascensor para bajar rápido', e: '🛗', ok: false, d: 'Nunca uses el ascensor: puede detenerse entre pisos.' },
    { t: 'Junto al archivador alto', e: '🗃️', ok: false, d: 'Los archivadores altos sin anclaje se vuelcan con facilidad.' },
    { t: 'Bajar corriendo por la escalera', e: '🏃', ok: false, d: 'Evacúa cuando la sacudida termine, no durante ella.' },
  ],
}

const SUJETAR_MS = 5000

@Component({
  selector: 'app-alerta',
  template: `
  @if (sismo.alerta()) {
    <div class="alerta" [class]="'alerta f-' + fase()" role="dialog" aria-modal="true" aria-labelledby="al-t">
      <div class="alerta-bg"></div>
      <button class="alerta-x" (click)="cerrar()" aria-label="Salir del simulacro">✕</button>

      @switch (fase()) {
        @case ('aviso') {
          <div class="al-box">
            <span class="al-tag">SIMULACRO · ALERTA SÍSMICA</span>
            <h2 id="al-t">Sismo en camino</h2>
            <p>Llegada estimada de la onda S en</p>
            <div class="al-count">{{ cuenta() }}</div>
            <p class="al-small">Cuando la pantalla tiemble, completa las tres acciones lo más rápido posible:<br><b>Agáchate → Cúbrete → Sujétate</b></p>
          </div>
        }
        @case ('agachate') {
          <div class="al-box">
            <span class="al-tag">PASO 1 DE 3</span>
            <h2 id="al-t" class="al-big">¡AGÁCHATE!</h2>
            <p>Ponte de rodillas para no caer. Presiona el botón o la flecha ↓</p>
            <button class="al-btn al-down" (click)="agachar()" autofocus><span>⬇</span> Agacharme</button>
          </div>
        }
        @case ('cubrete') {
          <div class="al-box al-wide">
            <span class="al-tag">PASO 2 DE 3</span>
            <h2 id="al-t" class="al-big">¡CÚBRETE!</h2>
            <p>¿Dónde te proteges? Elige rápido.</p>
            <div class="al-opts">
              @for (o of opciones(); track o.t; let i = $index) {
                <button class="al-opt" [class.bad]="malas().has(i)" [disabled]="malas().has(i)" (click)="cubrir(i)">
                  <span class="al-emoji">{{ o.e }}</span><b>{{ o.t }}</b>
                  @if (malas().has(i)) { <small>{{ o.d }}</small> } @else { <kbd>{{ i + 1 }}</kbd> }
                </button>
              }
            </div>
          </div>
        }
        @case ('sujetate') {
          <div class="al-box">
            <span class="al-tag">PASO 3 DE 3</span>
            <h2 id="al-t" class="al-big">¡SUJÉTATE!</h2>
            <p>Mantén presionado hasta que termine la sacudida (o mantén la barra espaciadora).</p>
            <button class="al-hold" [class.on]="sujetando()"
              (pointerdown)="sujetar(true, $event)" (pointerup)="sujetar(false)" (pointerleave)="sujetar(false)" (pointercancel)="sujetar(false)"
              (contextmenu)="$event.preventDefault()">
              <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" [attr.stroke-dasharray]="327" [attr.stroke-dashoffset]="327 * (1 - progreso())"/></svg>
              <span>{{ sujetando() ? '✊' : '🖐️' }}<small>{{ sujetando() ? 'Sujetando…' : 'Mantén presionado' }}</small></span>
            </button>
            @if (soltadas()) { <p class="al-warn">Te soltaste {{ soltadas() }} {{ soltadas() === 1 ? 'vez' : 'veces' }}: no sueltes la mesa mientras tiemble.</p> }
          </div>
        }
        @case ('resultado') {
          <div class="al-box al-wide al-result">
            <span class="al-tag ok">SACUDIDA TERMINADA</span>
            <div class="al-score">
              <svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" class="bg"/><circle cx="80" cy="80" r="70" class="fg" [attr.stroke-dasharray]="440" [attr.stroke-dashoffset]="440 * (1 - puntaje() / 100)"/></svg>
              <div><b>{{ puntaje() }}</b><small>PUNTOS</small></div>
            </div>
            <h2 id="al-t">{{ veredicto() }}</h2>
            @if (record()) { <p class="al-rec">🏆 ¡Nuevo récord personal!</p> } @else { <p class="al-small">Tu récord: {{ mejor() }} pts</p> }
            <div class="al-break">
              <div><small>Agáchate</small><b>{{ (tAgachar() / 1000).toFixed(2) }} s</b><i [style.width.%]="pAgachar() / 30 * 100"></i></div>
              <div><small>Cúbrete</small><b>{{ (tCubrir() / 1000).toFixed(2) }} s · {{ malas().size ? malas().size + ' error' + (malas().size > 1 ? 'es' : '') : 'sin errores' }}</b><i [style.width.%]="pCubrir() / 35 * 100"></i></div>
              <div><small>Sujétate</small><b>{{ soltadas() ? soltadas() + ' soltada' + (soltadas() > 1 ? 's' : '') : 'firme todo el tiempo' }}</b><i [style.width.%]="pSujetar() / 35 * 100"></i></div>
            </div>
            <p class="al-small">Después de la sacudida: revisa si hay heridos, evacúa con calma por la ruta señalizada y no uses ascensores.</p>
            <div class="al-actions">
              <button class="btn btn-light btn-lg" (click)="cerrar()">Cerrar</button>
              <button class="btn btn-primary btn-lg" (click)="iniciar()">Intentar de nuevo</button>
            </div>
            <p class="al-legal">Simulación didáctica. Ante un sismo real sigue los protocolos de INDECI y de tu institución.</p>
          </div>
        }
      }
    </div>
  }`,
})
export class Alertacomponent implements OnDestroy {
  sismo = inject(Sismoservice)
  private auth = inject(Authservice)

  fase = signal<Fase>('aviso')
  cuenta = signal(5)
  opciones = signal<Opcion[]>([])
  malas = signal(new Set<number>())
  sujetando = signal(false)
  progreso = signal(0)
  soltadas = signal(0)
  tAgachar = signal(0)
  tCubrir = signal(0)
  mejor = this.sismo.mejorAlerta
  record = signal(false)

  pAgachar = computed(() => Math.round(30 * Math.max(0, Math.min(1, (4000 - this.tAgachar()) / 3200))))
  pCubrir = computed(() => {
    if (this.malas().size) return Math.max(0, 14 - (this.malas().size - 1) * 7)
    return Math.round(35 * Math.max(.5, Math.min(1, (7000 - this.tCubrir()) / 5000)))
  })
  pSujetar = computed(() => Math.max(0, 35 - this.soltadas() * 8))
  puntaje = computed(() => this.pAgachar() + this.pCubrir() + this.pSujetar())
  veredicto = computed(() => {
    const p = this.puntaje()
    return p >= 85 ? 'Reacción de experto' : p >= 65 ? 'Buena reacción' : p >= 40 ? 'Puedes reaccionar más rápido' : 'Sigue practicando'
  })

  private timers: ReturnType<typeof setTimeout>[] = []
  private t0 = 0
  private paraSirena?: () => void
  private temblor?: { detener: () => void; ajustar: (f: number) => void }
  private ultimoTick = 0
  private raf = 0

  constructor() {
    effect(() => { if (this.sismo.alerta()) queueMicrotask(() => this.iniciar()) })
  }

  iniciar() {
    this.limpiar()
    this.fase.set('aviso'); this.cuenta.set(5); this.malas.set(new Set()); this.progreso.set(0)
    this.soltadas.set(0); this.record.set(false); this.sujetando.set(false)
    const tipo = this.auth.usuario()?.tipo ?? 'estudiante'
    this.opciones.set([...OPCIONES[tipo]].sort(() => Math.random() - .5))
    this.paraSirena = this.sismo.sirena(5)
    for (let i = 1; i <= 5; i++) this.timers.push(setTimeout(() => { this.cuenta.set(5 - i); this.sismo.bip(i === 5 ? 1200 : 700, 120) }, i * 1000))
    this.timers.push(setTimeout(() => {
      this.temblor = this.sismo.temblor(.55)
      this.fase.set('agachate'); this.t0 = performance.now()
    }, 5200))
  }

  agachar() {
    if (this.fase() !== 'agachate') return
    this.tAgachar.set(performance.now() - this.t0)
    this.sismo.bip(520, 80)
    this.temblor?.ajustar(.75)
    this.fase.set('cubrete'); this.t0 = performance.now()
  }

  cubrir(i: number) {
    if (this.fase() !== 'cubrete' || this.malas().has(i)) return
    const o = this.opciones()[i]
    if (!o.ok) { this.malas.update(s => new Set(s).add(i)); this.sismo.bip(180, 220, .12); return }
    this.tCubrir.set(performance.now() - this.t0)
    this.sismo.bip(660, 80)
    this.temblor?.ajustar(1)
    this.fase.set('sujetate')
    this.ultimoTick = performance.now()
    const loop = (now: number) => {
      if (this.fase() !== 'sujetate') return
      const dt = now - this.ultimoTick; this.ultimoTick = now
      if (this.sujetando()) this.progreso.update(p => Math.min(1, p + dt / SUJETAR_MS))
      this.temblor?.ajustar(1 - this.progreso() * .7)
      if (this.progreso() >= 1) { this.terminar(); return }
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  sujetar(on: boolean, e?: PointerEvent) {
    if (this.fase() !== 'sujetate') return
    if (e) (e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    if (!on && this.sujetando() && this.progreso() < 1) this.soltadas.update(n => n + 1)
    this.sujetando.set(on)
  }

  private terminar() {
    this.temblor?.detener(); this.temblor = undefined
    this.sujetando.set(false)
    this.fase.set('resultado')
    this.sismo.bip(880, 120); setTimeout(() => this.sismo.bip(1320, 180), 140)
    if (this.puntaje() > this.mejor()) { this.mejor.set(this.puntaje()); this.record.set(true); guardar('sl.alerta.mejor', this.puntaje()) }
  }

  cerrar() {
    this.limpiar()
    this.sismo.alerta.set(false)
  }

  private limpiar() {
    this.timers.forEach(clearTimeout); this.timers = []
    cancelAnimationFrame(this.raf)
    this.paraSirena?.(); this.paraSirena = undefined
    this.temblor?.detener(); this.temblor = undefined
  }

  @HostListener('document:keydown', ['$event'])
  tecla(e: KeyboardEvent) {
    if (!this.sismo.alerta()) return
    if (e.key === 'Escape') { this.cerrar(); return }
    const f = this.fase()
    if (f === 'agachate' && (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); this.agachar() }
    else if (f === 'cubrete' && /^[1-4]$/.test(e.key)) this.cubrir(+e.key - 1)
    else if (f === 'sujetate' && e.key === ' ') { e.preventDefault(); if (!e.repeat) this.sujetar(true) }
  }

  @HostListener('document:keyup', ['$event'])
  soltar(e: KeyboardEvent) {
    if (this.sismo.alerta() && this.fase() === 'sujetate' && e.key === ' ') this.sujetar(false)
  }

  ngOnDestroy() { this.limpiar() }
}
