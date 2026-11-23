import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Datosservice, nombreEspacio } from '../../services/datosservice';
import { Toastservice } from '../../services/toastservice';
import { ESPACIOS } from '../../data/contenido';
import { RiesgoDTO, Severidad } from '../../models/RiesgoDTO';

type Filtro = 'abiertos' | 'resueltos' | 'todos' | Severidad

@Component({
  selector: 'app-riesgos',
  imports: [FormsModule, DatePipe, RouterLink, Iconcomponent],
  templateUrl: './riesgoscomponent.html',
})
export class Riesgoscomponent {
  datos = inject(Datosservice)
  private toast = inject(Toastservice)
  espacios = ESPACIOS
  nombreEspacio = nombreEspacio

  filtros: { id: Filtro; t: string }[] = [
    { id: 'abiertos', t: 'Abiertos' }, { id: 'resueltos', t: 'Resueltos' }, { id: 'todos', t: 'Todos' },
    { id: 'alta', t: '🔴 Alta' }, { id: 'media', t: '🟠 Media' }, { id: 'baja', t: '🔵 Baja' },
  ]
  filtro = signal<Filtro>('abiertos')
  busqueda = signal('')

  lista = computed(() => {
    const f = this.filtro(), q = this.busqueda().toLowerCase().trim()
    const orden = { alta: 0, media: 1, baja: 2 }
    return this.datos.riesgos()
      .filter(r => f === 'todos' ? true : f === 'abiertos' ? !r.resuelto : f === 'resueltos' ? r.resuelto : r.severidad === f)
      .filter(r => !q || r.titulo.toLowerCase().includes(q) || nombreEspacio(r.espacio).toLowerCase().includes(q))
      .sort((a, b) => +a.resuelto - +b.resuelto || orden[a.severidad] - orden[b.severidad])
  })

  conteo = computed(() => {
    const ab = this.datos.riesgosAbiertos()
    return { alta: ab.filter(r => r.severidad === 'alta').length, media: ab.filter(r => r.severidad === 'media').length, baja: ab.filter(r => r.severidad === 'baja').length }
  })

  // ---------- Nuevo ----------
  nuevo = signal(false)
  form = { titulo: '', espacio: 'aula', severidad: 'media' as Severidad, nota: '' }
  intento = signal(false)
  guardar() {
    this.intento.set(true)
    if (this.form.titulo.trim().length < 4) return
    this.datos.agregarRiesgo(this.form.titulo.trim(), this.form.espacio, this.form.severidad, this.form.nota.trim())
    this.toast.mostrar('Riesgo registrado')
    this.form = { titulo: '', espacio: this.form.espacio, severidad: 'media', nota: '' }
    this.intento.set(false)
    this.nuevo.set(false)
    this.filtro.set('abiertos')
  }

  alternar(r: RiesgoDTO) {
    this.datos.alternarRiesgo(r.id)
    this.toast.mostrar(r.resuelto ? 'Riesgo reabierto' : '¡Riesgo resuelto! +preparación', r.resuelto ? 'warn' : 'ok')
  }

  // ---------- Eliminar ----------
  borrando = signal<RiesgoDTO | null>(null)
  confirmarBorrado() {
    const r = this.borrando()
    if (r) { this.datos.eliminarRiesgo(r.id); this.toast.mostrar('Riesgo eliminado', 'bad') }
    this.borrando.set(null)
  }
}
