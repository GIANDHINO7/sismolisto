export type Severidad = 'alta' | 'media' | 'baja'

export interface RiesgoDTO {
  id: string
  titulo: string
  espacio: string
  severidad: Severidad
  nota: string
  fecha: string
  resuelto: boolean
  origen: 'evaluacion' | 'manual'
}
