import { Injectable, computed, signal } from '@angular/core';
import { CuentaDemo, UsuarioDTO, TipoUsuario } from '../models/UsuarioDTO';
import { borrar, guardar, leer } from '../shared/storage';

const K_CUENTAS = 'sl.cuentas'
const K_SESION = 'sl.sesion'

/** Cuentas de demostración precargadas (una por rol) para probar la app al instante. */
export const DEMOS: Record<TipoUsuario, CuentaDemo> = {
  estudiante: { nombre: 'Valeria Ramos', correo: 'estudiante@sismolisto.pe', clave: 'Sismo2026', tipo: 'estudiante', institucion: 'Universidad · Campus Monterrico', creado: '2026-08-01T10:00:00.000Z' },
  oficina: { nombre: 'Diego Torres', correo: 'oficina@sismolisto.pe', clave: 'Sismo2026', tipo: 'oficina', institucion: 'Oficina · Piso 7, San Isidro', creado: '2026-08-01T10:00:00.000Z' },
}

/**
 * Autenticación de DEMOSTRACIÓN: las cuentas viven solo en este navegador.
 * No hay servidor; no usar contraseñas reales.
 */
@Injectable({ providedIn: 'root' })
export class Authservice {
  usuario = signal<UsuarioDTO | null>(leer<UsuarioDTO | null>(K_SESION, null))
  logueado = computed(() => !!this.usuario())
  iniciales = computed(() => (this.usuario()?.nombre ?? '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase())
  primerNombre = computed(() => (this.usuario()?.nombre ?? '').split(' ')[0])
  /** Rol seleccionado en el portal de acceso (antes de iniciar sesión). */
  rolElegido = signal<TipoUsuario>(leer<TipoUsuario>('sl.rol', 'estudiante'))
  /** Rol efectivo: el de la sesión o el elegido en el portal. */
  rol = computed<TipoUsuario>(() => this.usuario()?.tipo ?? this.rolElegido())

  elegirRol(t: TipoUsuario) { this.rolElegido.set(t); guardar('sl.rol', t) }

  private cuentas(): CuentaDemo[] {
    const c = leer<CuentaDemo[]>(K_CUENTAS, [])
    const faltan = Object.values(DEMOS).filter(d => !c.some(x => x.correo === d.correo))
    return faltan.length ? [...c, ...faltan] : c
  }

  registrar(nombre: string, correo: string, clave: string, tipo: TipoUsuario): string | null {
    correo = correo.trim().toLowerCase()
    const cuentas = this.cuentas()
    if (cuentas.some(c => c.correo === correo)) return 'Ya existe una cuenta de demostración con ese correo.'
    const cuenta: CuentaDemo = { nombre: nombre.trim(), correo, clave, tipo, creado: new Date().toISOString() }
    guardar(K_CUENTAS, [...cuentas, cuenta])
    this.abrirSesion(cuenta)
    return null
  }

  login(correo: string, clave: string, tipo?: TipoUsuario): string | null {
    const c = this.cuentas().find(x => x.correo === correo.trim().toLowerCase())
    if (!c || c.clave !== clave) return 'Correo o contraseña incorrectos.'
    if (tipo && c.tipo !== tipo) return `Esta cuenta es de tipo ${c.tipo === 'oficina' ? 'Oficina' : 'Estudiante'}. Cambia de portal para ingresar.`
    this.abrirSesion(c)
    return null
  }

  /** Acceso rápido para probar la demo sin registrarse. */
  invitado(tipo: TipoUsuario = 'estudiante') {
    this.abrirSesion({ nombre: tipo === 'estudiante' ? 'Invitado Estudiante' : 'Invitado Oficina', correo: `invitado-${tipo}@sismolisto.demo`, tipo, creado: new Date().toISOString() })
  }

  actualizar(cambios: Partial<UsuarioDTO>) {
    const u = this.usuario()
    if (!u) return
    const nuevo = { ...u, ...cambios }
    this.usuario.set(nuevo)
    guardar(K_SESION, nuevo)
    guardar(K_CUENTAS, this.cuentas().map(c => c.correo === u.correo ? { ...c, ...cambios } : c))
  }

  logout() {
    this.usuario.set(null)
    borrar(K_SESION)
  }

  private abrirSesion(c: UsuarioDTO) {
    const { nombre, correo, tipo, creado, institucion } = c
    const u: UsuarioDTO = { nombre, correo, tipo, creado, institucion }
    this.usuario.set(u)
    guardar(K_SESION, u)
  }
}
