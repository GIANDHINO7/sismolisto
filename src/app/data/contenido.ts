import { EspacioDTO, PreguntaDTO } from '../models/EvaluacionDTO';
import { RecursoDTO, ItemChecklistDTO, TestimonioDTO } from '../models/ContenidoDTO';

export const ESPACIOS: EspacioDTO[] = [
  { id: 'aula', nombre: 'Aula', emoji: '🏫', descripcion: 'Carpetas, pizarra y una o dos puertas.', para: 'estudiante' },
  { id: 'laboratorio', nombre: 'Laboratorio', emoji: '🧪', descripcion: 'Equipos, estantes y sustancias.', para: 'estudiante' },
  { id: 'biblioteca', nombre: 'Biblioteca', emoji: '📚', descripcion: 'Estanterías altas y pasillos estrechos.', para: 'estudiante' },
  { id: 'oficina', nombre: 'Oficina abierta', emoji: '💼', descripcion: 'Escritorios, monitores y archivadores.', para: 'oficina' },
  { id: 'sala', nombre: 'Sala de reuniones', emoji: '🗣️', descripcion: 'Mesa grande, pantalla y ventanales.', para: 'oficina' },
  { id: 'comedor', nombre: 'Comedor / cafetería', emoji: '☕', descripcion: 'Microondas, vajilla y mucha gente.', para: 'ambos' },
]

export const PREGUNTAS: PreguntaDTO[] = [
  { id: 'p1', texto: '¿Sabes dónde está la señal de zona segura más cercana?', porque: 'Ubicarla en menos de 10 segundos reduce la duda en el momento del sismo.', riesgo: 'No identifico la zona segura del ambiente', severidad: 'alta' },
  { id: 'p2', texto: '¿La ruta hacia la salida está libre de mochilas, cajas o sillas?', porque: 'Una ruta obstruida provoca caídas y embudos durante la evacuación.', riesgo: 'Ruta de evacuación obstruida', severidad: 'alta' },
  { id: 'p3', texto: '¿Los estantes o muebles altos están fijados a la pared?', porque: 'Los muebles sin anclaje pueden volcarse con la sacudida.', riesgo: 'Muebles altos sin anclaje', severidad: 'alta', espacios: ['laboratorio', 'biblioteca', 'oficina', 'sala'] },
  { id: 'p4', texto: '¿Las repisas y la parte alta de los armarios están libres de objetos pesados?', porque: 'Los objetos en altura pueden caer sobre las personas durante la sacudida.', riesgo: 'Objetos pesados en altura', severidad: 'media' },
  { id: 'p5', texto: '¿Tu lugar habitual está lejos de ventanas y vidrios?', porque: 'Los vidrios pueden romperse y proyectar fragmentos.', riesgo: 'Puesto cercano a ventanas o vidrios', severidad: 'media' },
  { id: 'p6', texto: '¿La puerta de salida abre con facilidad y sin llave?', porque: 'Las puertas trabadas o con llave retrasan la salida.', riesgo: 'Puerta de salida con llave o trabada', severidad: 'alta' },
  { id: 'p7', texto: '¿Hay luces de emergencia o señalización visible sin electricidad?', porque: 'Los cortes de luz son frecuentes tras un sismo fuerte.', riesgo: 'Sin iluminación de emergencia visible', severidad: 'media' },
  { id: 'p8', texto: '¿Conoces el punto de reunión exterior de tu edificio?', porque: 'Saber a dónde ir evita que te quedes cerca de fachadas o cables.', riesgo: 'No conozco el punto de reunión externo', severidad: 'media' },
  { id: 'p9', texto: '¿Las sustancias o equipos peligrosos están bien almacenados?', porque: 'Los derrames pueden generar incendios o intoxicaciones.', riesgo: 'Sustancias o equipos mal almacenados', severidad: 'alta', espacios: ['laboratorio', 'comedor'] },
  { id: 'p10', texto: '¿Tienes a mano una linterna o el celular con batería?', porque: 'Te permite orientarte y comunicarte si la luz falla.', riesgo: 'Sin linterna ni batería de respaldo', severidad: 'baja' },
]

export const RECURSOS: RecursoDTO[] = [
  { id: 'r1', titulo: 'Reconocer zonas seguras señalizadas', texto: 'Aprende a distinguir la zona segura interna (columnas, vigas) de la externa, y cómo leer la señalética verde y blanca de tu institución.', tag: 'ZonaSegura', minutos: 4, fuente: 'Basado en orientaciones de INDECI' },
  { id: 'r2', titulo: 'Arma tu mochila de emergencia', texto: 'Agua, alimentos no perecibles, botiquín, linterna, radio, copias de documentos y artículos de higiene para 72 horas.', tag: 'MochilaEmergencia', minutos: 6, fuente: 'Basado en orientaciones de INDECI' },
  { id: 'r3', titulo: 'Observa obstáculos en tu entorno', texto: 'Identifica objetos que podrían caer, muebles sin anclaje y rutas obstruidas antes de que sea necesario usarlas.', tag: 'RiesgoFisico', minutos: 5, fuente: 'Material didáctico SismoListo' },
  { id: 'r4', titulo: 'Agáchate, cúbrete y sujétate', texto: 'Si no puedes evacuar a tiempo, protege tu cabeza y cuello junto a un elemento estructural y aléjate de ventanas.', tag: 'ZonaSegura', minutos: 3, fuente: 'Protocolo internacional de autoprotección' },
  { id: 'r5', titulo: 'Comunícate después del sismo', texto: 'Usa mensajes de texto o el servicio 119 para dejar mensajes de voz; evita saturar las líneas con llamadas.', tag: 'Comunicacion', minutos: 3, fuente: 'Basado en orientaciones del MTC' },
  { id: 'r6', titulo: 'Plan familiar y de equipo', texto: 'Define con tu familia o tu equipo de trabajo un punto de encuentro, roles y un contacto fuera de la ciudad.', tag: 'Comunicacion', minutos: 7, fuente: 'Material didáctico SismoListo' },
]

export const CHECKLIST: ItemChecklistDTO[] = [
  { id: 'c1', categoria: 'Mochila de emergencia', texto: 'Agua embotellada', detalle: 'Al menos 2 litros por persona.' },
  { id: 'c2', categoria: 'Mochila de emergencia', texto: 'Alimentos no perecibles', detalle: 'Barras, frutos secos, enlatados con abrefácil.' },
  { id: 'c3', categoria: 'Mochila de emergencia', texto: 'Botiquín básico', detalle: 'Gasas, alcohol, vendas y medicamentos personales.' },
  { id: 'c4', categoria: 'Mochila de emergencia', texto: 'Linterna y pilas de repuesto', detalle: 'Revisa que funcionen cada mes.' },
  { id: 'c5', categoria: 'Mochila de emergencia', texto: 'Radio portátil', detalle: 'Para recibir información oficial sin internet.' },
  { id: 'c6', categoria: 'Mochila de emergencia', texto: 'Copias de documentos', detalle: 'DNI, seguro y contactos en una bolsa hermética.' },
  { id: 'c7', categoria: 'Mi espacio', texto: 'Ubiqué la zona segura interna', detalle: 'Columnas o vigas cercanas a mi lugar.' },
  { id: 'c8', categoria: 'Mi espacio', texto: 'Recorrí la ruta de evacuación', detalle: 'Hasta el punto de reunión exterior.' },
  { id: 'c9', categoria: 'Mi espacio', texto: 'Despejé mi zona de trabajo', detalle: 'Sin cajas ni mochilas en el paso.' },
  { id: 'c10', categoria: 'Mi espacio', texto: 'Reporté un riesgo a mi institución', detalle: 'Por los canales oficiales de tu centro.' },
  { id: 'c11', categoria: 'Comunicación', texto: 'Guardé números de emergencia', detalle: '105 Policía · 116 Bomberos · 106 SAMU · 115 Defensa Civil.' },
  { id: 'c12', categoria: 'Comunicación', texto: 'Acordé un punto de encuentro familiar', detalle: 'Y un contacto que viva fuera de la ciudad.' },
  { id: 'c13', categoria: 'Comunicación', texto: 'Probé el servicio 119', detalle: 'Mensajes de voz en emergencias.' },
  { id: 'c14', categoria: 'Comunicación', texto: 'Tengo un cargador portátil', detalle: 'Con carga completa.' },
]

export const TESTIMONIOS: TestimonioDTO[] = [
  { nombre: 'Valeria R.', rol: 'Estudiante de Ingeniería · 6.º ciclo', iniciales: 'VR', color: '#0E9F6E', texto: 'Cambio de aula cuatro veces al día. Ahora al entrar busco la señal verde casi sin pensarlo, y el micro-simulacro de la salida bloqueada me hizo darme cuenta de que solo conocía una ruta.' },
  { nombre: 'Martín C.', rol: 'Analista de datos · oficina abierta', iniciales: 'MC', color: '#3B82F6', texto: 'La evaluación me hizo ver que tenía un archivador sin anclar justo detrás de mi silla. Lo reporté y lo fijaron esa misma semana.' },
  { nombre: 'Lucía P.', rol: 'Asistente de laboratorio', iniciales: 'LP', color: '#F5A524', texto: 'Los escenarios con corte de luz son los más útiles: en el laboratorio hay reactivos y equipos, y practicar qué hacer en 60 segundos me dio mucha más calma.' },
  { nombre: 'Diego A.', rol: 'Coordinador de RR. HH.', iniciales: 'DA', color: '#E5484D', texto: 'Lo usamos como complemento al simulacro institucional. El checklist de la mochila fue lo que más compartió el equipo.' },
]

export const FAQS = [
  { q: '¿SismoListo reemplaza los simulacros institucionales?', a: 'No. Es una herramienta académica de apoyo para reforzar hábitos. Participa siempre en los simulacros oficiales y sigue las indicaciones de tu brigada.' },
  { q: '¿Las rutas del mapa sirven durante una emergencia real?', a: 'No. Los planos son representaciones didácticas y ficticias. En una emergencia real sigue los planes de evacuación oficiales y la señalización de tu edificio.' },
  { q: '¿Se guardan mis datos?', a: 'Solo en el almacenamiento local de este navegador. No hay servidor ni sincronización; si borras los datos del navegador, tu progreso se pierde.' },
  { q: '¿Cuánto tiempo necesito al día?', a: 'Cada micro-simulacro dura como máximo 60 segundos y una evaluación de espacio unos 3 minutos. Con 5 minutos a la semana ya mantienes el hábito.' },
  { q: '¿Funciona en el celular?', a: 'Sí. La interfaz está pensada primero para móvil, con navegación inferior y botones grandes para usar con una mano.' },
]

export const EMERGENCIAS = [
  { n: '105', t: 'Policía' },
  { n: '116', t: 'Bomberos' },
  { n: '106', t: 'SAMU' },
  { n: '115', t: 'Defensa Civil' },
]
