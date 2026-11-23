import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Authservice } from './authservice';
import { EvaluacionDTO, Respuesta } from '../models/EvaluacionDTO';
import { RiesgoDTO, Severidad } from '../models/RiesgoDTO';
import { ResultadoDTO } from '../models/SimulacroDTO';
import { CHECKLIST, ESPACIOS, PREGUNTAS } from '../data/contenido';
import { SIMULACROS } from '../data/simulacros';
import { borrar, guardar, leer, uid } from '../shared/storage';

export interface Borrador { espacio: string; paso: number; respuestas: Record<string, Respuesta> }

interface Estado {
  evaluaciones: EvaluacionDTO[]
  riesgos: RiesgoDTO[]
  resultados: ResultadoDTO[]
  checklist: string[]
  borrador: Borrador | null
}

const VACIO: Estado = { evaluaciones: [], riesgos: [], resultados: [], checklist: [], borrador: null }

/** Datos del usuario, persistidos en localStorage con una clave por cuenta. */
@Injectable({ providedIn: 'root' })
export class Datosservice {
  private auth = inject(Authservice)
  private estado = signal<Estado>(VACIO)
  private clave = computed(() => this.auth.usuario() ? 'sl.datos.' + this.auth.usuario()!.correo : null)

  evaluaciones = computed(() => this.estado().evaluaciones)
  riesgos = computed(() => this.estado().riesgos)
  resultados = computed(() => this.estado().resultados)
  checklist = computed(() => new Set(this.estado().checklist))
  borrador = computed(() => this.estado().borrador)

  riesgosAbiertos = computed(() => this.riesgos().filter(r => !r.resuelto))

  /** Mejor puntaje por simulacro. */
  mejores = computed(() => {
    const m: Partial<Record<string, number>> = {}
    for (const r of this.resultados()) m[r.simId] = Math.max(m[r.simId] ?? 0, r.puntaje)
    return m
  })

  pctEvaluacion = computed(() => {
    const ult: Record<string, number> = {}
    for (const e of [...this.evaluaciones()].reverse()) if (e.completa) ult[e.espacio] = e.puntaje
    const v = Object.values(ult)
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0
  })
  pctChecklist = computed(() => Math.round(this.estado().checklist.length / CHECKLIST.length * 100))
  pctSimulacros = computed(() => {
    const m = this.mejores()
    return Math.round(SIMULACROS.reduce((a, s) => a + (m[s.id] ?? 0), 0) / SIMULACROS.length)
  })
  pctRiesgos = computed(() => {
    const t = this.riesgos().length
    return t ? Math.round(this.riesgos().filter(r => r.resuelto).length / t * 100) : 0
  })

  /** Índice de preparación (0-100) ponderado. */
  preparacion = computed(() => Math.round(
    this.pctEvaluacion() * .35 + this.pctSimulacros() * .3 + this.pctChecklist() * .25 + this.pctRiesgos() * .1
  ))

  nivel = computed(() => {
    const p = this.preparacion()
    return p >= 80 ? 'Muy preparado' : p >= 55 ? 'Bien encaminado' : p >= 25 ? 'En progreso' : 'Comenzando'
  })

  /** Días consecutivos con actividad. */
  racha = computed(() => {
    const dias = new Set<string>([
      ...this.evaluaciones().map(e => e.fecha.slice(0, 10)),
      ...this.resultados().map(r => r.fecha.slice(0, 10)),
      ...this.riesgos().map(r => r.fecha.slice(0, 10)),
    ])
    let n = 0
    const d = new Date()
    if (!dias.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
    while (dias.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1) }
    return n
  })

  logros = computed(() => {
    const ev = this.evaluaciones().filter(e => e.completa)
    const res = this.resultados()
    const m = this.mejores()
    return [
      { em: '🧭', t: 'Primer paso', d: 'Completa tu primera evaluación', ok: ev.length > 0 },
      { em: '⏱️', t: 'Reflejos', d: 'Termina un micro-simulacro', ok: res.length > 0 },
      { em: '🎯', t: 'Decisión perfecta', d: 'Obtén 100 en un simulacro', ok: res.some(r => r.puntaje === 100) },
      { em: '🗺️', t: 'Explorador', d: 'Evalúa 3 espacios distintos', ok: new Set(ev.map(e => e.espacio)).size >= 3 },
      { em: '🎒', t: 'Mochila lista', d: 'Completa la sección mochila', ok: CHECKLIST.filter(c => c.categoria === 'Mochila de emergencia').every(c => this.checklist().has(c.id)) },
      { em: '🛠️', t: 'Solucionador', d: 'Resuelve 3 riesgos', ok: this.riesgos().filter(r => r.resuelto).length >= 3 },
      { em: '🏅', t: 'Todoterreno', d: 'Prueba todos los simulacros', ok: SIMULACROS.every(s => m[s.id] !== undefined) },
      { em: '🔥', t: 'Constancia', d: 'Racha de 3 días', ok: this.racha() >= 3 },
    ]
  })

  actividad = computed(() => {
    const items: { fecha: string; texto: string; color: string }[] = [
      ...this.evaluaciones().filter(e => e.completa).map(e => ({ fecha: e.fecha, texto: `Evaluaste ${nombreEspacio(e.espacio)} · ${e.puntaje}%`, color: 'var(--safe)' })),
      ...this.resultados().map(r => ({ fecha: r.fecha, texto: `Simulacro "${SIMULACROS.find(s => s.id === r.simId)?.titulo}" · ${r.puntaje} pts`, color: 'var(--info)' })),
      ...this.riesgos().map(r => ({ fecha: r.fecha, texto: `Riesgo registrado: ${r.titulo}`, color: r.severidad === 'alta' ? 'var(--danger)' : 'var(--alert)' })),
    ]
    return items.sort((a, b) => b.fecha.localeCompare(a.fecha))
  })

  constructor() {
    const k0 = this.clave()
    if (k0) this.estado.set({ ...VACIO, ...leer<Estado>(k0, VACIO) })
    effect(() => {
      const k = this.clave()
      this.estado.set(k ? { ...VACIO, ...leer<Estado>(k, VACIO) } : VACIO)
    })
  }

  private set(cambio: (e: Estado) => Partial<Estado>) {
    this.estado.update(e => ({ ...e, ...cambio(e) }))
    const k = this.clave()
    if (k) guardar(k, this.estado())
  }

  // ---------- Evaluaciones ----------
  guardarBorrador(b: Borrador | null) { this.set(() => ({ borrador: b })) }

  completarEvaluacion(espacio: string, respuestas: Record<string, Respuesta>): EvaluacionDTO {
    const preguntas = preguntasDe(espacio)
    const pts = preguntas.reduce((a, p) => a + (respuestas[p.id] === 'si' ? 1 : respuestas[p.id] === 'ns' ? .4 : 0), 0)
    const ev: EvaluacionDTO = { id: uid(), espacio, fecha: new Date().toISOString(), respuestas, puntaje: Math.round(pts / preguntas.length * 100), completa: true }
    const nuevos: RiesgoDTO[] = preguntas
      .filter(p => respuestas[p.id] === 'no')
      .filter(p => !this.riesgos().some(r => !r.resuelto && r.titulo === p.riesgo && r.espacio === espacio))
      .map(p => ({ id: uid(), titulo: p.riesgo, espacio, severidad: p.severidad, nota: p.porque, fecha: new Date().toISOString(), resuelto: false, origen: 'evaluacion' }))
    this.set(e => ({ evaluaciones: [...e.evaluaciones, ev], riesgos: [...nuevos, ...e.riesgos], borrador: null }))
    return ev
  }

  // ---------- Riesgos ----------
  agregarRiesgo(titulo: string, espacio: string, severidad: Severidad, nota: string) {
    const r: RiesgoDTO = { id: uid(), titulo, espacio, severidad, nota, fecha: new Date().toISOString(), resuelto: false, origen: 'manual' }
    this.set(e => ({ riesgos: [r, ...e.riesgos] }))
  }
  alternarRiesgo(id: string) { this.set(e => ({ riesgos: e.riesgos.map(r => r.id === id ? { ...r, resuelto: !r.resuelto } : r) })) }
  eliminarRiesgo(id: string) { this.set(e => ({ riesgos: e.riesgos.filter(r => r.id !== id) })) }

  // ---------- Simulacros ----------
  registrarResultado(r: ResultadoDTO) { this.set(e => ({ resultados: [...e.resultados, r] })) }

  // ---------- Checklist ----------
  alternarItem(id: string) {
    this.set(e => ({ checklist: e.checklist.includes(id) ? e.checklist.filter(x => x !== id) : [...e.checklist, id] }))
  }

  reiniciar() {
    const k = this.clave()
    if (k) borrar(k)
    this.estado.set(VACIO)
  }
}

export function preguntasDe(espacio: string) {
  return PREGUNTAS.filter(p => !p.espacios || p.espacios.includes(espacio))
}

export function nombreEspacio(id: string) {
  return ESPACIOS.find(e => e.id === id)?.nombre ?? id
}
