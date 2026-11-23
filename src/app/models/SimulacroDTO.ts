export type Calidad = 'good' | 'mid' | 'bad'

export interface OpcionDTO {
  texto: string
  calidad: Calidad
  feedback: string
}

export interface EscenaDTO {
  evento: string
  titulo: string
  texto: string
  segundos: number
  sacudida?: boolean
  opciones: OpcionDTO[]
}

export interface SimulacroDTO {
  id: string
  titulo: string
  resumen: string
  espacio: 'Aula' | 'Oficina' | 'Laboratorio' | 'Biblioteca'
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado'
  color: string
  escenas: EscenaDTO[]
}

export interface ResultadoDTO {
  simId: string
  puntaje: number
  fecha: string
  decisiones: Calidad[]
  segundos: number
}
