export interface RecursoDTO {
  id: string
  titulo: string
  texto: string
  tag: string
  minutos: number
  fuente: string
}

export interface ItemChecklistDTO {
  id: string
  texto: string
  detalle: string
  categoria: string
}

export interface TestimonioDTO {
  nombre: string
  rol: string
  iniciales: string
  color: string
  texto: string
}
