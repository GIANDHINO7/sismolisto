import { Component, ElementRef, NgZone, OnDestroy, OnInit, effect, inject, input, output, viewChild } from '@angular/core';
import { Sismoservice } from '../../services/sismoservice';

interface Onda { x: number; y: number; t0: number; f: number }

/**
 * Campo sísmico interactivo: una malla de líneas que se deforma con ondas.
 * - Mover el mouse levanta el terreno cercano.
 * - Clic / toque en una zona vacía crea un epicentro.
 * - Escucha los sismos globales de Sismoservice.
 */
@Component({
  selector: 'app-ondas',
  template: `<canvas #cv aria-hidden="true"></canvas>`,
  host: { class: 'ondas' },
})
export class Ondascomponent implements OnInit, OnDestroy {
  /** Separación de la malla en px. */
  paso = input(26)
  /** Crear epicentros al hacer clic. */
  interactivo = input(true)
  /** Microsismos automáticos cada cierto tiempo. */
  ambiente = input(true)
  /** Energía actual (0..1) para paneles HUD. */
  energia = output<number>()
  /** Epicentro creado por el usuario (coordenadas relativas 0..1). */
  impacto = output<{ x: number; y: number }>()

  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv')
  private host = inject(ElementRef<HTMLElement>)
  private zone = inject(NgZone)
  private sismo = inject(Sismoservice)

  private ctx!: CanvasRenderingContext2D
  private w = 0; private h = 0; private dpr = 1
  private ondas: Onda[] = []
  private mx = -999; private my = -999; private mFuerza = 0
  private raf = 0
  private visible = true
  private io?: IntersectionObserver
  private ro?: ResizeObserver
  private ultimoAmbiente = 0
  private ultimaEnergia = 0
  private colorBase = [25, 195, 125]
  private reducido = matchMedia('(prefers-reduced-motion: reduce)').matches

  constructor() {
    effect(() => {
      const p = this.sismo.pulso()
      if (!p || !this.ctx) return
      const r = this.host.nativeElement.getBoundingClientRect()
      const x = p.x - r.left, y = p.y - r.top
      if (x < -200 || y < -200 || x > r.width + 200 || y > r.height + 200) return
      this.agregar(x, y, p.fuerza)
    })
  }

  ngOnInit() {
    const cv = this.cv().nativeElement
    this.ctx = cv.getContext('2d')!
    this.leerColor()
    this.ro = new ResizeObserver(() => this.medir())
    this.ro.observe(this.host.nativeElement)
    this.io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting })
    this.io.observe(this.host.nativeElement)
    this.medir()
    this.zone.runOutsideAngular(() => {
      addEventListener('pointermove', this.onMove, { passive: true })
      addEventListener('pointerdown', this.onDown)
      this.raf = requestAnimationFrame(this.frame)
    })
    // sismo de bienvenida
    setTimeout(() => this.agregar(this.w * .72, this.h * .45, 1.1), 500)
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf)
    removeEventListener('pointermove', this.onMove)
    removeEventListener('pointerdown', this.onDown)
    this.io?.disconnect(); this.ro?.disconnect()
  }

  /** Crea una onda en coordenadas locales. */
  agregar(x: number, y: number, f = 1) {
    this.ondas.push({ x, y, t0: performance.now(), f: this.reducido ? f * .35 : f })
    if (this.ondas.length > 10) this.ondas.shift()
  }

  private leerColor() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--safe-2').trim()
    const m = v.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
    if (m) this.colorBase = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
  }

  private medir() {
    const r = this.host.nativeElement.getBoundingClientRect()
    this.dpr = Math.min(devicePixelRatio || 1, 2)
    this.w = r.width; this.h = r.height
    const cv = this.cv().nativeElement
    cv.width = this.w * this.dpr; cv.height = this.h * this.dpr
    cv.style.width = this.w + 'px'; cv.style.height = this.h + 'px'
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  private onMove = (e: PointerEvent) => {
    const r = this.host.nativeElement.getBoundingClientRect()
    this.mx = e.clientX - r.left; this.my = e.clientY - r.top
  }

  private onDown = (e: PointerEvent) => {
    if (!this.interactivo()) return
    const t = e.target as HTMLElement
    if (t.closest('a,button,input,select,textarea,label,[role=button],.no-onda')) return
    const r = this.host.nativeElement.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    if (x < 0 || y < 0 || x > r.width || y > r.height) return
    this.agregar(x, y, 1.2)
    this.sismo.retumbo(.35, 900)
    this.zone.run(() => this.impacto.emit({ x: x / r.width, y: y / r.height }))
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame)
    if (!this.visible || document.hidden || !this.w) return
    if (this.ambiente() && now - this.ultimoAmbiente > 5200) {
      this.ultimoAmbiente = now
      this.agregar(Math.random() * this.w, Math.random() * this.h, .35 + Math.random() * .35)
    }
    if (this.frameCount++ % 120 === 0) this.leerColor()

    const ctx = this.ctx, paso = this.paso(), V = .42 // velocidad px/ms
    ctx.clearRect(0, 0, this.w, this.h)
    this.ondas = this.ondas.filter(o => now - o.t0 < 4200)
    this.mFuerza += ((this.mx > 0 ? 1 : 0) - this.mFuerza) * .05

    const [cr, cg, cb] = this.colorBase
    let energia = 0
    const cols = Math.ceil(this.w / paso) + 1, filas = Math.ceil(this.h / paso) + 1
    const t = now / 1000

    for (let j = 0; j < filas; j++) {
      const y0 = j * paso
      ctx.beginPath()
      let maxRow = 0
      const puntos: [number, number, number][] = []
      for (let i = 0; i < cols; i++) {
        const x0 = i * paso
        let dy = Math.sin(x0 * .012 + t * .9 + j * .4) * 1.2 // respiración del terreno
        let e = 0
        for (const o of this.ondas) {
          const dt = Math.max(0, now - o.t0)
          const r = dt * V
          const d = Math.hypot(x0 - o.x, y0 - o.y)
          const ancho = 60 + dt * .03
          const k = (d - r) / ancho
          if (k < -3 || k > 3) continue
          const dec = Math.exp(-dt / 1600) * o.f
          const a = Math.exp(-k * k) * dec
          dy += Math.sin((d - r) * .09) * a * 26
          e += a
        }
        const dm = Math.hypot(x0 - this.mx, y0 - this.my)
        if (dm < 180) {
          const a = (1 - dm / 180) ** 2 * this.mFuerza
          dy -= a * 14
          e += a * .5
        }
        if (e > maxRow) maxRow = e
        if (e > energia) energia = e
        puntos.push([x0, y0 + dy, e])
        if (i === 0) ctx.moveTo(x0, y0 + dy); else ctx.lineTo(x0, y0 + dy)
      }
      const alpha = .07 + Math.min(.35, maxRow * .35)
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`
      ctx.lineWidth = 1
      ctx.stroke()
      for (const [x, y, e] of puntos) {
        if (e < .04 && (x / paso + j) % 2) continue
        const c = Math.min(1, e)
        // de color base a ámbar y rojo con la energía
        const r = c < .5 ? cr + (245 - cr) * c * 2 : 245 + (229 - 245) * (c - .5) * 2
        const g = c < .5 ? cg + (165 - cg) * c * 2 : 165 + (72 - 165) * (c - .5) * 2
        const b = c < .5 ? cb + (36 - cb) * c * 2 : 36 + (77 - 36) * (c - .5) * 2
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${.18 + c * .8})`
        const s = 1.1 + c * 2.6
        ctx.fillRect(x - s / 2, y - s / 2, s, s)
      }
    }

    // anillos de los epicentros
    for (const o of this.ondas) {
      const dt = Math.max(0, now - o.t0)
      const a = Math.max(0, 1 - dt / 2600) * Math.min(1, o.f)
      if (a <= 0) continue
      ctx.beginPath()
      ctx.arc(o.x, o.y, dt * V, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(245,165,36,${a * .45})`
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(o.x, o.y, dt * V * .58, 0, Math.PI * 2) // onda S: más lenta y destructiva que la P (anillo exterior)
      ctx.strokeStyle = `rgba(229,72,77,${a * .3})`
      ctx.stroke()
      ctx.fillStyle = `rgba(229,72,77,${a})`
      ctx.beginPath(); ctx.arc(o.x, o.y, 4 + Math.sin(dt / 80) * 1.5, 0, Math.PI * 2); ctx.fill()
    }

    if (now - this.ultimaEnergia > 110) {
      this.ultimaEnergia = now
      const v = Math.min(1, energia)
      this.zone.run(() => this.energia.emit(v))
    }
  }
  private frameCount = 0
}
