import { Injectable, signal } from '@angular/core';
import { guardar, leer } from '../shared/storage';

export interface Pulso { x: number; y: number; fuerza: number; t: number }

/**
 * Motor de "sismo" global: sacude la interfaz, sintetiza el retumbo con WebAudio
 * (no usa archivos de audio) y emite pulsos que los fondos sísmicos convierten en ondas.
 */
@Injectable({ providedIn: 'root' })
export class Sismoservice {
  activo = signal(false)
  intensidad = signal(0)
  sonido = signal(leer<boolean>('sl.sonido', true))
  pulso = signal<Pulso | null>(null)
  alerta = signal(false)
  /** Mejor puntaje del simulacro de alerta. */
  mejorAlerta = signal(leer<number>('sl.alerta.mejor', 0))

  private ctx?: AudioContext
  private reducido = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  alternarSonido() {
    this.sonido.update(s => !s)
    guardar('sl.sonido', this.sonido())
  }

  /** Emite un epicentro en coordenadas de ventana (los fondos lo convierten en ondas). */
  epicentro(x: number, y: number, fuerza = 1) {
    this.pulso.set({ x, y, fuerza, t: performance.now() })
  }

  /** Sacude toda la página. fuerza 0..1 */
  sacudir(fuerza = .7, ms = 2600) {
    if (this.activo()) return
    this.activo.set(true)
    this.intensidad.set(fuerza)
    const root = document.documentElement
    if (!this.reducido) {
      root.style.setProperty('--amp', String(fuerza))
      root.classList.add('sismo-on')
    }
    this.epicentro(innerWidth * (.3 + Math.random() * .4), innerHeight * (.3 + Math.random() * .4), 1.6 * fuerza + .4)
    try { navigator.vibrate?.([200, 80, 400, 60, 300, 100, 500]) } catch { /* sin vibración */ }
    this.retumbo(fuerza, ms)
    setTimeout(() => {
      root.classList.remove('sismo-on')
      this.activo.set(false)
      this.intensidad.set(0)
    }, ms)
  }

  /** Temblor continuo (para el simulacro). Devuelve una función que lo detiene; `ajustar` cambia la fuerza. */
  temblor(fuerza = .6): { detener: () => void; ajustar: (f: number) => void } {
    const root = document.documentElement
    const aplicar = (f: number) => {
      this.intensidad.set(f)
      if (!this.reducido) { root.style.setProperty('--amp', String(f)); root.classList.add('sismo-on') }
    }
    aplicar(fuerza)
    this.activo.set(true)
    const ctx = this.audio()
    let g: GainNode | undefined, src: AudioBufferSourceNode | undefined
    if (ctx) {
      const len = ctx.sampleRate * 2
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const d = buf.getChannelData(0)
      let last = 0
      for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5 }
      src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 150
      g = ctx.createGain(); g.gain.value = 0
      g.gain.linearRampToValueAtTime(.8 * fuerza, ctx.currentTime + .6)
      src.connect(lp).connect(g).connect(ctx.destination)
      src.start()
    }
    const vib = setInterval(() => { try { navigator.vibrate?.([180, 60, 220]) } catch { /* */ } }, 500)
    return {
      ajustar: (f: number) => { aplicar(f); if (g && ctx) g.gain.linearRampToValueAtTime(.8 * f, ctx.currentTime + .3) },
      detener: () => {
        clearInterval(vib)
        root.classList.remove('sismo-on')
        this.activo.set(false); this.intensidad.set(0)
        if (g && ctx && src) { g.gain.linearRampToValueAtTime(0, ctx.currentTime + .5); src.stop(ctx.currentTime + .6) }
      },
    }
  }

  /** Retumbo grave: ruido marrón filtrado con envolvente de onda P → S. */
  retumbo(fuerza: number, ms: number) {
    const ctx = this.audio()
    if (!ctx) return
    const dur = ms / 1000
    const len = Math.floor(ctx.sampleRate * dur)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      last = (last + .02 * w) / 1.02
      const p = i / len
      // llegada de onda P suave y luego onda S más fuerte
      const env = Math.min(1, p * 8) * .35 + Math.exp(-Math.pow((p - .45) / .22, 2)) * .9
      d[i] = last * 3.5 * env * (1 - Math.pow(p, 4))
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'; lp.frequency.value = 160
    const g = ctx.createGain()
    g.gain.value = .9 * fuerza
    src.connect(lp).connect(g).connect(ctx.destination)
    src.start()
  }

  /** Sirena de alerta (barrido de frecuencia). Devuelve una función para detenerla. */
  sirena(seg = 4): () => void {
    const ctx = this.audio()
    if (!ctx) return () => {}
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sawtooth'
    const t0 = ctx.currentTime
    for (let i = 0; i < seg * 2; i++) {
      o.frequency.setValueAtTime(620, t0 + i * .5)
      o.frequency.linearRampToValueAtTime(1050, t0 + i * .5 + .25)
      o.frequency.linearRampToValueAtTime(620, t0 + i * .5 + .5)
    }
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(.12, t0 + .05)
    g.gain.setValueAtTime(.12, t0 + seg - .1)
    g.gain.linearRampToValueAtTime(0, t0 + seg)
    o.connect(lp).connect(g).connect(ctx.destination)
    o.start(); o.stop(t0 + seg)
    return () => { try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(0, ctx.currentTime); o.stop() } catch { /* ya detenido */ } }
  }

  /** Pitido corto de interfaz. */
  bip(freq = 880, ms = 90, vol = .08) {
    const ctx = this.audio()
    if (!ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'; o.frequency.value = freq
    const t = ctx.currentTime
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(.0001, t + ms / 1000)
    o.connect(g).connect(ctx.destination)
    o.start(); o.stop(t + ms / 1000)
  }

  private audio(): AudioContext | undefined {
    if (!this.sonido()) return undefined
    try {
      this.ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)()
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return this.ctx
    } catch { return undefined }
  }
}
