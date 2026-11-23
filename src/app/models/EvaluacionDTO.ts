export type Respuesta = 'si' | 'no' | 'ns'

export interface EspacioDTO {
  id: string
  nombre: string
  emoji: string
  descripcion: string
  para: 'estudiante' | 'oficina' | 'ambos'
}

export interface PreguntaDTO {
  id: string
  texto: string
  porque: string
  /** Riesgo que se registra automáticamente si la respuesta es "no". */
  riesgo: string
  severidad: 'alta' | 'media' | 'baja'
  espacios?: string[]
}

export interface EvaluacionDTO {
  id: string
  espacio: string
  fecha: string
  respuestas: Record<string, Respuesta>
  puntaje: number
  completa: boolean
}
