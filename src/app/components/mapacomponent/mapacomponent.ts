import { Component, computed, signal } from '@angular/core';
import { Iconcomponent } from '../iconcomponent/iconcomponent';

type Tipo = 'segura' | 'salida' | 'obstaculo' | 'extintor' | 'reunion' | 'tu'

interface Punto { id: string; tipo: Tipo; x: number; y: number; t: string; d: string }
interface Plano { id: string; nombre: string; ancho: number; mesas: { x: number; y: number; w: number; h: number }[]; puntos: Punto[]; ruta: string; alterna: string; bloqueo: { x: number; y: number } }

const PLANOS: Plano[] = [
  {
    id: 'aula', nombre: 'Aula B-302', ancho: 720,
    mesas: Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => ({ x: 170 + c * 90, y: 120 + r * 70, w: 60, h: 30 }))).flat(),
    puntos: [
      { id: 'tu', tipo: 'tu', x: 440, y: 345, t: 'Tu ubicación', d: 'Carpeta habitual (fila 4). Desde aquí calculamos la ruta.' },
      { id: 'zs1', tipo: 'segura', x: 110, y: 110, t: 'Zona segura interna', d: 'Junto a la columna estructural. Úsala si no puedes evacuar mientras tiembla.' },
      { id: 'zs2', tipo: 'segura', x: 640, y: 250, t: 'Zona segura interna', d: 'Columna lateral, lejos de las ventanas.' },
      { id: 's1', tipo: 'salida', x: 660, y: 420, t: 'Salida principal', d: 'Puerta de doble hoja hacia el pasillo B. Abre hacia afuera.' },
      { id: 's2', tipo: 'salida', x: 60, y: 420, t: 'Salida secundaria', d: 'Puerta hacia la escalera de emergencia. Úsala si la principal está bloqueada.' },
      { id: 'o1', tipo: 'obstaculo', x: 560, y: 70, t: 'Estante sin anclaje', d: 'Estante de 1.8 m cerca de la pizarra. Riesgo de volcadura.' },
      { id: 'o2', tipo: 'obstaculo', x: 380, y: 30, t: 'Ventanales', d: 'Vidrio sin lámina de seguridad. Aléjate durante el sismo.' },
      { id: 'e1', tipo: 'extintor', x: 690, y: 330, t: 'Extintor PQS', d: 'Revisado hace 4 meses (dato ficticio).' },
    ],
    ruta: 'M440 345 V 400 H 620 V 420 H 660',
    alterna: 'M440 345 V 400 H 100 V 420 H 60',
    bloqueo: { x: 630, y: 420 },
  },
  {
    id: 'oficina', nombre: 'Oficina piso 7', ancho: 720,
    mesas: [
      ...Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => ({ x: 150 + c * 130, y: 110 + r * 90, w: 100, h: 44 }))).flat(),
      { x: 560, y: 90, w: 110, h: 150 },
    ],
    puntos: [
      { id: 'tu', tipo: 'tu', x: 330, y: 300, t: 'Tu escritorio', d: 'Puesto 7-C. Desde aquí calculamos la ruta.' },
      { id: 'zs1', tipo: 'segura', x: 110, y: 230, t: 'Zona segura interna', d: 'Columna central del ala oeste.' },
      { id: 'zs2', tipo: 'segura', x: 520, y: 360, t: 'Zona segura interna', d: 'Muro estructural junto al pasillo.' },
      { id: 's1', tipo: 'salida', x: 660, y: 420, t: 'Escalera de emergencia', d: 'Puerta cortafuego. No uses el ascensor.' },
      { id: 's2', tipo: 'salida', x: 60, y: 60, t: 'Escalera secundaria', d: 'Ruta alterna por el ala oeste.' },
      { id: 'o1', tipo: 'obstaculo', x: 615, y: 165, t: 'Sala de reuniones vidriada', d: 'Paredes de vidrio. Evítala durante el sismo.' },
      { id: 'o2', tipo: 'obstaculo', x: 260, y: 200, t: 'Archivador alto', d: 'Archivador metálico sin fijar a la pared.' },
      { id: 'e1', tipo: 'extintor', x: 690, y: 300, t: 'Extintor CO₂', d: 'Junto al gabinete eléctrico (dato ficticio).' },
    ],
    ruta: 'M330 300 V 400 H 620 V 420 H 660',
    alterna: 'M330 300 V 400 H 100 V 60 H 60',
    bloqueo: { x: 600, y: 400 },
  },
]

@Component({
  selector: 'app-mapa',
  imports: [Iconcomponent],
  templateUrl: './mapacomponent.html',
})
export class Mapacomponent {
  planos = PLANOS
  planoId = signal('aula')
  plano = computed(() => PLANOS.find(p => p.id === this.planoId())!)
  sel = signal<Punto | null>(null)
  verRuta = signal(true)
  bloqueada = signal(false)
  capas = signal<Record<Tipo, boolean>>({ segura: true, salida: true, obstaculo: true, extintor: true, reunion: true, tu: true })

  colores: Record<Tipo, string> = { segura: '#0E9F6E', salida: '#0E9F6E', obstaculo: '#E5484D', extintor: '#F5A524', reunion: '#3B82F6', tu: '#3B82F6' }
  leyenda: { tipo: Tipo; t: string }[] = [
    { tipo: 'segura', t: 'Zona segura interna' }, { tipo: 'salida', t: 'Salida / evacuación' },
    { tipo: 'obstaculo', t: 'Obstáculo o riesgo' }, { tipo: 'extintor', t: 'Extintor' },
  ]
  puntos = computed(() => this.plano().puntos.filter(p => this.capas()[p.tipo]))
  distancia = computed(() => this.bloqueada() ? (this.planoId() === 'aula' ? 21 : 34) : (this.planoId() === 'aula' ? 18 : 27))

  cambiarPlano(id: string) { this.planoId.set(id); this.sel.set(null); this.bloqueada.set(false) }
  alternarCapa(t: Tipo) { this.capas.update(c => ({ ...c, [t]: !c[t] })) }
  letra(t: Tipo) { return t === 'segura' ? 'ZS' : t === 'salida' ? '↗' : t === 'obstaculo' ? '!' : t === 'extintor' ? 'E' : '' }
}
