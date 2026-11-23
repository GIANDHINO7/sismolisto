import { Component, computed, inject } from '@angular/core';
import { Iconcomponent } from '../iconcomponent/iconcomponent';
import { Datosservice } from '../../services/datosservice';
import { Toastservice } from '../../services/toastservice';
import { CHECKLIST, EMERGENCIAS } from '../../data/contenido';

@Component({
  selector: 'app-checklist',
  imports: [Iconcomponent],
  template: `
  <div class="page-head">
    <div><h2>Mi checklist</h2><p>Tu mochila de emergencia, tu espacio y tu plan de comunicación.</p></div>
    <div style="min-width:240px">
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px"><b>{{ datos.checklist().size }} de {{ total }} listos</b><span style="font-family:var(--f-mono)">{{ datos.pctChecklist() }}%</span></div>
      <div class="bar" style="height:10px"><i [style.width.%]="datos.pctChecklist()"></i></div>
    </div>
  </div>

  <div class="grid-2" style="grid-template-columns:1.4fr 1fr;align-items:start">
    <div>
      @for (c of categorias(); track c.nombre) {
        <section class="cl-cat">
          <h3>{{ c.nombre }} <span class="chip" [class.chip-safe]="c.hechos === c.items.length">{{ c.hechos }}/{{ c.items.length }}</span></h3>
          <div class="cl-items">
            @for (it of c.items; track it.id) {
              <div class="cl-item" [class.ok]="datos.checklist().has(it.id)" role="checkbox" tabindex="0"
                   [attr.aria-checked]="datos.checklist().has(it.id)" (click)="alternar(it.id)" (keydown.space)="$event.preventDefault(); alternar(it.id)" (keydown.enter)="alternar(it.id)">
                <span class="box"><app-icon name="check" [stroke]="3" /></span>
                <div><b>{{ it.texto }}</b><small>{{ it.detalle }}</small></div>
              </div>
            }
          </div>
        </section>
      }
    </div>
    <div style="display:grid;gap:16px;position:sticky;top:88px">
      <div class="card dark">
        <span class="eyebrow" style="color:var(--safe-2)">Números de emergencia · Perú</span>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">
          @for (e of emergencias; track e.n) {
            <a [href]="'tel:' + e.n" style="padding:14px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);text-decoration:none">
              <b style="font-family:var(--f-mono);font-size:24px;color:#fff">{{ e.n }}</b><br><small style="color:rgba(255,255,255,.6)">{{ e.t }}</small>
            </a>
          }
        </div>
        <p style="font-size:13px;margin-top:14px">Servicio 119: deja mensajes de voz cuando las líneas estén saturadas.</p>
      </div>
      <div class="card">
        <h3 class="ct">Consejo</h3>
        <p style="color:var(--ink-2);font-size:14px">Revisa tu mochila cada 6 meses: cambia el agua, verifica fechas de vencimiento y prueba las pilas de la linterna.</p>
      </div>
    </div>
  </div>`,
})
export class Checklistcomponent {
  datos = inject(Datosservice)
  private toast = inject(Toastservice)
  emergencias = EMERGENCIAS
  total = CHECKLIST.length

  categorias = computed(() => {
    const set = this.datos.checklist()
    return [...new Set(CHECKLIST.map(c => c.categoria))].map(nombre => {
      const items = CHECKLIST.filter(c => c.categoria === nombre)
      return { nombre, items, hechos: items.filter(i => set.has(i.id)).length }
    })
  })

  alternar(id: string) {
    const antes = this.datos.pctChecklist()
    this.datos.alternarItem(id)
    const cat = CHECKLIST.find(c => c.id === id)!.categoria
    const completa = CHECKLIST.filter(c => c.categoria === cat).every(c => this.datos.checklist().has(c.id))
    if (completa && this.datos.checklist().has(id)) this.toast.mostrar(`¡Completaste "${cat}"!`)
    else if (this.datos.pctChecklist() === 100 && antes < 100) this.toast.mostrar('¡Checklist completo!')
  }
}
