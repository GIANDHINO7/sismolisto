import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbarcomponent } from '../navbarcomponent/navbarcomponent';
import { Footercomponent } from '../footercomponent/footercomponent';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Reveal } from '../../shared/reveal';
import { Ondascomponent } from '../ondascomponent/ondascomponent';
import { Sismoservice } from '../../services/sismoservice';
import { DEMOS } from '../../services/authservice';
import { Authservice } from '../../services/authservice';
import { Toastservice } from '../../services/toastservice';
import { FAQS, RECURSOS, TESTIMONIOS } from '../../data/contenido';
import { SIMULACROS } from '../../data/simulacros';
import { TipoUsuario } from '../../models/UsuarioDTO';

@Component({
  selector: 'app-landing',
  imports: [FormsModule, RouterLink, Navbarcomponent, Footercomponent, Iconcomponent, Reveal, Ondascomponent],
  templateUrl: './landingcomponent.html',
})
export class Landingcomponent implements OnInit, AfterViewInit, OnDestroy {
  private auth = inject(Authservice)
  private toast = inject(Toastservice)
  private router = inject(Router)
  sismo = inject(Sismoservice)

  // ---------- Hero interactivo ----------
  private letras = (t: string) => [...t].map(c => c === ' ' ? ' ' : c)
  titulo1 = this.letras('Prepárate hoy.')
  titulo2 = this.letras('Actúa con ')
  titulo3 = this.letras('claridad.')
  energia = signal(0)
  impactos = signal(0)
  magnitudHud = computed(() => (1.2 + this.energia() * 7.6).toFixed(1))
  colorEnergia = computed(() => { const e = this.energia(); return e > .6 ? '#E5484D' : e > .3 ? '#F5A524' : 'var(--safe-2)' })
  estadoHud = computed(() => { const e = this.energia(); return e > .6 ? 'FUERTE' : e > .3 ? 'MODERADO' : e > .1 ? 'LEVE' : 'CALMA' })
  private tx = signal(0); private ty = signal(0)
  tiltCss = computed(() => `perspective(1200px) rotateY(${this.tx() * 10}deg) rotateX(${-this.ty() * 8}deg)`)
  tilt(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return
    this.tx.set(e.clientX / innerWidth - .5); this.ty.set(e.clientY / innerHeight - .5)
  }
  tiltReset() { this.tx.set(0); this.ty.set(0) }

  // ---------- Portal por rol ----------
  portalHover = signal<TipoUsuario | null>(null)
  portales = [
    { tipo: 'estudiante' as TipoUsuario, emoji: '🎓', tag: 'Universidad', corto: 'estudiante', titulo: 'Portal Estudiante', correo: DEMOS.estudiante.correo,
      desc: 'Aulas, laboratorios y bibliotecas que cambian cada día. Prepárate entre clase y clase.',
      feats: ['Evaluación rápida al cambiar de aula', 'Simulacros de laboratorio y biblioteca', 'Racha, logros y récord de reacción'] },
    { tipo: 'oficina' as TipoUsuario, emoji: '💼', tag: 'Trabajo', corto: 'oficina', titulo: 'Portal Oficina', correo: DEMOS.oficina.correo,
      desc: 'Escritorios, mobiliario alto, salas de reuniones y pisos elevados. Cuida tu puesto y a tu equipo.',
      feats: ['Revisión de tu puesto de trabajo', 'Rutas alternas si la escalera está bloqueada', 'Checklist para compartir con tu equipo'] },
  ]
  tiltCard(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement, r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(.5 - y) * 12}deg`); el.style.setProperty('--ry', `${(x - .5) * 14}deg`)
    el.style.setProperty('--gx', `${x * 100}%`); el.style.setProperty('--gy', `${y * 100}%`)
  }
  tiltCardReset(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg')
    this.portalHover.set(null)
  }
  irPortal(t: TipoUsuario) {
    this.auth.elegirRol(t)
    this.router.navigate(['/ingresar'], { queryParams: { rol: t } })
  }

  // ---------- Laboratorio de magnitud ----------
  labM = signal(6.8)
  escena = signal<'aula' | 'oficina'>('aula')
  temblando = signal(false)
  mUlt = signal(0)
  reaccion = signal(true)
  info = signal<string | null>(null)
  private labCanvas = viewChild<ElementRef<HTMLCanvasElement>>('labCanvas')
  private labRaf = 0
  private labFin = 0
  ampLab = computed(() => Math.max(.08, Math.min(1, (this.labM() - 2.5) / 6.5)))
  colorMag = computed(() => { const m = this.labM(); return m >= 7 ? 'var(--danger)' : m >= 5.5 ? 'var(--alert)' : 'var(--safe)' })
  /** Cada grado de magnitud libera ~31.6 veces más energía. */
  energiaRel = computed(() => {
    const v = Math.pow(31.6, this.labM() - 5)
    return v >= 1000 ? Math.round(v).toLocaleString('es-PE') : v >= 10 ? Math.round(v).toString() : v.toFixed(v < .1 ? 3 : 2)
  })
  mercalli = computed(() => {
    const m = this.labM()
    if (m < 3) return { n: 'I–II', t: 'Apenas perceptible', d: 'Solo lo notan algunas personas en reposo en pisos altos.' }
    if (m < 4) return { n: 'III', t: 'Débil', d: 'Se siente dentro de edificios; las lámparas colgantes se mecen.' }
    if (m < 5) return { n: 'IV–V', t: 'Moderado', d: 'Lo sienten casi todos; vibran ventanas y se inclinan cuadros.' }
    if (m < 6) return { n: 'VI', t: 'Fuerte', d: 'Cuesta caminar; los objetos de estantes empiezan a caer.' }
    if (m < 7) return { n: 'VII–VIII', t: 'Muy fuerte', d: 'Caen libros y objetos pesados, estantes sin anclaje se vuelcan y los monitores caen.' }
    if (m < 8) return { n: 'IX', t: 'Violento', d: 'Se rompen vidrios, cae yeso del techo y el mobiliario se desplaza.' }
    return { n: 'X+', t: 'Extremo', d: 'Daño severo en estructuras vulnerables. La preparación previa marca la diferencia.' }
  })
  objetos: Record<string, { t: string; r: string; f: string; u: number; ok?: boolean }> = {
    lampara: { t: 'Lámpara colgante', u: 3, r: 'Se balancea con cualquier sismo y puede desprenderse si no está bien fijada.', f: 'No te ubiques debajo y verifica que esté asegurada al techo.' },
    cuadro: { t: 'Cuadro / reloj de pared', u: 4.5, r: 'Colgado de un solo clavo se inclina y cae sobre quien esté cerca.', f: 'Usa ganchos cerrados o dos puntos de fijación.' },
    estante: { t: 'Estante / archivador alto', u: 6, r: 'Sin anclaje a la pared, su centro de gravedad alto hace que se vuelque.', f: 'Ánclalo al muro y coloca lo pesado abajo.' },
    ventana: { t: 'Ventana de vidrio', u: 7, r: 'El vidrio se fractura y proyecta fragmentos cortantes.', f: 'Aléjate de ventanas; considera lámina de seguridad.' },
    pizarra: { t: 'Pizarra', u: 7, r: 'Bien anclada es estable, pero los objetos en su repisa pueden caer.', f: 'Mantén la repisa despejada.' },
    aire: { t: 'Equipo de aire acondicionado', u: 7.5, r: 'Equipos pesados en altura pueden desprenderse de su soporte.', f: 'Revisa que el soporte esté certificado y bien fijado.' },
    mesa: { t: 'Mesa o escritorio firme', u: 0, ok: true, r: 'Es tu mejor protección contra objetos que caen.', f: 'Agáchate debajo, cúbrete la cabeza y sujétate de una pata.' },
    persona: { t: 'Tu reacción', u: 0, ok: true, r: 'Correr durante la sacudida es la causa de muchas lesiones.', f: 'Agáchate, cúbrete y sujétate hasta que pase. Luego evacúa con calma.' },
  }
  afectados = computed(() => {
    const m = this.mUlt(), aula = this.escena() === 'aula'
    const l: string[] = []
    if (m >= 3) l.push('lampara')
    if (m >= 4.5) l.push('cuadro')
    if (m >= 6) l.push('estante')
    if (m >= 7) l.push('ventana')
    if (!aula && m >= 7.5) l.push('aire')
    return l
  })
  caido = (u: number) => this.mUlt() >= u
  libros = this.generarLibros()
  shards = [
    { d: 'M60 140l14-6 4 18z', dx: -30, r: -60 }, { d: 'M150 150l12 4-8 14z', dx: 40, r: 90 },
    { d: 'M120 160l14-2-4 14z', dx: 10, r: 140 }, { d: 'M80 165l10 4-10 8z', dx: -10, r: -120 },
  ]
  yeso = Array.from({ length: 14 }, (_, i) => ({ x: 40 + ((i * 97) % 520), s: 4 + (i % 3) * 3, d: (i % 7) * .25 }))

  cambiarEscena(e: 'aula' | 'oficina') { if (this.temblando()) return; this.escena.set(e); this.mUlt.set(0); this.info.set(null) }
  reiniciarLab() { this.mUlt.set(0); this.info.set(null) }
  desatar() {
    if (this.temblando()) return
    this.mUlt.set(0)
    const m = this.labM()
    const dur = 2600 + this.ampLab() * 2200
    // un frame después para que las animaciones de caída se reinicien
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.temblando.set(true)
      this.mUlt.set(m)
      this.labFin = performance.now() + dur
      this.sismo.retumbo(Math.min(1, .25 + this.ampLab()), dur)
      try { navigator.vibrate?.([300, 80, 500, 60, 400]) } catch { /* sin vibración */ }
      setTimeout(() => this.temblando.set(false), dur)
    }))
  }

  ngAfterViewInit() { this.dibujarSismografo() }

  private dibujarSismografo() {
    const cv = this.labCanvas()?.nativeElement
    if (!cv) return
    const ctx = cv.getContext('2d')!
    const datos: number[] = []
    let fase = 0
    const loop = (now: number) => {
      this.labRaf = requestAnimationFrame(loop)
      const r = cv.getBoundingClientRect()
      if (!r.width || r.bottom < 0 || r.top > innerHeight) return
      const dpr = Math.min(devicePixelRatio || 1, 2)
      if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr) }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const W = r.width, H = r.height
      fase += .35
      let a = .015
      if (this.temblando()) {
        const rest = Math.max(0, this.labFin - now)
        a = Math.max(.015, this.ampLab() * Math.min(1, rest / 700) * (.55 + .45 * Math.sin(fase * .05) ** 2))
      }
      datos.push((Math.random() * 2 - 1) * a + Math.sin(fase) * a * .4)
      if (datos.length > W / 2) datos.shift()
      ctx.clearRect(0, 0, W, H)
      const tinta = getComputedStyle(cv).color
      ctx.strokeStyle = 'rgba(127,140,160,.18)'; ctx.lineWidth = 1
      for (let y = H / 4; y < H; y += H / 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      ctx.beginPath()
      datos.forEach((v, i) => { const x = W - (datos.length - i) * 2, y = H / 2 + v * H * .46; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) })
      const m = Math.abs(datos[datos.length - 1] ?? 0)
      ctx.strokeStyle = m > .5 ? '#E5484D' : m > .2 ? '#F5A524' : tinta
      ctx.lineWidth = 1.6; ctx.stroke()
      ctx.fillStyle = tinta
      ctx.font = '600 10px JetBrains Mono, monospace'
      ctx.fillText('SISMÓGRAFO · ' + (this.temblando() ? 'REGISTRANDO M' + this.mUlt().toFixed(1) : 'EN ESPERA'), 10, 16)
    }
    this.labRaf = requestAnimationFrame(loop)
  }

  private generarLibros() {
    const cols = ['#E5484D', '#3B82F6', '#F5A524', '#0E9F6E', '#8B5CF6', '#EC4899', '#14B8A6']
    const out: { x: number; y: number; w: number; h: number; c: string; dx: number; dy: number; r: number; d: number }[] = []
    let k = 0
    for (const base of [130, 185, 240]) {
      let x = 476
      while (x < 548) {
        const w = 8 + (k * 7) % 6, h = 32 + (k * 13) % 14
        out.push({ x, y: base - h, w, h, c: cols[k % cols.length], dx: -40 - (k * 23) % 90, dy: -(k % 3) * 6, r: -90 + (k * 37) % 180, d: (k % 5) * .08 })
        x += w + 2; k++
      }
    }
    return out
  }

  // ---------- Hero ----------
  quake = signal(false)
  magnitud = signal('0.0')
  seismo = this.trazaSismo()

  sacudir() {
    if (this.quake()) return
    this.sismo.sacudir(.45, 1100)
    this.quake.set(true)
    let n = 0
    const t = setInterval(() => {
      this.magnitud.set((Math.random() * 3 + 4.5).toFixed(1))
      if (++n > 9) { clearInterval(t); this.magnitud.set('0.0'); this.quake.set(false) }
    }, 90)
  }

  // ---------- Pasos ----------
  pasos = [
    { n: '01', t: 'Elige tu espacio', d: '¿Estudias o trabajas? Selecciona el ambiente donde pasas más tiempo.' },
    { n: '02', t: 'Evalúa riesgos y zonas', d: 'Responde preguntas guiadas y registra los obstáculos que encuentres.' },
    { n: '03', t: 'Practica decisiones', d: 'Resuelve escenarios cortos con eventos inesperados en 60 segundos.' },
    { n: '04', t: 'Revisa tu progreso', d: 'Consulta tu índice de preparación, tareas pendientes y logros.' },
  ]
  paso = signal(0)
  private timerPasos?: ReturnType<typeof setInterval>
  irPaso(i: number) {
    this.paso.set(i)
    clearInterval(this.timerPasos)
    this.timerPasos = setInterval(() => this.paso.update(p => (p + 1) % 4), 6000)
  }

  // ---------- Simulacros ----------
  sims = SIMULACROS.slice(0, 3)

  // ---------- Beneficios ----------
  tabBen = signal<TipoUsuario>('estudiante')
  beneficios: Record<TipoUsuario, { t: string; d: string }[]> = {
    estudiante: [
      { t: 'Reconoce riesgos al cambiar de aula', d: 'Una evaluación rápida para cada aula, laboratorio o biblioteca.' },
      { t: 'Ubica zonas seguras en segundos', d: 'Objetivo didáctico: identificar la señal en menos de 10 segundos.' },
      { t: 'Practica con micro-simulacros', d: 'Escenarios de 60 s que caben entre clase y clase.' },
      { t: 'Mide tu avance', d: 'Índice de preparación, rachas y logros desbloqueables.' },
    ],
    oficina: [
      { t: 'Revisa tu puesto de trabajo', d: 'Detecta muebles sin anclaje, monitores y objetos en altura.' },
      { t: 'Conoce rutas alternativas', d: 'Practica qué hacer si la salida habitual está bloqueada.' },
      { t: 'Refuerza la cultura preventiva', d: 'Comparte recursos y el checklist con tu equipo.' },
      { t: 'Complementa los simulacros oficiales', d: 'Mantén el hábito entre un simulacro institucional y otro.' },
    ],
  }

  // ---------- Testimonios ----------
  testimonios = TESTIMONIOS
  ti = signal(0)
  t = computed(() => this.testimonios[this.ti()])
  private timerTesti?: ReturnType<typeof setInterval>
  irTesti(i: number) {
    this.ti.set((i + this.testimonios.length) % this.testimonios.length)
    clearInterval(this.timerTesti)
    this.timerTesti = setInterval(() => this.ti.update(x => (x + 1) % this.testimonios.length), 7000)
  }

  // ---------- Recursos ----------
  tags = ['Todos', ...new Set(RECURSOS.map(r => r.tag))]
  tag = signal('Todos')
  recursos = computed(() => this.tag() === 'Todos' ? RECURSOS : RECURSOS.filter(r => r.tag === this.tag()))

  // ---------- FAQ ----------
  faqs = FAQS
  faqOpen = signal<number | null>(0)

  // ---------- Contacto ----------
  form = { nombre: '', correo: '', motivo: 'Consulta general', mensaje: '' }
  intento = signal(false)
  enviado = signal(false)
  enviando = signal(false)
  correoOk() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.correo) }
  enviar() {
    this.intento.set(true)
    if (!this.form.nombre.trim() || !this.correoOk() || this.form.mensaje.trim().length < 10) return
    this.enviando.set(true)
    setTimeout(() => { this.enviando.set(false); this.enviado.set(true) }, 900)
  }
  nuevoMensaje() {
    this.form = { nombre: '', correo: '', motivo: 'Consulta general', mensaje: '' }
    this.intento.set(false); this.enviado.set(false)
  }

  // ---------- Modales ----------
  modal = signal<null | 'compartir' | 'descarga' | 'privacidad'>(null)
  compartirTexto = signal('SismoListo: prepárate hoy ante un sismo.')
  abrirCompartir(texto = 'SismoListo: prepárate hoy ante un sismo.') { this.compartirTexto.set(texto); this.modal.set('compartir') }
  url = location.origin
  redes = computed(() => {
    const u = encodeURIComponent(this.url), t = encodeURIComponent(this.compartirTexto())
    return [
      { n: 'WhatsApp', i: 'whatsapp', c: '#25D366', h: `https://wa.me/?text=${t}%20${u}` },
      { n: 'Facebook', i: 'facebook', c: '#1877F2', h: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
      { n: 'LinkedIn', i: 'linkedin', c: '#0A66C2', h: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    ]
  })
  async copiar() {
    try { await navigator.clipboard.writeText(this.url); this.toast.mostrar('Enlace copiado al portapapeles') }
    catch { this.toast.mostrar('No se pudo copiar el enlace', 'bad') }
    this.modal.set(null)
  }

  // ---------- Accesos ----------
  probar(tipo: TipoUsuario, ruta = '/app') {
    if (!this.auth.logueado()) this.auth.invitado(tipo)
    this.router.navigateByUrl(ruta)
  }

  // ---------- Volver arriba ----------
  arriba = signal(false)
  @HostListener('window:scroll') onScroll() { this.arriba.set(window.scrollY > 900) }
  @HostListener('document:keydown.escape') esc() { this.modal.set(null) }
  subir() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

  qr = this.generarQR()

  ngOnInit() { this.irPaso(0); this.irTesti(0) }
  ngOnDestroy() { clearInterval(this.timerPasos); clearInterval(this.timerTesti); cancelAnimationFrame(this.labRaf) }

  /** Traza de sismograma: calma → sacudida → calma, duplicada para un bucle continuo. */
  private trazaSismo(): string {
    let seed = 7
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const W = 1400, pts: string[] = []
    for (let x = 0; x <= W; x += 4) {
      const c1 = Math.exp(-Math.pow((x - 420) / 70, 2)), c2 = Math.exp(-Math.pow((x - 1050) / 110, 2))
      const amp = 3 + c1 * 34 + c2 * 48
      pts.push(`${x},${(60 + (rnd() * 2 - 1) * amp).toFixed(1)}`)
    }
    const seg = pts.join(' ')
    const seg2 = pts.map(p => { const [x, y] = p.split(','); return `${+x + W},${y}` }).join(' ')
    return seg + ' ' + seg2
  }

  /** Patrón QR decorativo (no codifica datos reales). */
  private generarQR(): { x: number; y: number }[] {
    const N = 25, cells: { x: number; y: number }[] = []
    let seed = 42
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const finder = (x: number, y: number) => [[0, 0], [N - 7, 0], [0, N - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (finder(x, y)) {
        const lx = x < 7 ? x : x - (N - 7), ly = y < 7 ? y : y - (N - 7)
        const ring = Math.max(Math.abs(lx - 3), Math.abs(ly - 3))
        if (ring !== 2) cells.push({ x, y })
      } else if (rnd() > .52) cells.push({ x, y })
    }
    return cells
  }
}
