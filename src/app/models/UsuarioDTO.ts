export type TipoUsuario = 'estudiante' | 'oficina'

export interface UsuarioDTO {
  nombre: string
  correo: string
  tipo: TipoUsuario
  institucion?: string
  creado: string
}

export interface CuentaDemo extends UsuarioDTO {
  /** Contraseña ficticia: solo se guarda en este navegador para la demostración. */
  clave: string
}
